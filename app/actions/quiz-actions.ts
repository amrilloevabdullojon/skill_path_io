"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { ProgressStatus, QuestionType } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { resolveLearningUser } from "@/lib/learning-user";
import { prisma } from "@/lib/prisma";

type QuizAttemptPayload = {
  trackSlug: string;
  moduleId: string;
  quizId: string;
  answers: Record<string, string[]>;
};

type QuizAttemptResult = {
  ok: boolean;
  score: number;
  passed: boolean;
  passingScore: number;
  totalQuestions: number;
  correctAnswers: number;
  certificateIssued: boolean;
  trackCompleted: boolean;
  wrongAnswers: Array<{
    questionId: string;
    question: string;
    options: Array<{ id: string; text: string }>;
    userAnswers: string[];
    correctAnswers: string[];
  }>;
  message?: string;
};

function normalizeAnswerList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).sort();
}

function answersMatch(selected: string[], expected: string[]) {
  if (selected.length !== expected.length) {
    return false;
  }

  return selected.every((item, index) => item === expected[index]);
}

function parseQuestionOptions(options: unknown) {
  if (!Array.isArray(options)) {
    return [] as Array<{ id: string; text: string }>;
  }

  return options
    .map((item, index) => {
      if (typeof item === "string") {
        return { id: `opt-${index + 1}`, text: item };
      }

      if (
        typeof item === "object" &&
        item !== null &&
        "text" in item &&
        typeof (item as { text: unknown }).text === "string"
      ) {
        const option = item as { id?: unknown; text: string };
        return {
          id: typeof option.id === "string" ? option.id : `opt-${index + 1}`,
          text: option.text,
        };
      }

      return null;
    })
    .filter((item): item is { id: string; text: string } => Boolean(item));
}

export async function submitQuizAttempt(payload: QuizAttemptPayload): Promise<QuizAttemptResult> {
  if (!payload.trackSlug || !payload.moduleId || !payload.quizId) {
    return {
      ok: false,
      score: 0,
      passed: false,
      passingScore: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      certificateIssued: false,
      trackCompleted: false,
      wrongAnswers: [],
      message: "Invalid payload.",
    };
  }

  const session = await getServerSession(authOptions);
  const user = await resolveLearningUser(session?.user?.email);

  if (!user) {
    return {
      ok: false,
      score: 0,
      passed: false,
      passingScore: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      certificateIssued: false,
      trackCompleted: false,
      wrongAnswers: [],
      message: "No local user found.",
    };
  }

  const quiz = await prisma.quiz.findFirst({
    where: {
      id: payload.quizId,
      moduleId: payload.moduleId,
      module: {
        track: {
          slug: payload.trackSlug,
        },
      },
    },
    include: {
      module: {
        select: {
          id: true,
          trackId: true,
        },
      },
      questions: {
        orderBy: {
          id: "asc",
        },
        select: {
          id: true,
          text: true,
          type: true,
          options: true,
          correctAnswer: true,
        },
      },
    },
  });

  if (!quiz) {
    return {
      ok: false,
      score: 0,
      passed: false,
      passingScore: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      certificateIssued: false,
      trackCompleted: false,
      wrongAnswers: [],
      message: "Quiz not found.",
    };
  }

  const totalQuestions = quiz.questions.length;
  if (totalQuestions === 0) {
    return {
      ok: false,
      score: 0,
      passed: false,
      passingScore: quiz.passingScore,
      totalQuestions: 0,
      correctAnswers: 0,
      certificateIssued: false,
      trackCompleted: false,
      wrongAnswers: [],
      message: "Quiz has no questions.",
    };
  }

  let correctAnswers = 0;
  const wrongAnswers: QuizAttemptResult["wrongAnswers"] = [];
  for (const question of quiz.questions) {
    const selectedAnswers = normalizeAnswerList(payload.answers[question.id] ?? []);
    const expectedAnswers = normalizeAnswerList(question.correctAnswer);
    const isQuestionCorrect = answersMatch(selectedAnswers, expectedAnswers);
    const parsedOptions = parseQuestionOptions(question.options);

    if (question.type === QuestionType.SINGLE && selectedAnswers.length > 1) {
      wrongAnswers.push({
        questionId: question.id,
        question: question.text,
        options: parsedOptions,
        userAnswers: selectedAnswers,
        correctAnswers: expectedAnswers,
      });
      continue;
    }

    if (isQuestionCorrect) {
      correctAnswers += 1;
    } else {
      wrongAnswers.push({
        questionId: question.id,
        question: question.text,
        options: parsedOptions,
        userAnswers: selectedAnswers,
        correctAnswers: expectedAnswers,
      });
    }
  }

  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = score >= quiz.passingScore;

  const existingProgress = await prisma.userProgress.findUnique({
    where: {
      userId_moduleId: {
        userId: user.id,
        moduleId: quiz.module.id,
      },
    },
  });

  if (passed) {
    await prisma.userProgress.upsert({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId: quiz.module.id,
        },
      },
      update: {
        status: ProgressStatus.COMPLETED,
        score,
        completedAt: existingProgress?.completedAt ?? new Date(),
      },
      create: {
        userId: user.id,
        moduleId: quiz.module.id,
        status: ProgressStatus.COMPLETED,
        score,
        completedAt: new Date(),
      },
    });
  } else {
    await prisma.userProgress.upsert({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId: quiz.module.id,
        },
      },
      update: {
        status:
          existingProgress?.status === ProgressStatus.COMPLETED
            ? ProgressStatus.COMPLETED
            : ProgressStatus.IN_PROGRESS,
        score,
      },
      create: {
        userId: user.id,
        moduleId: quiz.module.id,
        status: ProgressStatus.IN_PROGRESS,
        score,
      },
    });
  }

  const [trackModuleCount, completedModuleCount] = await prisma.$transaction([
    prisma.module.count({
      where: {
        trackId: quiz.module.trackId,
      },
    }),
    prisma.userProgress.count({
      where: {
        userId: user.id,
        status: ProgressStatus.COMPLETED,
        module: {
          trackId: quiz.module.trackId,
        },
      },
    }),
  ]);

  const trackCompleted = trackModuleCount > 0 && completedModuleCount === trackModuleCount;
  let certificateIssued = false;

  if (trackCompleted) {
    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        userId_trackId: {
          userId: user.id,
          trackId: quiz.module.trackId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!existingCertificate) {
      const createdCertificate = await prisma.certificate.create({
        data: {
          userId: user.id,
          trackId: quiz.module.trackId,
          certificateUrl: "pending",
        },
        select: {
          id: true,
        },
      });

      await prisma.certificate.update({
        where: { id: createdCertificate.id },
        data: {
          certificateUrl: `/api/certificates/${createdCertificate.id}/pdf`,
        },
      });

      certificateIssued = true;
    }
  }

  revalidatePath(`/tracks/${payload.trackSlug}`);
  revalidatePath(`/tracks/${payload.trackSlug}/modules/${payload.moduleId}`);
  revalidatePath(`/tracks/${payload.trackSlug}/modules/${payload.moduleId}/quiz`);
  revalidatePath("/dashboard");

  return {
    ok: true,
    score,
    passed,
    passingScore: quiz.passingScore,
    totalQuestions,
    correctAnswers,
    certificateIssued,
    trackCompleted,
    wrongAnswers,
  };
}
