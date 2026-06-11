import { buildAiRemediation } from "@/lib/ai/remediation";
import { apiOk, Errors, withErrorHandler } from "@/lib/api/error-handler";
import { buildDefaultAdaptiveSignal } from "@/lib/personalization/adaptive-defaults";
import {
  denyFeature,
  denyUsage,
  ensureFeature,
  ensureUsage,
  recordMeterUsage,
  resolveApiSubscriptionContext,
} from "@/lib/saas/api-access";
import { AdaptiveSignal } from "@/types/personalization";

export const POST = withErrorHandler(async (request: Request) => {
  const accessContext = await resolveApiSubscriptionContext();
  const featureGate = ensureFeature(accessContext, "ai.mentor");
  if (!featureGate.allowed) {
    return denyFeature("ai.mentor", featureGate.upgradePlanId);
  }
  const usage = ensureUsage(accessContext, "aiMentorRequests");
  if (usage.reached) {
    return denyUsage("aiMentorRequests", usage);
  }

  const body = (await request.json()) as Partial<AdaptiveSignal>;
  if (!body || typeof body !== "object") {
    throw Errors.validation("Invalid remediation request body");
  }
  const signal = buildDefaultAdaptiveSignal(body);
  const remediation = buildAiRemediation(signal);
  recordMeterUsage(accessContext, "aiMentorRequests");
  return apiOk(remediation);
});
