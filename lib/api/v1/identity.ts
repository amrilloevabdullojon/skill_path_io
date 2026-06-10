import { getServerSession } from "next-auth";

import { Errors } from "@/lib/api/error-handler";
import { authOptions } from "@/lib/auth";
import { readBearerToken, verifyAccessToken, type TokenIdentity } from "@/lib/auth/tokens";

/**
 * Resolve the caller's identity for a `/api/v1` route, accepting either:
 * - a Bearer access token (mobile / API clients), or
 * - a NextAuth session cookie (web).
 *
 * Returns null when neither is present or valid.
 */
export async function resolveIdentity(request: Request): Promise<TokenIdentity | null> {
  const bearer = readBearerToken(request.headers.get("authorization"));
  if (bearer) {
    const identity = await verifyAccessToken(bearer);
    if (identity) return identity;
  }

  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email ?? "",
      role: session.user.role ?? "STUDENT",
    };
  }

  return null;
}

/** Like resolveIdentity, but throws UNAUTHORIZED when no identity is found. */
export async function requireIdentity(request: Request): Promise<TokenIdentity> {
  const identity = await resolveIdentity(request);
  if (!identity) {
    throw Errors.unauthorized();
  }
  return identity;
}
