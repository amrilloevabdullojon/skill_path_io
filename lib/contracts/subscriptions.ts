import { z } from "zod";

/** Contract for `GET /api/v1/subscriptions`. */

export const SubscriptionPlanIdSchema = z.enum(["FREE", "PRO", "CAREER_ACCELERATOR", "TEAM"]);
export const SubscriptionStatusSchema = z.enum(["active", "trialing", "past_due", "canceled"]);

export const PlanFeatureBundleSchema = z.object({
  features: z.array(z.string()),
  limits: z.array(
    z.object({
      meter: z.string(),
      limit: z.number().nullable(),
      window: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
    }),
  ),
});

export const SubscriptionPlanSchema = z.object({
  id: SubscriptionPlanIdSchema,
  name: z.string(),
  description: z.string(),
  monthlyPriceUsd: z.number(),
  annualPriceUsd: z.number(),
  featureBundle: PlanFeatureBundleSchema,
});

export const SubscriptionStateSchema = z.object({
  userId: z.string(),
  userEmail: z.string(),
  planId: SubscriptionPlanIdSchema,
  status: SubscriptionStatusSchema,
  renewsAt: z.string().nullable(),
  source: z.string(),
});

export const SubscriptionsResponseSchema = z.object({
  subscription: SubscriptionStateSchema,
  plans: z.array(SubscriptionPlanSchema),
});
export type SubscriptionsResponse = z.infer<typeof SubscriptionsResponseSchema>;
