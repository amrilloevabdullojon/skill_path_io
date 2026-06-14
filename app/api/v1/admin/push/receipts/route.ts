import { Errors, withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { isValidCronSecret } from "@/lib/auth/cron";
import { respond } from "@/lib/api/v1/http";
import { PollReceiptsResultSchema } from "@/lib/contracts/push";
import { pollPushReceipts } from "@/lib/notifications/push";

export const runtime = "nodejs";

/**
 * Reconcile pending Expo push receipts: ask Expo for the status of accepted
 * tickets and prune tokens reported as DeviceNotRegistered. Idempotent and safe
 * to run repeatedly. This path is whitelisted in proxy.ts and self-guards here.
 *
 * - GET  — for schedulers (e.g. Vercel Cron, which issues GET and sends
 *   `Authorization: Bearer $CRON_SECRET`). Requires a matching `CRON_SECRET`.
 * - POST — manual/admin trigger, or POST schedulers. Requires an admin identity
 *   OR the `CRON_SECRET`.
 */

async function requireCronAuth(request: Request): Promise<void> {
  if (!isValidCronSecret(request.headers.get("authorization"))) {
    throw Errors.unauthorized("Valid CRON_SECRET required");
  }
}

async function requireAdminOrCron(request: Request): Promise<void> {
  if (isValidCronSecret(request.headers.get("authorization"))) return;
  const identity = await requireIdentity(request);
  if (identity.role !== "ADMIN") {
    throw Errors.forbidden();
  }
}

export const GET = withErrorHandler(async (request: Request) => {
  await requireCronAuth(request);
  const result = await pollPushReceipts();
  return respond(PollReceiptsResultSchema, result);
});

export const POST = withErrorHandler(async (request: Request) => {
  await requireAdminOrCron(request);
  const result = await pollPushReceipts();
  return respond(PollReceiptsResultSchema, result);
});
