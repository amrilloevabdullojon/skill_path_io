import { Errors, withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { parseBody, respond } from "@/lib/api/v1/http";
import { getServerEnv } from "@/lib/config/env";
import { SendPushResultSchema, SendPushSchema } from "@/lib/contracts/push";
import { sendPushToUser } from "@/lib/notifications/push";
import { applyRateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/v1/admin/push — send a push notification to one user's devices
 * (admin only). The reusable send path lives in `lib/notifications/push.ts`;
 * this route is the manual/test trigger. Automated product triggers can call
 * `sendPushToUser` directly.
 *
 * Note: /api/v1/admin/* is not covered by the proxy's admin guard, so the role
 * is enforced here.
 */
export const POST = withErrorHandler(async (request: Request) => {
  const identity = await requireIdentity(request);
  if (identity.role !== "ADMIN") {
    throw Errors.forbidden();
  }

  // Per-admin rate limit (reuses the admin-AI budget) so a single account can't
  // fan out a flood of pushes.
  const env = getServerEnv();
  const rateLimit = await applyRateLimit({
    key: `admin-push:${identity.id}`,
    maxRequests: env.adminAiRateLimitMaxRequests,
    windowMs: env.adminAiRateLimitWindowMs,
  });
  if (!rateLimit.allowed) {
    throw Errors.rateLimited();
  }

  const { userId, title, body, data } = await parseBody(request, SendPushSchema);
  const result = await sendPushToUser(userId, { title, body, data });

  return respond(SendPushResultSchema, result);
});
