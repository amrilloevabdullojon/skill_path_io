"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Bell,
  ChartLine,
  ChevronLeft,
  ChevronRight,
  Command,
  FlameKindling,
  FolderKanban,
  Home,
  Rocket,
  Target,
  Users,
} from "lucide-react";

import { DensityToggle } from "@/components/ui/density-toggle";
import { Dropdown } from "@/components/ui/dropdown";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SiteFooter } from "@/components/site-footer";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/user/use-ui-store";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { useShellData } from "@/hooks/use-shell-data";

const AppCommandPalette = dynamic(
  () => import("@/components/layout/app-command-palette").then((mod) => mod.AppCommandPalette),
  { ssr: false },
);

type AppShellProps = {
  children: React.ReactNode;
};

type NavItem = {
  id: string;
  labelKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const mobileBottomItems: NavItem[] = [
  { id: "today", labelKey: "today", href: "/dashboard", icon: Home },
  { id: "study", labelKey: "study", href: "/tracks", icon: Target },
  { id: "practice", labelKey: "practice", href: "/missions", icon: Rocket },
  { id: "progress", labelKey: "progress", href: "/dashboard?tab=skills", icon: ChartLine },
  { id: "portfolio", labelKey: "portfolio", href: "/portfolio", icon: FolderKanban },
];

function isActive(pathname: string, href: string) {
  const targetPath = href.split("?")[0]?.split("#")[0] || href;
  return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  const isAdmin = session?.user?.role === "ADMIN";
  const isAuthenticated = status === "authenticated";
  const isFunnelScreen =
    pathname.startsWith("/skill-test") || pathname.startsWith("/onboarding");
  const isAuthScreen = pathname.startsWith("/login") || isFunnelScreen;
  const isMarketingRoute = pathname === "/";
  const isFocusLearningMode = /^\/tracks\/[^/]+\/modules\/[^/]+$/.test(pathname);

  const { notificationCount, streakCount } = useShellData(isAuthenticated);
  const {
    isSidebarOpen,
    isSidebarCollapsed,
    closeSidebar,
    toggleSidebarCollapsed,
    openCommandPalette,
  } = useUiStore();

  const handleSidebarToggle = useCallback(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      toggleSidebarCollapsed();
    } else {
      closeSidebar();
    }
  }, [toggleSidebarCollapsed, closeSidebar]);

  // ESC key closes mobile drawer (a11y + expected behaviour).
  useEffect(() => {
    if (!isSidebarOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSidebar();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSidebarOpen, closeSidebar]);

  // Swipe-left on mobile drawer closes it.
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (!isSidebarOpen) return;
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [isSidebarOpen]);
  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (!isSidebarOpen || !touchStartRef.current) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      touchStartRef.current = null;
      // Horizontal left-swipe with > 60px delta, dominant over vertical → close.
      if (dx < -60 && Math.abs(dx) > Math.abs(dy)) {
        closeSidebar();
      }
    },
    [isSidebarOpen, closeSidebar],
  );

  const userEmail = session?.user?.email;
  const userDropdownItems = useMemo(
    () => [
      { id: "profile", label: userEmail ?? "Not signed in", href: "/login" },
      { id: "dashboard", label: tCommon("openDashboard"), href: "/dashboard" },
      ...(isAdmin ? [{ id: "admin", label: t("admin"), href: "/admin" }] : []),
      ...(isAuthenticated
        ? [
            {
              id: "logout",
              label: t("logout"),
              destructive: true,
              onSelect: () => {
                void signOut({ callbackUrl: "/login" });
              },
            },
          ]
        : [{ id: "login", label: t("login"), href: "/login" }]),
    ],
    [isAdmin, isAuthenticated, userEmail, t, tCommon],
  );

  if (isMarketingRoute) {
    return (
      <main className="min-h-screen">
        {children}
      </main>
    );
  }

  return (
    <>
      <div className={cn("app-shell", (isAuthScreen || isFocusLearningMode) && "lg:!grid-cols-1")}>
        {!isAuthScreen && !isFocusLearningMode ? (
          <>
            <aside
              id="sidebar-nav"
              aria-label="Основная навигация"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className={cn(
                "app-sidebar",
                isSidebarCollapsed ? "hidden w-24 lg:block" : "",
                isSidebarOpen ? "translate-x-0" : "-translate-x-[110%] lg:translate-x-0",
              )}
            >
              <div className="flex h-full min-h-0 flex-col">
                <div
                  className={cn(
                    "sidebar-header-divider",
                    isSidebarCollapsed ? "justify-center" : "justify-between",
                  )}
                >
                  <Link href="/" className="flex min-w-0 items-center gap-2">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_12px_rgba(99,102,241,0.5)]">
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="13" width="3" height="5" rx="1" fill="white" opacity="0.45"/>
                        <rect x="7" y="10" width="3" height="8" rx="1" fill="white" opacity="0.7"/>
                        <rect x="12" y="7" width="3" height="11" rx="1" fill="white" opacity="0.9"/>
                        <rect x="17" y="3" width="3" height="15" rx="1" fill="white"/>
                        <circle cx="18.5" cy="2" r="1.5" fill="#fbbf24"/>
                      </svg>
                    </span>
                    {!isSidebarCollapsed && (
                      <span className="site-header-logo-text truncate text-sm font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        levio
                      </span>
                    )}
                  </Link>
                  <button
                    type="button"
                    onClick={handleSidebarToggle}
                    className="btn-secondary h-8 w-8 shrink-0 p-0"
                    aria-label="Toggle sidebar"
                  >
                    {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </button>
                </div>

                <SidebarNav />
              </div>
            </aside>

            {isSidebarOpen ? (
              <button
                type="button"
                onClick={closeSidebar}
                aria-label="Close sidebar overlay"
                className="sidebar-overlay"
              />
            ) : null}
          </>
        ) : null}

        <div className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:left-4 focus-within:top-4 focus-within:z-tooltip focus-within:flex focus-within:flex-col focus-within:gap-1.5">
          <a
            href="#main-content"
            className="rounded-xl bg-background px-4 py-2 text-sm font-semibold text-foreground ring-2 ring-indigo-500"
          >
            Skip to main content
          </a>
          <a
            href="#sidebar-nav"
            className="rounded-xl bg-background px-4 py-2 text-sm font-semibold text-foreground ring-2 ring-indigo-500"
          >
            Skip to navigation
          </a>
        </div>

        <div className="app-main">
          {!isAuthScreen && !isFocusLearningMode ? (
            <header className="app-topbar">
              <button
                type="button"
                onClick={openCommandPalette}
                className="input-base flex flex-1 items-center justify-between gap-2 text-left text-muted-foreground"
                aria-label={t("openCommandPalette")}
              >
                <span className="flex items-center gap-2 truncate">
                  <Command className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t("searchPlaceholder")}</span>
                </span>
              </button>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                {isAuthenticated && streakCount !== null && (
                  <span className="xp-pill hidden items-center gap-1.5 px-3 py-1.5 font-mono text-sm font-bold text-orange-400 sm:inline-flex">
                    <FlameKindling className="h-4 w-4 fill-orange-400" />
                    {streakCount}
                  </span>
                )}
                <DensityToggle className="hidden xl:inline-flex" />
                <LanguageSwitcher className="hidden lg:flex" />
                <Link
                  href="/notifications"
                  className="btn-secondary relative h-10 w-10 p-0"
                  aria-label={t("notifications")}
                >
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-semibold text-primary-foreground">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  ) : (
                    <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  )}
                </Link>

                <Dropdown
                  className="lg:hidden"
                  align="right"
                  trigger={
                    <span className="topbar-user-trigger">
                      <Users className="topbar-user-icon" />
                      <span className="hidden sm:inline">{session?.user?.role ?? "Guest"}</span>
                    </span>
                  }
                  items={userDropdownItems}
                />
              </div>
            </header>
          ) : null}

          {isFocusLearningMode ? (
            <div className="focus-mode-banner">
              <p>{t("focusMode")}</p>
              <Link href="/dashboard" className="btn-secondary h-8 px-3 py-1 text-xs">
                {t("exitFocusMode")}
              </Link>
            </div>
          ) : null}

          <main id="main-content" className={cn("min-w-0", !isAuthScreen ? "px-1 pb-2 sm:px-2" : "px-1")}>{children}</main>
          {!isFocusLearningMode && !isFunnelScreen ? <SiteFooter /> : null}
        </div>
      </div>

      {!isAuthScreen && !isFocusLearningMode ? (
        <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
          {mobileBottomItems.map((item) => {
            const Icon = item.icon;
            const label = t(item.labelKey as Parameters<typeof t>[0]);
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className={cn("mobile-bottom-link", isActive(pathname, item.href) && "mobile-bottom-link-active")}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}

      <AppCommandPalette isAdmin={isAdmin} />
    </>
  );
}
