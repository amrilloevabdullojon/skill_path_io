import "server-only";

import { createHash } from "node:crypto";

import { SignJWT, jwtVerify } from "jose";

/**
 * Short-lived, stateless JWTs for out-of-band auth actions (password reset,
 * email verification). No DB model needed.
 *
 * Single-use for password reset is achieved without storage by binding the
 * token to a fingerprint of the user's current password hash: once the password
 * changes, previously issued reset tokens no longer match and are rejected.
 */

export type ActionTokenType = "pwreset" | "emailverify";

const ISSUER = "levio";
const AUDIENCE = "levio-auth-action";
const ALG = "HS256";

export const PASSWORD_RESET_TTL_SECONDS = 60 * 30; // 30 minutes
export const EMAIL_VERIFY_TTL_SECONDS = 60 * 60 * 24; // 24 hours

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_TOKEN_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("Token secret missing: set AUTH_TOKEN_SECRET (or NEXTAUTH_SECRET).");
  }
  return new TextEncoder().encode(secret);
}

/** Stable short fingerprint of the current password hash, used to one-shot reset tokens. */
export function passwordFingerprint(passwordHash: string | null | undefined): string {
  return createHash("sha256").update(passwordHash ?? "").digest("hex").slice(0, 16);
}

export async function signActionToken(
  userId: string,
  type: ActionTokenType,
  ttlSeconds: number,
  extra: Record<string, string> = {},
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ typ: type, ...extra })
    .setProtectedHeader({ alg: ALG })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSeconds)
    .sign(getSecret());
}

export async function verifyActionToken(
  token: string,
  type: ActionTokenType,
): Promise<{ userId: string; claims: Record<string, unknown> } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { issuer: ISSUER, audience: AUDIENCE });
    if (payload.typ !== type || typeof payload.sub !== "string") return null;
    return { userId: payload.sub, claims: payload as Record<string, unknown> };
  } catch {
    return null;
  }
}
