import { withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { respond } from "@/lib/api/v1/http";
import { MeResponseSchema } from "@/lib/contracts/auth";

export const runtime = "nodejs";

/**
 * GET /api/v1/auth/me — return the current user for a Bearer token or session cookie.
 * Protected by the proxy middleware.
 */
export const GET = withErrorHandler(async (request: Request) => {
  const identity = await requireIdentity(request);
  return respond(MeResponseSchema, {
    user: { id: identity.id, email: identity.email, role: identity.role },
  });
});
