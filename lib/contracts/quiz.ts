import { z } from "zod";

/**
 * Contract for `POST /api/v1/tracks/{slug}/modules/{moduleId}/quiz/attempts`.
 * The learner submits their answers; grading happens server-side. The result
 * legitimately includes correct answers (the attempt is already submitted).
 */

export const QuizSubmissionSchema = z.object({
  quizId: z.string().min(1, "quizId is required"),
  /** Map of question id -> selected option ids. */
  answers: z.record(z.string(), z.array(z.string())),
});
export type QuizSubmission = z.infer<typeof QuizSubmissionSchema>;

export const QuizWrongAnswerSchema = z.object({
  questionId: z.string(),
  question: z.string(),
  options: z.array(z.object({ id: z.string(), text: z.string() })),
  userAnswers: z.array(z.string()),
  correctAnswers: z.array(z.string()),
});

export const QuizAttemptResultSchema = z.object({
  ok: z.boolean(),
  attemptId: z.string().optional(),
  score: z.number(),
  passed: z.boolean(),
  passingScore: z.number(),
  totalQuestions: z.number(),
  correctAnswers: z.number(),
  certificateIssued: z.boolean(),
  trackCompleted: z.boolean(),
  wrongAnswers: z.array(QuizWrongAnswerSchema),
  message: z.string().optional(),
});
export type QuizAttemptResultResponse = z.infer<typeof QuizAttemptResultSchema>;
