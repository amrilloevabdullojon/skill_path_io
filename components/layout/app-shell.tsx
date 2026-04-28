"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { touchUserStreakAction } from "@/app/actions/streak";
import {
  Bell,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Command,
  FlameKindling,
  Home,
  Menu,
  Rocket,
  Target,
  Users,
} from "lucide-react";

import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SiteFooter } from "@/components/site-footer";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/user/use-ui-store";
import { SidebarNav } from "@/components/layout/sidebar-nav";

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
  { id: "home", labelKey: "home", href: "/dashboard", icon: Home },
  { id: "tracks", labelKey: "tracks", href: "/tracks", icon: Target },
  { id: "missions", labelKey: "missions", href: "/missions", icon: Rocket },
  { id: "jobs", labelKey: "jobs", href: "/marketplace", icon: BriefcaseBusiness },
  { id: "menu", labelKey: "menu", href: "#", icon: Menu },
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
  const [notificationCount, setNotificationCount] = useState(0);
  const [streakCount, setStreakCount] = useState<number | null>(null);
  
  const isAdmin = session?.user?.role === "ADMIN";
  const isAuthenticated = status === "authenticated";
  const isAuthScreen = pathname.startsWith("/login");
  const isMarketingRoute = pathname === "/";
  const isFocusLearningMode = /^\/tracks\/[^/]+\/modules\/[^/]+$/.test(pathname);
  const {
    isSidebarOpen,
    isSidebarCollapsed,
    toggleSidebar,
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

  useEffect(() => {
    let mounted = true;

    // 1. Load Notifications
    async function loadNotifications() {
      try {
        const response = await fetch("/api/notifications");
        if (!response.ok) return;
        const data = (await response.json()) as { notifications?: Array<{ id: string }> };
        if (mounted) {
          setNotificationCount(Array.isArray(data.notifications) ? data.notifications.length : 0);
        }
      } catch {
        if (mounted) setNotificationCount(0);
      }
    }

    // 2. Load and Touch User Streak (Lazy Update)
    async function touchAndLoadStreak() {
      if (isAuthenticated) {
        const result = await touchUserStreakAction(new Date().getTimezoneOffset());
        if (mounted && result.success && result.streak !== undefined) {
          setStreakCount(result.streak);
        }
      }
    }

    void loadNotifications();
    void touchAndLoadStreak();

    // 3. Refresh notifications when the user returns to the tab
    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && mounted) {
        void loadNotifications();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated]);

  if (isMarketingRoute) {
    return (
      <main className="min-h-screen">
        {children}
      </main>
    );
  }

  return (
    <>
      <div className="app-shell">
        {!isAuthScreen && !isFocusLearningMode ? (
          <>
            <aside
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

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          Skip to main content
        </a>

        <div className="app-main">
          {!isAuthScreen && !isFocusLearningMode ? (
            <header className="app-topbar premium-glow">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <Input
                    readOnly
                    onClick={openCommandPalette}
                    value=""
                    placeholder={t("searchPlaceholder")}
                    className="cursor-pointer pr-10"
                    aria-label={t("openCommandPalette")}
                  />
                  <Command className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                {isAuthenticated && streakCount !== null && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-card border rounded-full mr-2 shadow-sm font-mono text-sm font-bold border-orange-500/30 text-orange-500">
                    <FlameKindling className="h-4 w-4 fill-orange-500 text-orange-500" />
                    {streakCount}
                  </div>
                )}
                <LanguageSwitcher className="hidden lg:flex" />
                <Link href="/tracks" className="btn-secondary hidden lg:inline-flex">{t("quickActions")}</Link>
                <button type="button" onClick={openCommandPalette} className="btn-secondary hidden md:inline-flex">
                  {t("cmdK")}
                </button>
                <Link
                  href="/notifications"
                  className="btn-secondary relative h-10 w-10 p-0"
                  aria-label={t("notifications")}
                >
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-semibold text-white">
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
          {!isFocusLearningMode ? <SiteFooter /> : null}
        </div>
      </div>

      {!isAuthScreen && !isFocusLearningMode ? (
        <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
          {mobileBottomItems.map((item) => {
            const Icon = item.icon;
            const label = t(item.labelKey as Parameters<typeof t>[0]);
            return item.id === "menu" ? (
              <button
                key={item.id}
                type="button"
                onClick={toggleSidebar}
                className={cn("mobile-bottom-link", isSidebarOpen && "mobile-bottom-link-active")}
                aria-expanded={isSidebarOpen}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ) : (
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
