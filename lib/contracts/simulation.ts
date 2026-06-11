import { z } from "zod";

/** Contracts for `/api/v1/simulation/*` review endpoints. */

// ── BA: user story review ────────────────────────────────────────────────────

export const UserStoryInputSchema = z.object({
  actor: z.string().max(2_000),
  action: z.string().max(2_000),
  value: z.string().max(2_000),
  acceptanceCriteria: z.string().max(8_000),
});
export type UserStoryInput = z.infer<typeof UserStoryInputSchema>;

export const UserStoryReviewSchema = z.object({
  score: z.number(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  recommendations: z.array(z.string()),
});

// ── QA: bug report review ────────────────────────────────────────────────────

export const BugSeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const BugReportInputSchema = z.object({
  title: z.string().max(300),
  severity: BugSeveritySchema,
  stepsToReproduce: z.string().max(8_000),
  expectedResult: z.string().max(4_000),
  actualResult: z.string().max(4_000),
});
export type BugReportInput = z.infer<typeof BugReportInputSchema>;

export const BugReviewResultSchema = z.object({
  qualityScore: z.number(),
  strengths: z.array(z.string()),
  issues: z.array(z.string()),
  suggestions: z.array(z.string()),
});
