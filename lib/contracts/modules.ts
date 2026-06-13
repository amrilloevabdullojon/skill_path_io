import { z } from "zod";

import {
  RuntimeLessonSchema,
  RuntimeMissionSchema,
  RuntimeSimulationSchema,
  RuntimeStatusSchema,
  RuntimeVisibilitySchema,
} from "@/lib/contracts/tracks";

/**
 * Contract for `GET /api/v1/tracks/{slug}/modules/{moduleId}`.
 *
 * Learner-facing: quiz questions deliberately omit `correctAnswer` so answers
 * are never shipped to the client. Answer validation happens server-side via the
 * quiz review / submission endpoints.
 */

export const ModuleParamsSchema = z.object({
  slug: z.string().min(1, "slug is required"),
  moduleId: z.string().min(1, "moduleId is required"),
});

export const LearnerQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.string(),
  options: z.array(z.object({ id: z.string(), text: z.string() })),
});

export const LearnerQuizSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  title: z.string(),
  description: z.string(),
  passingScore: z.number(),
  status: RuntimeStatusSchema,
  questionCount: z.number().int().nonnegative(),
  questions: z.array(LearnerQuestionSchema),
});

export const LearnerModuleSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  order: z.number(),
  title: z.string(),
  description: z.string(),
  estimatedDuration: z.number(),
  xpReward: z.number(),
  status: RuntimeStatusSchema,
  visibility: RuntimeVisibilitySchema,
  lessons: z.array(RuntimeLessonSchema),
  quiz: LearnerQuizSchema.nullable(),
  missions: z.array(RuntimeMissionSchema),
  simulations: z.array(RuntimeSimulationSchema),
});
export type LearnerModule = z.infer<typeof LearnerModuleSchema>;

export const ModuleDetailSchema = z.object({
  course: z.object({ slug: z.string(), title: z.string() }),
  module: LearnerModuleSchema,
});
export type ModuleDetailResponse = z.infer<typeof ModuleDetailSchema>;
