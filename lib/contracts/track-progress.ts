import { z } from "zod";

/** Contract for `GET /api/v1/tracks/{slug}/progress` — the caller's progress in a track. */

export const ModuleProgressStatusSchema = z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]);

export const ModuleProgressSchema = z.object({
  moduleId: z.string(),
  status: ModuleProgressStatusSchema,
  score: z.number().nullable(),
  completedAt: z.string().nullable(),
});

export const TrackProgressSchema = z.object({
  slug: z.string(),
  totalModules: z.number(),
  completedModules: z.number(),
  modules: z.array(ModuleProgressSchema),
});
export type TrackProgressResponse = z.infer<typeof TrackProgressSchema>;
