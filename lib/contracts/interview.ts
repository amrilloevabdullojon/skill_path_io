import { z } from "zod";

/** Contract for `POST /api/v1/interview` (AI interview trainer). */

export const InterviewTrackSchema = z.enum(["QA", "BA", "DA"]);

export const InterviewQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  expectedFocus: z.string(),
});

export const InterviewAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.string(),
});

export const InterviewEvaluationSchema = z.object({
  score: z.number(),
  level: z.enum(["Junior", "Junior+", "Middle"]),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()),
  summary: z.string(),
});

export const InterviewRequestSchema = z.object({
  action: z.enum(["start", "evaluate"]),
  track: InterviewTrackSchema,
  answers: z.array(InterviewAnswerSchema).optional(),
});
export type InterviewRequest = z.infer<typeof InterviewRequestSchema>;

export const InterviewStartResponseSchema = z.object({
  questions: z.array(InterviewQuestionSchema),
});
export type InterviewStartResponse = z.infer<typeof InterviewStartResponseSchema>;

export const InterviewEvaluateResponseSchema = z.object({
  evaluation: InterviewEvaluationSchema,
});
export type InterviewEvaluateResponse = z.infer<typeof InterviewEvaluateResponseSchema>;

export const InterviewResponseSchema = z.union([
  InterviewStartResponseSchema,
  InterviewEvaluateResponseSchema,
]);
