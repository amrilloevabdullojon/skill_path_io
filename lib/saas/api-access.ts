import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { checkFeatureAccess, checkUsageAccess } from "@/lib/saas/gating";
import { resolveUserSubscription } from "@/lib/saas/subscriptions";
import { incrementUsage } from "@/lib/saas/usage-ledger";
import { prisma } from "@/lib/prisma";
import { FeatureKey, MeterUsageCheck, UsageMeter } from "@/types/saas";

type ApiSubscriptionContext = {
  userId: string;
  userEmail: string;
  role: "ADMIN" | "STUDENT";
  subscription: Awaited<ReturnType<typeof resolveUserSubscription>>;
};

/** Identity override for non-cookie callers (e.g. /api/v1 Bearer-token requests). */
export type ApiIdentityOverride = { email?: string | null; role?: "ADMIN" | "STUDENT" };

async function resolveUserIdentity(override?: ApiIdentityOverride) {
  let email = override?.email ?? null;
  let role: "ADMIN" | "STUDENT" = override?.role ?? "STUDENT";

  if (!email) {
    const session = await getServerSession(authOptions);
    email = session?.user?.email ?? "guest@levio.local";
    role = session?.user?.role === "ADMIN" ? "ADMIN" : "STUDENT";
  }

  let dbUser: { id: string } | null = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  } catch {
    dbUser = null;
  }

  return {
    userId: dbUser?.id ?? `anon-${email}`,
    userEmail: email,
    role,
  };
}

export async function resolveApiSubscriptionContext(
  override?: ApiIdentityOverride,
): Promise<ApiSubscriptionContext> {
  const identity = await resolveUserIdentity(override);
  const subscription = await resolveUserSubscription({
    userId: identity.userId,
    userEmail: identity.userEmail,
    role: identity.role,
  });

  return {
    ...identity,
    subscription,
  };
}

export function denyFeature(feature: FeatureKey, upgrade?: string) {
  return NextResponse.json(
    {
      error: `Feature ${feature} is not available for your current plan.`,
      upgrade,
    },
    { status: 403 },
  );
}

export function denyUsage(meter: UsageMeter, usage: MeterUsageCheck) {
  return NextResponse.json(
    {
      error: `Usage limit reached for ${meter}.`,
      usage,
    },
    { status: 429 },
  );
}

export function ensureFeature(context: ApiSubscriptionContext, feature: FeatureKey) {
  return checkFeatureAccess(context.subscription, feature);
}

export function ensureUsage(context: ApiSubscriptionContext, meter: UsageMeter) {
  return checkUsageAccess(context.subscription, meter);
}

export function recordMeterUsage(context: ApiSubscriptionContext, meter: UsageMeter) {
  const usage = checkUsageAccess(context.subscription, meter);
  incrementUsage(context.subscription.userId, meter, usage.window, 1);
}
