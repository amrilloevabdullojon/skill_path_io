import { z } from "zod";

/** Contract for `GET /api/v1/admin/ai-usage` — AI call volume for cost monitoring. */

export const AiUsageFeatureSchema = z.object({
  feature: z.string(),
  count: z.number(),
});

export const AiUsageSummarySchema = z.object({
  totalCalls: z.number(),
  last7Days: z.number(),
  last30Days: z.number(),
  byFeature: z.array(AiUsageFeatureSchema),
});

export const AiUsageResponseSchema = z.object({
  summary: AiUsageSummarySchema,
});
export type AiUsageResponse = z.infer<typeof AiUsageResponseSchema>;
