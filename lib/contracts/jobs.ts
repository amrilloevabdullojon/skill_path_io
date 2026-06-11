import { z } from "zod";

/** Contract for `GET /api/v1/jobs/match`. */

export const JobsTrackSchema = z.enum(["QA", "BA", "DA"]);
const JobLevelSchema = z.enum(["Intern", "Junior", "Junior+"]);

export const JobsMatchQuerySchema = z.object({
  track: JobsTrackSchema.optional(),
  skill: z.array(z.string()).optional(),
});

/** A skill-matched job posting (from the runtime job catalog). */
export const JobMatchResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: JobLevelSchema,
  location: z.string(),
  requiredSkills: z.array(z.string()),
  description: z.string(),
  roleTrack: JobsTrackSchema,
  matchPercent: z.number(),
  missingRequirements: z.array(z.string()),
  recommendation: z.string(),
});

/** A marketplace role match (SaaS hiring marketplace). */
export const MarketplaceMatchSchema = z.object({
  roleId: z.string(),
  title: z.string(),
  company: z.string(),
  matchPercent: z.number(),
  missingSkills: z.array(z.string()),
  evidenceSignals: z.array(z.string()),
});

export const JobsMatchResponseSchema = z.object({
  matches: z.array(JobMatchResultSchema),
  marketplaceMatches: z.array(MarketplaceMatchSchema),
  locked: z.boolean(),
  upgradePlanId: z.string().optional(),
  message: z.string().optional(),
});
export type JobsMatchResponse = z.infer<typeof JobsMatchResponseSchema>;
