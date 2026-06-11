import { z } from "zod";

import { LearnerModuleSchema } from "@/lib/contracts/modules";
import { RuntimeContentSourceSchema, TrackCourseSchema } from "@/lib/contracts/tracks";

/**
 * Learner-facing catalog/detail contracts. Identical to the full course shape
 * except modules use the learner-safe module schema — quiz questions never carry
 * `correctAnswer`, so answers are not shipped to the client.
 */

export const LearnerCourseSchema = TrackCourseSchema.extend({
  modules: z.array(LearnerModuleSchema),
});
export type LearnerCourse = z.infer<typeof LearnerCourseSchema>;

export const CatalogSchema = z.object({
  source: z.union([RuntimeContentSourceSchema, z.literal("mixed")]),
  courses: z.array(LearnerCourseSchema),
});
export type CatalogResponse = z.infer<typeof CatalogSchema>;

export const TrackDetailSchema = z.object({
  course: LearnerCourseSchema,
});
export type TrackDetailResponse = z.infer<typeof TrackDetailSchema>;
