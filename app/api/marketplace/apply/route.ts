import { NextResponse } from "next/server";

import {
  denyFeature,
  denyUsage,
  ensureFeature,
  ensureUsage,
  recordMeterUsage,
  resolveApiSubscriptionContext,
} from "@/lib/saas/api-access";
import { submitRoleApplication } from "@/lib/saas/marketplace";

export async function POST(request: Request) {
  const accessContext = await resolveApiSubscriptionContext();
  const featureGate = ensureFeature(accessContext, "hiring.marketplace");
  if (!featureGate.allowed) {
    return denyFeature("hiring.marketplace", featureGate.upgradePlanId);
  }

  const usage = ensureUsage(accessContext, "jobApplications");
  if (usage.reached) {
    return denyUsage("jobApplications", usage);
  }

  const body = (await request.json()) as {
    roleId?: string;
    portfolioUrl?: string;
  };

  if (!body.roleId || !body.portfolioUrl) {
    return NextResponse.json({ error: "roleId and portfolioUrl are required." }, { status: 400 });
  }

  const application = submitRoleApplication({
    roleId: body.roleId,
    candidateUserId: accessContext.userId,
    portfolioUrl: body.portfolioUrl,
  });

  recordMeterUsage(accessContext, "jobApplications");

  return NextResponse.json({ application }, { status: 201 });
}
