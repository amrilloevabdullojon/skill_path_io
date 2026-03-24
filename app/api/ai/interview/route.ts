import { NextResponse } from "next/server";

import { runUnifiedInterview } from "@/lib/ai";
import { UnifiedInterviewRequest } from "@/lib/ai/interview-service";
import {
  denyFeature,
  denyUsage,
  ensureFeature,
  ensureUsage,
  recordMeterUsage,
  resolveApiSubscriptionContext,
} from "@/lib/saas/api-access";

export async function POST(request: Request) {
  const accessContext = await resolveApiSubscriptionContext();
  const featureGate = ensureFeature(accessContext, "interview.mode");
  if (!featureGate.allowed) {
    return denyFeature("interview.mode", featureGate.upgradePlanId);
  }

  const usage = ensureUsage(accessContext, "interviewSessions");
  if (usage.reached) {
    return denyUsage("interviewSessions", usage);
  }

  const body = (await request.json()) as UnifiedInterviewRequest;
  const result = await runUnifiedInterview(body);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  recordMeterUsage(accessContext, "interviewSessions");

  return NextResponse.json(result.data, { status: result.status });
}
