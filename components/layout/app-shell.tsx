"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Bell,
  BarChart3,
  BookMarked,
  Bot,
  Brain,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  ChartLine,
  ChevronLeft,
  ChevronRight,
  Command,
  CreditCard,
  FlameKindling,
  FolderKanban,
  GitBranch,
  Home,
  LayoutDashboard,
  MapPin,
  Menu,
  Newspaper,
  Rocket,
  Shield,
  Sparkles,
  Store,
  Target,
  Trophy,
  UserCircle2,
  Users,
  Wand2,
  X,
  Zap,
} from "lucide-react";

import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SiteFooter } from "@/components/site-footer";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/user/use-ui-store";

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

type NavGroup = {
  id: string;
  titleKey: string;
  items: NavItem[];
};

const sidebarGroups: NavGroup[] = [
  {
    id: "learning",
    titleKey: "groups",
    items: [
      { id: "overview", labelKey: "overview", href: "/dashboard?tab=overview", icon: LayoutDashboard },
      { id: "tracks", labelKey: "tracks", href: "/tracks", icon: Target },
      { id: "missions", labelKey: "missions", href: "/missions", icon: Rocket },
      { id: "quests", labelKey: "weeklyQuests", href: "/dashboard?tab=overview#quests", icon: FlameKindling },
      { id: "planner", labelKey: "planner", href: "/planner", icon: CalendarDays },
    ],
  },
  {
    id: "skills",
    titleKey: "skills",
    items: [
      { id: "skill-radar", labelKey: "skillRadar", href: "/dashboard?tab=skills#skills", icon: ChartLine },
      { id: "skill-tree", labelKey: "skillTree", href: "/dashboard?tab=skills#tree", icon: GitBranch },
      { id: "xp-level", labelKey: "xpLevel", href: "/dashboard?tab=skills#xp", icon: Zap },
      { id: "heatmap", labelKey: "heatmap", href: "/dashboard?tab=skills#heatmap", icon: Brain },
    ],
  },
  {
    id: "career",
    titleKey: "career",
    items: [
      { id: "career", labelKey: "career", href: "/career", icon: MapPin },
      { id: "jobs", labelKey: "jobs", href: "/jobs", icon: BriefcaseBusiness },
      { id: "marketplace", labelKey: "marketplace", href: "/marketplace", icon: Store },
      { id: "portfolio", labelKey: "portfolio", href: "/portfolio", icon: FolderKanban },
      { id: "interview", labelKey: "interview", href: "/interview", icon: Newspaper },
      { id: "review", labelKey: "review", href: "/review", icon: BookMarked },
      { id: "public-profile", labelKey: "publicProfile", href: "/profile/me", icon: UserCircle2 },
    ],
  },
  {
    id: "community",
    titleKey: "community",
    items: [
      { id: "leaderboard", labelKey: "leaderboard", href: "/leaderboard", icon: Trophy },
      { id: "activity", labelKey: "activity", href: "/dashboard?tab=overview#activity", icon: Users },
    ],
  },
  {
    id: "ai-tools",
    titleKey: "aiTools",
    items: [
      { id: "adaptive", labelKey: "adaptivePath", href: "/dashboard?tab=skills#adaptive", icon: Wand2 },
      { id: "ai-reco", labelKey: "aiRecommendations", href: "/dashboard?tab=skills#ai", icon: Sparkles },
      { id: "next-actions", labelKey: "nextActions", href: "/dashboard?tab=overview#actions", icon: Bot },
    ],
  },
  {
    id: "saas",
    titleKey: "saas",
    items: [
      { id: "billing", labelKey: "billing", href: "/billing", icon: CreditCard },
      { id: "advanced-analytics", labelKey: "advancedAnalytics", href: "/analytics/advanced", icon: BarChart3 },
      { id: "teams", labelKey: "teams", href: "/teams", icon: Building2 },
    ],
  },
  {
    id: "admin",
    titleKey: "admin",
    items: [{ id: "admin-link", labelKey: "admin", href: "/admin", icon: Shield, adminOnly: true }],
  },
];

