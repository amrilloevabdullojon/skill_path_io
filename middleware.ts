import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(request) {
    const role = request.nextauth.token?.role;
    const { pathname } = request.nextUrl;

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
  },
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tracks/:path*",
    "/admin/:path*",
    "/interview/:path*",
    "/leaderboard/:path*",
    "/career/:path*",
    "/jobs/:path*",
    "/missions/:path*",
    "/planner/:path*",
    "/billing/:path*",
    "/teams/:path*",
    "/marketplace/:path*",
    "/portfolio/:path*",
    "/knowledge-map/:path*",
    "/analytics/:path*",
    "/onboarding/:path*",
    "/notes/:path*",
    "/bookmarks/:path*",
    "/groups/:path*",
    "/discussions/:path*",
    "/review/:path*",
    "/cases/:path*",
    "/community/:path*",
    "/sandbox/:path*",
    "/simulation/:path*",
  ],
};
