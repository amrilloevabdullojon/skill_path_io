import { Errors, withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { respond } from "@/lib/api/v1/http";
import { AiUsageResponseSchema } from "@/lib/contracts/ai-usage";
import { buildAiUsageSummary } from "@/lib/admin/ai-usage";

export const runtime = "nodejs";

/**
 * GET /api/v1/admin/ai-usage — AI call volume summary (admin only).
 * Note: /api/v1/admin/* is not covered by the proxy's admin guard, so the role
 * is enforced here.
 */
export const GET = withErrorHandler(async (request: Request) => {
  const identity = await requireIdentity(request);
  if (identity.role !== "ADMIN") {
    throw Errors.forbidden();
  }
  const summary = await buildAiUsageSummary();
  return respond(AiUsageResponseSchema, { summary });
});