const mobileBottomItems: NavItem[] = [
  { id: "home", labelKey: "home", href: "/dashboard", icon: Home },
  { id: "tracks", labelKey: "tracks", href: "/tracks", icon: Target },
  { id: "missions", labelKey: "missions", href: "/missions", icon: Rocket },
  { id: "jobs", labelKey: "jobs", href: "/marketplace", icon: BriefcaseBusiness },
  { id: "profile", labelKey: "profile", href: "/profile/me", icon: UserCircle2 },
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

  const visibleSidebarGroups = useMemo(
    () =>
      sidebarGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => (item.adminOnly ? isAdmin : true)),
        }))
        .filter((group) => group.items.length > 0),
    [isAdmin],
  );

  useEffect(() => {
    let mounted = true;

    async function loadNotifications() {
      try {
        const response = await fetch("/api/notifications");
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { notifications?: Array<{ id: string }> };
        if (mounted) {
          setNotificationCount(Array.isArray(data.notifications) ? data.notifications.length : 0);
        }
      } catch {
        if (mounted) {
          setNotificationCount(0);
        }
      }
    }

    void loadNotifications();

    return () => {
      mounted = false;
    };
  }, []);

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
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-sky-400/30 bg-sky-500/15 text-sky-300">
                      <Sparkles className="h-3 w-3" />
                    </span>
                    {!isSidebarCollapsed && (
                      <span className="site-header-logo-text truncate text-sm font-semibold">
                        SkillPath Academy
                      </span>
                    )}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.matchMedia("(min-width: 1024px)").matches) {
                        toggleSidebarCollapsed();
                      } else {
                        closeSidebar();
                      }
                    }}
                    className="btn-secondary h-8 w-8 shrink-0 p-0"
                    aria-label="Toggle sidebar"
                  >
                    {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </button>
                </div>

                <nav className="sidebar-scroll">
                  {visibleSidebarGroups.map((group) => (
                    <div
                      key={group.id}
                      className={cn(
                        "space-y-1",
                        isSidebarCollapsed ? "sidebar-group-divider" : "",
                      )}
                    >
                      {!isSidebarCollapsed ? (
                        <p className="sidebar-group-label">
                          {t(group.titleKey as Parameters<typeof t>[0])}
                        </p>
                      ) : null}
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(pathname, item.href);
                        const label = t(item.labelKey as Parameters<typeof t>[0]);
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={closeSidebar}
                            className={cn(
                              "app-sidebar-link",
                              active && "app-sidebar-link-active",
                              isSidebarCollapsed && "mx-auto h-10 w-10 justify-center rounded-2xl border border-transparent px-0",
                              isSidebarCollapsed && active && "border-transparent bg-gradient-to-br from-sky-500/25 to-indigo-500/20 text-white shadow-[0_0_0_1px_rgba(56,189,248,0.22),0_6px_16px_rgba(2,6,23,0.4)]",
                            )}
                            aria-label={isSidebarCollapsed ? label : undefined}
                            aria-current={active ? "page" : undefined}
                            title={isSidebarCollapsed ? label : undefined}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            {isSidebarCollapsed ? null : <span className="truncate">{label}</span>}
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </nav>

                {!isSidebarCollapsed ? (
                  <button type="button" onClick={openCommandPalette} className="sidebar-quick-tip">
                    <div className="flex items-center gap-1.5">
                      <Command className="h-3 w-3 shrink-0 text-sky-400/70" />
                      <p className="sidebar-quick-tip-title">{t("quickTip")}</p>
                    </div>
                    <p className="mt-1">{t("quickTipText")}</p>
                  </button>
                ) : null}
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
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:ring-2 focus:ring-sky-500 focus:outline-none"
        >
          Skip to main content
        </a>

        <div className="app-main">
          {!isAuthScreen && !isFocusLearningMode ? (
            <header className="app-topbar premium-glow">
              <div className="flex flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="btn-secondary h-10 w-10 p-0 lg:hidden"
                  aria-label={t("openNavigation")}
                >
                  {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>
                <div className="relative min-w-0 flex-1">
                  <Input
                    readOnly
                    onClick={openCommandPalette}
                    value=""
                    placeholder="Search modules, missions, jobs... (Cmd/Ctrl + K)"
                    className="cursor-pointer pr-10"
                    aria-label={t("openCommandPalette")}
                  />
                  <Command className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <LanguageSwitcher className="hidden sm:flex" />
                <Link href="/tracks" className="btn-secondary hidden sm:inline-flex">{t("quickActions")}</Link>
                <button type="button" onClick={openCommandPalette} className="btn-secondary hidden md:inline-flex">
                  Cmd + K
                </button>
                <Link
                  href="/dashboard?tab=overview#notifications"
                  className="btn-secondary relative h-10 w-10 p-0"
                  aria-label={t("notifications")}
                >
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-400 px-1 text-[10px] font-semibold text-slate-950">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  ) : (
                    <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-sky-400" />
                  )}
                </Link>

                <Dropdown
                  align="right"
                  trigger={
                    <span className="topbar-user-trigger">
                      <Users className="topbar-user-icon" />
                      <span className="hidden sm:inline">{session?.user?.role ?? "Guest"}</span>
                    </span>
                  }
                  items={[
                    { id: "profile", label: session?.user?.email ?? "Not signed in", href: "/login" },
                    { id: "dashboard", label: tCommon("openDashboard"), href: "/dashboard" },
                    ...(isAdmin ? [{ id: "admin", label: t("admin"), href: "/admin" }] : []),
                    ...(isAuthenticated
                      ? [
                          {
                            id: "logout",
                            label: "Logout",
                            destructive: true,
                            onSelect: () => {
                              void signOut({ callbackUrl: "/login" });
                            },
                          },
                        ]
                      : [{ id: "login", label: "Login", href: "/login" }]),
                  ]}
                />
              </div>
            </header>
          ) : null}

          {isFocusLearningMode ? (
            <div className="focus-mode-banner">
              <p>Режим фокусного обучения</p>
              <Link href="/dashboard" className="btn-secondary h-8 px-3 py-1 text-xs">
                Выйти
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
