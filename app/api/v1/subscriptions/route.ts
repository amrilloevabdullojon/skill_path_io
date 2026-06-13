import { withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { respond } from "@/lib/api/v1/http";
import { SubscriptionsResponseSchema } from "@/lib/contracts/subscriptions";
import { resolveApiSubscriptionContext } from "@/lib/saas/api-access";
import { listSubscriptionPlans } from "@/lib/saas/subscriptions";

export const runtime = "nodejs";

/**
 * GET /api/v1/subscriptions — the caller's subscription and the available plans.
 * Reads the subscription from the SaaS source directly (not the dashboard mock).
 */
export const GET = withErrorHandler(async (request: Request) => {
  const identity = await requireIdentity(request);
  const accessContext = await resolveApiSubscriptionContext({
    email: identity.email,
    role: identity.role === "ADMIN" ? "ADMIN" : "STUDENT",
  });
  const plans = await listSubscriptionPlans();

  return respond(SubscriptionsResponseSchema, {
    subscription: accessContext.subscription,
    plans,
  });
});
