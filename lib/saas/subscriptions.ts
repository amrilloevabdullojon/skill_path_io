import { getPlanById, subscriptionPlans } from "@/lib/saas/plans";
import { SubscriptionPlan, SubscriptionPlanId, SubscriptionState } from "@/types/saas";

type ResolveSubscriptionInput = {
  userId: string;
  userEmail: string;
  role?: string | null;
};

export interface SubscriptionAdapter {
  listPlans(): Promise<SubscriptionPlan[]>;
  resolveSubscription(input: ResolveSubscriptionInput): Promise<SubscriptionState>;
}

function normalizeRole(role: ResolveSubscriptionInput["role"]): "ADMIN" | "STUDENT" {
  return role === "ADMIN" ? "ADMIN" : "STUDENT";
}

function inferPlanFromIdentity(input: ResolveSubscriptionInput): SubscriptionPlanId {
  const email = input.userEmail.toLowerCase();
  const role = normalizeRole(input.role);

  if (role === "ADMIN" || email.includes("+team@") || email.includes(".team@")) {
    return "TEAM";
  }
  if (email.includes("+career@") || email.includes(".career@")) {
    return "CAREER_ACCELERATOR";
  }
  if (email.includes("+pro@") || email.includes(".pro@")) {
    return "PRO";
  }

  const defaultPlan = process.env.DEFAULT_SUBSCRIPTION_PLAN;
  if (
    defaultPlan === "FREE"
    || defaultPlan === "PRO"
    || defaultPlan === "CAREER_ACCELERATOR"
    || defaultPlan === "TEAM"
  ) {
    return defaultPlan;
  }

  return "FREE";
}

class LocalMockSubscriptionAdapter implements SubscriptionAdapter {
  async listPlans() {
    return subscriptionPlans;
  }

  async resolveSubscription(input: ResolveSubscriptionInput): Promise<SubscriptionState> {
    const planId = inferPlanFromIdentity(input);
    const now = new Date();
    const renewsAt = new Date(now);
    renewsAt.setMonth(renewsAt.getMonth() + 1);

    return {
      userId: input.userId,
      userEmail: input.userEmail,
      planId,
      status: "active",
      renewsAt: planId === "FREE" ? null : renewsAt.toISOString(),
      source: "mock-local",
    };
  }
}

const adapter: SubscriptionAdapter = new LocalMockSubscriptionAdapter();

export async function listSubscriptionPlans() {
  return adapter.listPlans();
}

export async function resolveUserSubscription(input: ResolveSubscriptionInput) {
  return adapter.resolveSubscription(input);
}

export function resolvePlanName(planId: SubscriptionPlanId) {
  return getPlanById(planId).name;
}
