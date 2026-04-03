import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Routes that require no authentication at all.
 * Checked as prefix matches before any token verification.
 */
const PUBLIC_PREFIXES = [
  "/api/auth/",   // NextAuth own endpoints (signin, signout, callback, session, csrf)
  "/api/health",  // Health-check — must stay reachable without a session
  "/login",
  "/_next/",
  "/favicon.ico",
  "/sitemap.xml",
  "/robots.txt",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes through without touching the token.
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });
  const isApiRoute = pathname.startsWith("/api/");
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  // ── Unauthenticated ──────────────────────────────────────────────────────
  if (!token) {
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
  if (isAdminRoute && token.role !== "ADMIN") {
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
