import { z } from "zod";

/**
 * Contract for `POST /api/v1/tracks/{slug}/modules/{moduleId}/missions/{missionId}/submissions`.
 * The mission itself is resolved server-side by id; the client only sends its work.
 */

export const MissionParamsSchema = z.object({
  slug: z.string().min(1, "slug is required"),
  moduleId: z.string().min(1, "moduleId is required"),
  missionId: z.string().min(1, "missionId is required"),
});

export const MissionSubmissionSchema = z.object({
  submission: z.string().trim().min(1, "submission is required").max(20000),
});
export type MissionSubmission = z.infer<typeof MissionSubmissionSchema>;

export const MissionEvaluationSchema = z.object({
  score: z.number(),
  verdict: z.enum(["Needs improvement", "Good", "Excellent"]),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  recoveryPlan: z.array(z.string()),
});

export const MissionSubmissionResultSchema = z.object({
  evaluation: MissionEvaluationSchema,
});
export type MissionSubmissionResult = z.infer<typeof MissionSubmissionResultSchema>;
