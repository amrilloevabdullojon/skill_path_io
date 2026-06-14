import { timingSafeEqual } from "node:crypto";

import { readBearerToken } from "@/lib/auth/tokens";

/**
 * Validate a scheduler request's Bearer token against `CRON_SECRET`.
 *
 * Used by cron-triggered endpoints (e.g. Vercel Cron sends
 * `Authorization: Bearer $CRON_SECRET`). Returns false when `CRON_SECRET` is
 * unset, so scheduler endpoints stay disabled until a secret is configured.
 * Constant-time comparison to avoid leaking the secret via timing.
 */
export function isValidCronSecret(authorizationHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const provided = readBearerToken(authorizationHeader);
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
