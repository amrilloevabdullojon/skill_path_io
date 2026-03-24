"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Shield, UserCircle2, X } from "lucide-react";

import { useUiStore } from "@/store/user/use-ui-store";
import { cn } from "@/lib/utils";

const baseLinks = [
  { href: "/", label: "Home" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/tracks", label: "Tracks" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/missions", label: "Missions" },
  { href: "/planner", label: "Planner" },
  { href: "/jobs", label: "Jobs" },
  { href: "/interview", label: "Interview" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/career", label: "Career" },
  { href: "/review", label: "Review" },
  { href: "/cases", label: "Cases" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useUiStore();
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  const isAuthenticated = status === "authenticated";
  const links = isAdmin ? [...baseLinks, { href: "/admin", label: "Admin" }] : baseLinks;

  function isActiveLink(href: string) {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[92rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="max-w-[calc(100vw-145px)] truncate text-lg font-semibold tracking-tight text-slate-100 md:max-w-none"
        >
          <span className="bg-gradient-to-r from-slate-100 via-sky-100 to-violet-200 bg-clip-text text-transparent">
            SkillPath Academy
          </span>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "nav-link",
                isActiveLink(link.href) && "border border-slate-700 bg-slate-800/85 text-slate-100 shadow-glow",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          {status === "loading" && <span className="text-xs text-slate-500">Loading session...</span>}
          {isAuthenticated && session?.user && (
            <>
              <div className="flex items-center gap-2 rounded-full border border-slate-700/90 bg-slate-900/85 px-2.5 py-1.5">
                <UserCircle2 className="h-4 w-4 text-slate-400" />
                <span className="max-w-[130px] truncate text-xs text-slate-300">{session.user.email}</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    isAdmin
                      ? "border-orange-400/35 bg-orange-500/15 text-orange-200"
                      : "border-emerald-400/35 bg-emerald-500/15 text-emerald-200",
                  )}
                >
                  {isAdmin ? <Shield className="h-3 w-3" /> : null}
                  {role}
                </span>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="btn-secondary px-3 py-2 text-sm"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          )}
          {!isAuthenticated && status !== "loading" && (
            <Link
              href="/login"
              className="btn-primary"
            >
              Login
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={toggleSidebar}
          className="btn-secondary h-10 w-10 p-0 xl:hidden"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isSidebarOpen && (
        <div className="border-t border-slate-800 bg-slate-950/92 backdrop-blur-md xl:hidden">
          <nav className="mx-auto flex w-full max-w-[92rem] flex-col gap-1 p-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeSidebar}
                className={cn(
                  "nav-link",
                  isActiveLink(link.href) && "border border-slate-700 bg-slate-800/85 text-slate-100",
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  closeSidebar();
                  void signOut({ callbackUrl: "/login" });
                }}
                className="btn-secondary mt-2 inline-flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
            {!isAuthenticated && status !== "loading" && (
              <Link
                href="/login"
                onClick={closeSidebar}
                className="btn-primary mt-2 inline-flex items-center justify-center"
              >
                Login
              </Link>
            )}
            {isAuthenticated && session?.user && (
              <div className="mt-2 rounded-xl border border-slate-800 bg-slate-900/85 px-3 py-2 text-xs text-slate-400">
                <p className="truncate">{session.user.email}</p>
                <p className="mt-1 text-slate-300">Role: {role}</p>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
