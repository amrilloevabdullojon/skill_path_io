import { runUnifiedInterview } from "@/lib/ai";
import { logAiUsage } from "@/lib/ai/usage-log";
import { Errors, withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { parseBody, respond } from "@/lib/api/v1/http";
import { InterviewRequestSchema, InterviewResponseSchema } from "@/lib/contracts/interview";
import {
  denyFeature,
  denyUsage,
  ensureFeature,
  ensureUsage,
  recordMeterUsage,
  resolveApiSubscriptionContext,
} from "@/lib/saas/api-access";

export const runtime = "nodejs";

/**
 * POST /api/v1/interview — AI interview trainer. action="start" returns
 * questions; action="evaluate" scores submitted answers. Gated by the
 * interview.mode feature + interviewSessions meter.
 */
export const POST = withErrorHandler(async (request: Request) => {
  const identity = await requireIdentity(request);
  const accessContext = await resolveApiSubscriptionContext({
    email: identity.email,
    role: identity.role === "ADMIN" ? "ADMIN" : "STUDENT",
  });

  const featureGate = ensureFeature(accessContext, "interview.mode");
  if (!featureGate.allowed) {
    return denyFeature("interview.mode", featureGate.upgradePlanId);
  }
  const usage = ensureUsage(accessContext, "interviewSessions");
  if (usage.reached) {
    return denyUsage("interviewSessions", usage);
  }

  const body = await parseBody(request, InterviewRequestSchema);
  const result = await runUnifiedInterview(body);

  if (!result.ok) {
    throw Errors.validation(result.error);
  }

  recordMeterUsage(accessContext, "interviewSessions");
  await logAiUsage("AI_INTERVIEW", accessContext.userId);
  return respond(InterviewResponseSchema, result.data);
});
