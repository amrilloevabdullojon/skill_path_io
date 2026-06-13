import { z } from "zod";

/** Contract for `GET /api/v1/me/quiz-attempts` — the learner's recent activity. */

export const QuizAttemptSummarySchema = z.object({
  id: z.string(),
  trackSlug: z.string(),
  trackTitle: z.string(),
  moduleTitle: z.string(),
  quizTitle: z.string(),
  score: z.number(),
  passingScore: z.number(),
  passed: z.boolean(),
  totalQuestions: z.number(),
  correctAnswers: z.number(),
  submittedAt: z.string(),
});
export type QuizAttemptSummary = z.infer<typeof QuizAttemptSummarySchema>;

export const ProgressStatsSchema = z.object({
  totalAttempts: z.number(),
  passedAttempts: z.number(),
  averageScore: z.number(),
});

export const ProgressResponseSchema = z.object({
  stats: ProgressStatsSchema,
  attempts: z.array(QuizAttemptSummarySchema),
});
export type ProgressResponse = z.infer<typeof ProgressResponseSchema>;
