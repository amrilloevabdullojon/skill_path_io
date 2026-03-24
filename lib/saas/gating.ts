import { getPlanById } from "@/lib/saas/plans";
import { evaluateUsageAgainstLimits, getUsageCount } from "@/lib/saas/usage-ledger";
import { FeatureGateResult, FeatureKey, MeterUsageCheck, SubscriptionPlanId, SubscriptionState, UsageMeter } from "@/types/saas";

const featureUpgradeMap: Partial<Record<FeatureKey, SubscriptionPlanId>> = {
  "tracks.full": "PRO",
  "missions.unlimited": "PRO",
  "ai.mentor": "PRO",
  "analytics.advanced": "PRO",
  "interview.mode": "CAREER_ACCELERATOR",
  "readiness.analytics": "CAREER_ACCELERATOR",
  "hiring.marketplace": "CAREER_ACCELERATOR",
  "teams.dashboard": "TEAM",
  "teams.analytics": "TEAM",
  "teams.admin": "TEAM",
};

export function planHasFeature(planId: SubscriptionPlanId, feature: FeatureKey) {
  const plan = getPlanById(planId);
  return plan.featureBundle.features.includes(feature);
}

export function checkFeatureAccess(subscription: SubscriptionState, feature: FeatureKey): FeatureGateResult {
  const hasFeature = planHasFeature(subscription.planId, feature);

  if (hasFeature) {
    return {
      allowed: true,
      reason: "Feature is enabled for your plan.",
    };
  }

  return {
    allowed: false,
    reason: "Your current plan does not include this feature.",
    upgradePlanId: featureUpgradeMap[feature] ?? "PRO",
  };
}

export function checkUsageAccess(subscription: SubscriptionState, meter: UsageMeter): MeterUsageCheck {
  const plan = getPlanById(subscription.planId);
  const limit = plan.featureBundle.limits.find((item) => item.meter === meter);

  if (!limit) {
    return {
      meter,
      used: 0,
      limit: 0,
      remaining: 0,
      window: "MONTHLY",
      reached: true,
    };
  }

  const used = getUsageCount(subscription.userId, meter, limit.window);
  const reached = limit.limit !== null && used >= limit.limit;

  return {
    meter,
    used,
    limit: limit.limit,
    remaining: limit.limit === null ? null : Math.max(limit.limit - used, 0),
    window: limit.window,
    reached,
  };
}

export function getUsageChecks(subscription: SubscriptionState) {
  const plan = getPlanById(subscription.planId);
  return evaluateUsageAgainstLimits(subscription.userId, plan.featureBundle.limits);
}
