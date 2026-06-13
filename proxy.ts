import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { readBearerToken, verifyAccessToken } from "@/lib/auth/tokens";

/**
 * Routes that require no authentication at all.
 * Checked as prefix matches before any token verification.
 */
const PUBLIC_PREFIXES = [
  "/api/auth/",        // NextAuth own endpoints (signin, signout, callback, session, csrf)
  "/api/v1/auth/register", // Account creation — no session yet
  "/api/v1/auth/login",   // Token login — issues tokens, no session yet
  "/api/v1/auth/refresh", // Token refresh — authenticated by the refresh token itself
  "/api/v1/auth/request-password-reset", // Recovery — no session
  "/api/v1/auth/reset-password",          // Token is the credential
  "/api/v1/auth/verify-email",            // Token is the credential
  "/api/v1/openapi.json", // Machine-readable API spec — public for tooling/clients
  "/api/health",       // Health-check — must stay reachable without a session
  "/api/public/",      // Endpoints that intentionally accept anonymous callers
  "/login",
  "/reset-password", // Password reset page — consumes a token, no session
  "/verify-email",   // Email verification page — consumes a token, no session
  "/p/",          // Public portfolio pages (/p/[slug])
  "/interview-preview",
  "/skill-test",
  "/_next/",
  "/favicon.ico",
  "/sitemap.xml",
  "/robots.txt",
  "/manifest.webmanifest",
];

const PUBLIC_EXACT = new Set<string>(["/"]);

function isPublic(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes through without touching the token.
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith("/api/");
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  // Resolve identity from either a NextAuth session cookie (web) or a
  // Bearer access token (mobile / API clients).
  const cookieToken = await getToken({ req: request });
  let isAuthed = Boolean(cookieToken);
  let role: string | undefined = cookieToken?.role as string | undefined;

  if (!isAuthed) {
    const bearer = readBearerToken(request.headers.get("authorization"));
    if (bearer) {
      const identity = await verifyAccessToken(bearer);
      if (identity) {
        isAuthed = true;
        role = identity.role;
      }
    }
  }

  // ── Unauthenticated ──────────────────────────────────────────────────────
  if (!isAuthed) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(loginUrl);
  }

  // ── Admin-only routes ────────────────────────────────────────────────────
  if (isAdminRoute && role !== "ADMIN") {
    if (isApiRoute) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Intercept every request EXCEPT Next.js internals and static assets.
     * Public routes are whitelisted inside the middleware function itself
     * so the logic stays in one place and is easy to audit.
     */
    "/((?!_next/static|_next/image|.*\\.(?:ico|png|svg|jpg|jpeg|webp|woff2?|css|js)).*)",
  ],
};
