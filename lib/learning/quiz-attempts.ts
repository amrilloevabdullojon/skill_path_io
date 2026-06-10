import "server-only";

import { prisma } from "@/lib/prisma";

export type RuntimeQuizAttemptSummary = {
  id: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  submittedAt: Date;
  wrongCount: number;
};

export async function findRuntimeQuizAttemptSummaries(params: {
  userId: string;
  moduleId: string;
  quizId: string;
  take?: number;
}): Promise<RuntimeQuizAttemptSummary[]> {
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      userId: params.userId,
      moduleId: params.moduleId,
      quizId: params.quizId,
    },
    orderBy: { submittedAt: "desc" },
    take: params.take ?? 5,
    select: {
      id: true,
      score: true,
      passed: true,
      totalQuestions: true,
      correctAnswers: true,
      submittedAt: true,
      _count: {
        select: {
          questionResults: {
            where: { isCorrect: false },
          },
        },
      },
    },
  });

  return attempts.map((attempt) => ({
    id: attempt.id,
    score: attempt.score,
    passed: attempt.passed,
    totalQuestions: attempt.totalQuestions,
    correctAnswers: attempt.correctAnswers,
    submittedAt: attempt.submittedAt,
    wrongCount: attempt._count.questionResults,
  }));
}
