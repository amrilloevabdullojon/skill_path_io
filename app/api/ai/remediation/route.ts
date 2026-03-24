import { buildAiRemediation } from "@/lib/ai/remediation";
import { apiOk, Errors, withErrorHandler } from "@/lib/api/error-handler";
import { buildDefaultAdaptiveSignal } from "@/lib/personalization/adaptive-defaults";
import { AdaptiveSignal } from "@/types/personalization";

export const POST = withErrorHandler(async (request: Request) => {
  const body = (await request.json()) as Partial<AdaptiveSignal>;
  if (!body || typeof body !== "object") {
    throw Errors.validation("Invalid remediation request body");
  }
  const signal = buildDefaultAdaptiveSignal(body);
  return apiOk(buildAiRemediation(signal));
});
