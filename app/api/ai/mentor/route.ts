import { handleMentorRequest } from "@/lib/ai";
import {
  denyFeature,
  denyUsage,
  ensureFeature,
  ensureUsage,
  recordMeterUsage,
  resolveApiSubscriptionContext,
} from "@/lib/saas/api-access";
import { MentorRequest } from "@/types/ai";

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

  const body = (await request.json()) as MentorRequest;
  const response = await handleMentorRequest(request, {
    context: body.context,
    messages: body.messages,
  });

  if (response.status < 400) {
    recordMeterUsage(accessContext, "aiMentorRequests");
  }

  return response;
}
