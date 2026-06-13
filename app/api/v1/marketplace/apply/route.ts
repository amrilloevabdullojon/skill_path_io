import { withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { parseBody, respond } from "@/lib/api/v1/http";
import { ApplyRequestSchema, ApplyResponseSchema } from "@/lib/contracts/marketplace";
import {
  denyFeature,
  denyUsage,
  ensureFeature,
  ensureUsage,
  recordMeterUsage,
  resolveApiSubscriptionContext,
} from "@/lib/saas/api-access";
import { submitRoleApplication } from "@/lib/saas/marketplace";

export const runtime = "nodejs";

/**
 * POST /api/v1/marketplace/apply — apply to a marketplace role.
 * Gated by the hiring.marketplace feature + jobApplications meter.
 */
export const POST = withErrorHandler(async (request: Request) => {
  const identity = await requireIdentity(request);
  const accessContext = await resolveApiSubscriptionContext({
    email: identity.email,
    role: identity.role === "ADMIN" ? "ADMIN" : "STUDENT",
  });

  const featureGate = ensureFeature(accessContext, "hiring.marketplace");
  if (!featureGate.allowed) {
    return denyFeature("hiring.marketplace", featureGate.upgradePlanId);
  }
  const usage = ensureUsage(accessContext, "jobApplications");
  if (usage.reached) {
    return denyUsage("jobApplications", usage);
  }

  const { roleId, portfolioUrl } = await parseBody(request, ApplyRequestSchema);
  const application = submitRoleApplication({
    roleId,
    candidateUserId: accessContext.userId,
    portfolioUrl,
  });

  recordMeterUsage(accessContext, "jobApplications");
  return respond(ApplyResponseSchema, { application }, 201);
});
