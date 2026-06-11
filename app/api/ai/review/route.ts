import { NextResponse } from "next/server";

import { runUnifiedReview } from "@/lib/ai";
import {
  denyFeature,
  denyUsage,
  ensureFeature,
  ensureUsage,
  recordMeterUsage,
  resolveApiSubscriptionContext,
} from "@/lib/saas/api-access";
import { UnifiedAiReviewRequest } from "@/types/ai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const accessContext = await resolveApiSubscriptionContext();
  const featureGate = ensureFeature(accessContext, "ai.mentor");
  if (!featureGate.allowed) {
    return denyFeature("ai.mentor", featureGate.upgradePlanId);
  }
  const usage = ensureUsage(accessContext, "aiMentorRequests");
  if (usage.reached) {
    return denyUsage("aiMentorRequests", usage);
  }

  const body = (await request.json()) as UnifiedAiReviewRequest;
  const result = await runUnifiedReview(body);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  recordMeterUsage(accessContext, "aiMentorRequests");
  return NextResponse.json(result.data, { status: result.status });
}
