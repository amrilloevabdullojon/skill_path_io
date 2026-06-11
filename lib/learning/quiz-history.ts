import "server-only";

import type { ProgressResponse } from "@/lib/contracts/progress";
import { prisma } from "@/lib/prisma";

/**
 * Read model for a learner's quiz activity: recent attempts + headline stats.
 * Returns contract DTOs (ISO date strings) so the HTTP handler stays thin.
 */
export async function listLearnerProgress(userId: string, take = 20): Promise<ProgressResponse> {
  const [attempts, aggregate, passedAttempts] = await Promise.all([
    prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { submittedAt: "desc" },
      take,
      select: {
        id: true,
        trackSlug: true,
        trackTitle: true,
        moduleTitle: true,
        quizTitle: true,
        score: true,
        passingScore: true,
        passed: true,
        totalQuestions: true,
        correctAnswers: true,
        submittedAt: true,
      },
    }),
    prisma.quizAttempt.aggregate({
      where: { userId },
      _count: { _all: true },
      _avg: { score: true },
    }),
    prisma.quizAttempt.count({ where: { userId, passed: true } }),
  ]);

  return {
    stats: {
      totalAttempts: aggregate._count._all,
      passedAttempts,
      averageScore: Math.round(aggregate._avg.score ?? 0),
    },
    attempts: attempts.map((attempt) => ({
      id: attempt.id,
      trackSlug: attempt.trackSlug,
      trackTitle: attempt.trackTitle,
      moduleTitle: attempt.moduleTitle,
      quizTitle: attempt.quizTitle,
      score: attempt.score,
      passingScore: attempt.passingScore,
      passed: attempt.passed,
      totalQuestions: attempt.totalQuestions,
      correctAnswers: attempt.correctAnswers,
      submittedAt: attempt.submittedAt.toISOString(),
    })),
  };
}
