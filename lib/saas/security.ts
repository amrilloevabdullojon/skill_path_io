import { SubscriptionState } from "@/types/saas";

import { checkFeatureAccess } from "@/lib/saas/gating";

export function requireFeature(subscription: SubscriptionState, feature: Parameters<typeof checkFeatureAccess>[1]) {
  const gate = checkFeatureAccess(subscription, feature);
  if (!gate.allowed) {
    const error = new Error("FEATURE_FORBIDDEN");
    (error as Error & { code?: string }).code = gate.upgradePlanId ?? "UPGRADE_REQUIRED";
    throw error;
  }
}

export function redactEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) {
    return "***";
  }
  const safeName = name.length <= 2 ? `${name[0] ?? "*"}*` : `${name.slice(0, 2)}***`;
  return `${safeName}@${domain}`;
}

export function safeExposeReadinessScore(score: number) {
  if (!Number.isFinite(score)) {
    return 0;
  }
  return Math.max(0, Math.min(Math.round(score), 100));
}
