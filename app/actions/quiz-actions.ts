"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { ProgressStatus, QuestionType } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { getCachedAiQuizQuestions } from "@/lib/ai/quiz-generator";
import { resolveRuntimeCourseBySlug } from "@/lib/learning/runtime-content";
import {
  findRuntimeModuleProgress,
  findRuntimeModuleProgressById,
  upsertRuntimeModuleProgress,
} from "@/lib/learning/progress";
import { resolveLearningUser } from "@/lib/learning-user";
import { prisma } from "@/lib/prisma";
import { applyTrackContentOverrides, normalizeLearningLocale } from "@/lib/tracks/content-overrides";

type QuizAttemptPayload = {
  trackSlug: string;
  moduleId: string;
  quizId: string;
  aiGeneratedQuestions?: Array<{
    id: string;
    text: string;
    type: "SINGLE" | "MULTI";
    options: Array<{ id: string; text: string }>;
    correctAnswer: string[];
  }>;
  answers: Record<string, string[]>;
};

type QuizAttemptResult = {
  ok: boolean;
  attemptId?: string;
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

function isSingleAnswerQuestion(type: string) {
  return type === QuestionType.SINGLE || type === "SINGLE" || type === "SINGLE_CHOICE" || type === "TRUE_FALSE";
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

function normalizeCorrectAnswerIds(value: unknown, options: Array<{ id: string; text: string }>) {
  return normalizeAnswerList(value)
    .map((answer) => options.find((option) => option.id === answer || option.text === answer)?.id ?? answer)
    .filter(Boolean);
}

function normalizeAiGeneratedQuestions(value: QuizAttemptPayload["aiGeneratedQuestions"]) {
  if (!Array.isArray(value)) {
    return null;
  }

  const questions = value.slice(0, 8).map((question) => {
    if (!question || typeof question !== "object") {
      return null;
    }

    const text = typeof question.text === "string" ? question.text.trim() : "";
    const type = question.type === "MULTI" ? "MULTI" : "SINGLE";
    const options = Array.isArray(question.options)
      ? question.options
        .slice(0, 5)
        .map((option) => ({
          id: typeof option.id === "string" ? option.id.trim() : "",
          text: typeof option.text === "string" ? option.text.trim() : "",
        }))
        .filter((option) => option.id && option.text)
      : [];
    const optionIds = new Set(options.map((option) => option.id));
    const correctAnswer = normalizeAnswerList(question.correctAnswer).filter((answer) => optionIds.has(answer));

    if (!text || options.length < 2 || correctAnswer.length === 0) {
      return null;
    }

    return {
      id: typeof question.id === "string" && question.id.trim() ? question.id.trim() : text,
      text,
      type,
      options,
      correctAnswer: type === "SINGLE" ? [correctAnswer[0]!] : correctAnswer,
    };
  });

  const validQuestions = questions.filter((question): question is NonNullable<typeof question> => Boolean(question));
  return validQuestions.length > 0 ? validQuestions : null;
}

function haveSameQuestionIds(
  submittedQuestions: ReturnType<typeof normalizeAiGeneratedQuestions>,
  cachedQuestions: Array<{ id: string }>,
) {
  if (!submittedQuestions || submittedQuestions.length !== cachedQuestions.length) {
    return false;
  }

  return submittedQuestions.every((question, index) => question.id === cachedQuestions[index]?.id);
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

  const cookieStore = await cookies();
  const locale = normalizeLearningLocale(cookieStore.get("levio-locale")?.value);

  const runtimeTrack = await resolveRuntimeCourseBySlug(payload.trackSlug, { includeCourseEntities: true });
  const overriddenTrack = runtimeTrack
    ? applyTrackContentOverrides(runtimeTrack, locale)
    : null;
  const moduleItem = overriddenTrack?.modules.find((moduleEntry) => moduleEntry.id === payload.moduleId) ?? null;
  const quiz = moduleItem?.quiz?.id === payload.quizId ? moduleItem.quiz : null;

  if (!overriddenTrack || !moduleItem || !quiz) {
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

  const aiGeneratedQuestions = normalizeAiGeneratedQuestions(payload.aiGeneratedQuestions);
  const cachedAiQuestions = aiGeneratedQuestions
    ? getCachedAiQuizQuestions({
        trackTitle: overriddenTrack.title,
        moduleItem,
        locale,
      })
    : null;

  if (aiGeneratedQuestions && !haveSameQuestionIds(aiGeneratedQuestions, cachedAiQuestions ?? [])) {
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
      message: "AI quiz expired. Reload the quiz and try again.",
    };
  }

  const quizQuestions = cachedAiQuestions ?? quiz.questions;
  const totalQuestions = quizQuestions.length;
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
  const questionsForScoring = quizQuestions.map((question) => ({
    id: question.id,
    text: question.text,
    type: question.type,
    options: parseQuestionOptions(question.options),
    correctAnswer: [] as string[],
    selectedAnswers: [] as string[],
    isCorrect: false,
  }));
  questionsForScoring.forEach((question, index) => {
    question.correctAnswer = normalizeCorrectAnswerIds(quizQuestions[index]?.correctAnswer, question.options);
  });

  const wrongAnswers: QuizAttemptResult["wrongAnswers"] = [];
  for (const question of questionsForScoring) {
    const selectedAnswers = normalizeAnswerList(payload.answers[question.id] ?? []);
    const expectedAnswers = normalizeAnswerList(question.correctAnswer);
    const isQuestionCorrect = answersMatch(selectedAnswers, expectedAnswers);
    question.selectedAnswers = selectedAnswers;
    question.isCorrect = isQuestionCorrect && !(isSingleAnswerQuestion(question.type) && selectedAnswers.length > 1);

    if (isSingleAnswerQuestion(question.type) && selectedAnswers.length > 1) {
      wrongAnswers.push({
        questionId: question.id,
        question: question.text,
        options: question.options,
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
        options: question.options,
        userAnswers: selectedAnswers,
        correctAnswers: expectedAnswers,
      });
    }
  }

  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = score >= quiz.passingScore;
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: user.id,
      source: overriddenTrack.source,
      trackSlug: overriddenTrack.slug,
      trackTitle: overriddenTrack.title,
      moduleId: moduleItem.id,
      moduleTitle: moduleItem.title,
      quizId: quiz.id,
      quizTitle: quiz.title,
      score,
      passingScore: quiz.passingScore,
      passed,
      totalQuestions,
      correctAnswers,
      questionResults: {
        create: questionsForScoring.map((question) => ({
          questionId: question.id,
          questionText: question.text,
          questionType: String(question.type),
          options: question.options,
          selectedAnswerIds: question.selectedAnswers,
          correctAnswerIds: normalizeAnswerList(question.correctAnswer),
          isCorrect: question.isCorrect,
        })),
      },
    },
    select: { id: true },
  });

  const existingProgress = await findRuntimeModuleProgressById({
    userId: user.id,
    moduleId: moduleItem.id,
    source: overriddenTrack.source,
  });
  const progressScore = existingProgress?.score !== null && existingProgress?.score !== undefined
    ? Math.max(existingProgress.score, score)
    : score;

  if (passed) {
    await upsertRuntimeModuleProgress({
      userId: user.id,
      moduleId: moduleItem.id,
      source: overriddenTrack.source,
      status: ProgressStatus.COMPLETED,
      score: progressScore,
      completedAt: existingProgress?.completedAt ?? new Date(),
    });
  } else {
    await upsertRuntimeModuleProgress({
      userId: user.id,
      moduleId: moduleItem.id,
      source: overriddenTrack.source,
      status:
        existingProgress?.status === ProgressStatus.COMPLETED
          ? ProgressStatus.COMPLETED
          : ProgressStatus.IN_PROGRESS,
      score: progressScore,
      completedAt: existingProgress?.completedAt ?? null,
    });
  }

  const progressRecords = await findRuntimeModuleProgress({
    userId: user.id,
    moduleIds: overriddenTrack.modules.map((moduleEntry) => moduleEntry.id),
    source: overriddenTrack.source,
  });
  const completedModuleIds = new Set(
    progressRecords
      .filter((progress) => progress.status === ProgressStatus.COMPLETED)
      .map((progress) => progress.moduleId),
  );
  const trackModuleCount = overriddenTrack.modules.length;
  const completedModuleCount = overriddenTrack.modules.filter((moduleEntry) => completedModuleIds.has(moduleEntry.id)).length;
  const trackCompleted = trackModuleCount > 0 && completedModuleCount === trackModuleCount;
  let certificateIssued = false;

  if (trackCompleted && overriddenTrack.source === "prisma-track") {
    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        userId_trackId: {
          userId: user.id,
          trackId: overriddenTrack.id,
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
          trackId: overriddenTrack.id,
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

  if (trackCompleted && overriddenTrack.source === "prisma-course") {
    const course = await prisma.course.findUnique({
      where: { id: overriddenTrack.id },
      select: { certificateEnabled: true },
    });

    if (course?.certificateEnabled) {
      const existingCertificate = await prisma.courseCertificate.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: overriddenTrack.id,
          },
        },
        select: { id: true },
      });

      if (!existingCertificate) {
        const createdCertificate = await prisma.courseCertificate.create({
          data: {
            userId: user.id,
            courseId: overriddenTrack.id,
            certificateUrl: "pending",
          },
          select: { id: true },
        });

        await prisma.courseCertificate.update({
          where: { id: createdCertificate.id },
          data: {
            certificateUrl: `/api/course-certificates/${createdCertificate.id}/pdf`,
          },
        });

        certificateIssued = true;
      }
    }
  }

  revalidatePath(`/tracks/${payload.trackSlug}`);
  revalidatePath(`/tracks/${payload.trackSlug}/modules/${payload.moduleId}`);
  revalidatePath(`/tracks/${payload.trackSlug}/modules/${payload.moduleId}/quiz`);
  revalidatePath("/dashboard");
  revalidatePath("/review");

  return {
    ok: true,
    attemptId: attempt.id,
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
