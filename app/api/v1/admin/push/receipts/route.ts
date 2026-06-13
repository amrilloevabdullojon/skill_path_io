import { Errors, withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { respond } from "@/lib/api/v1/http";
import { PollReceiptsResultSchema } from "@/lib/contracts/push";
import { pollPushReceipts } from "@/lib/notifications/push";

export const runtime = "nodejs";

/**
 * POST /api/v1/admin/push/receipts — reconcile pending Expo push receipts
 * (admin only). Idempotent and safe to run on a schedule: it asks Expo for the
 * status of accepted tickets and prunes tokens reported as DeviceNotRegistered.
 *
 * Note: /api/v1/admin/* is not covered by the proxy's admin guard, so the role
 * is enforced here.
 */
export const POST = withErrorHandler(async (request: Request) => {
  const identity = await requireIdentity(request);
  if (identity.role !== "ADMIN") {
    throw Errors.forbidden();
  }

  const result = await pollPushReceipts();
  return respond(PollReceiptsResultSchema, result);
});
