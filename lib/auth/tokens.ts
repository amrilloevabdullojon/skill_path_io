import { SignJWT, jwtVerify } from "jose";

import type { AppRoleEnum } from "@/types/next-auth";

/**
 * Stateless JWT access/refresh tokens for non-cookie clients (the Expo mobile app
 * and any future API consumer). Web keeps using NextAuth session cookies.
 *
 * Edge-safe: depends only on `jose` and Web Crypto, so it can run inside the
 * proxy middleware as well as in Node route handlers.
 */

export type TokenIdentity = {
  id: string;
  email: string;
  role: AppRoleEnum;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  /** Access token lifetime in seconds. */
  expiresIn: number;
};

const ISSUER = "levio";
const AUDIENCE = "levio-api";
const ALG = "HS256";

export const ACCESS_TTL_SECONDS = 60 * 15; // 15 minutes
export const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

type TokenKind = "access" | "refresh";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_TOKEN_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      "Token secret missing: set AUTH_TOKEN_SECRET (or NEXTAUTH_SECRET) to sign API tokens.",
    );
  }
  return new TextEncoder().encode(secret);
}

async function sign(identity: TokenIdentity, kind: TokenKind, ttlSeconds: number): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ email: identity.email, role: identity.role, typ: kind })
    .setProtectedHeader({ alg: ALG })
    .setSubject(identity.id)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSeconds)
    .sign(getSecret());
}

export function signAccessToken(identity: TokenIdentity): Promise<string> {
  return sign(identity, "access", ACCESS_TTL_SECONDS);
}

export function signRefreshToken(identity: TokenIdentity): Promise<string> {
  return sign(identity, "refresh", REFRESH_TTL_SECONDS);
}

export async function issueTokenPair(identity: TokenIdentity): Promise<TokenPair> {
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(identity),
    signRefreshToken(identity),
  ]);
  return { accessToken, refreshToken, tokenType: "Bearer", expiresIn: ACCESS_TTL_SECONDS };
}

async function verify(token: string, expectedKind: TokenKind): Promise<TokenIdentity | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (payload.typ !== expectedKind) return null;
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
    if (typeof payload.role !== "string") return null;
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role as AppRoleEnum,
    };
  } catch {
    return null;
  }
}

export function verifyAccessToken(token: string): Promise<TokenIdentity | null> {
  return verify(token, "access");
}

export function verifyRefreshToken(token: string): Promise<TokenIdentity | null> {
  return verify(token, "refresh");
}

/** Extract a Bearer token from an Authorization header value, if present. */
export function readBearerToken(authorization: string | null | undefined): string | null {
  if (!authorization) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return match ? match[1].trim() : null;
}
