"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Bell,
  BarChart3,
  Building2,
  BriefcaseBusiness,
  ChartLine,
  ChevronLeft,
  ChevronRight,
  Command,
  CreditCard,
  FolderKanban,
  Home,
  LayoutDashboard,
  Menu,
  Rocket,
  Shield,
  Target,
  UserCircle2,
  Users,
  X,
} from "lucide-react";

import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
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
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

type NavGroup = {
  id: string;
  title: string;
  items: NavItem[];
};

const sidebarGroups: NavGroup[] = [
  {
    id: "learning",
    title: "Learning",
    items: [
      { id: "overview", label: "Overview", href: "/dashboard?tab=overview", icon: LayoutDashboard },
      { id: "tracks", label: "Tracks", href: "/tracks", icon: Target },
      { id: "missions", label: "Missions", href: "/missions", icon: Rocket },
      { id: "quests", label: "Weekly quests", href: "/dashboard?tab=overview#quests", icon: Home },
      { id: "planner", label: "Planner", href: "/planner", icon: Home },
    ],
  },
  {
    id: "skills",
    title: "Skills",
    items: [
      { id: "skill-radar", label: "Skill radar", href: "/dashboard?tab=skills#skills", icon: ChartLine },
      { id: "skill-tree", label: "Skill tree", href: "/dashboard?tab=skills#tree", icon: ChartLine },
      { id: "xp-level", label: "XP & level", href: "/dashboard?tab=skills#xp", icon: ChartLine },
      { id: "heatmap", label: "Heatmap", href: "/dashboard?tab=skills#heatmap", icon: ChartLine },
    ],
  },
  {
    id: "career",
    title: "Career",
    items: [
      { id: "career", label: "Career", href: "/career", icon: BriefcaseBusiness },
      { id: "jobs", label: "Jobs", href: "/jobs", icon: BriefcaseBusiness },
      { id: "marketplace", label: "Marketplace", href: "/marketplace", icon: BriefcaseBusiness },
      { id: "portfolio", label: "Portfolio", href: "/portfolio", icon: FolderKanban },
      { id: "interview", label: "Interview", href: "/interview", icon: BriefcaseBusiness },
      { id: "review", label: "Review", href: "/review", icon: BriefcaseBusiness },
      { id: "public-profile", label: "Public profile", href: "/profile/me", icon: UserCircle2 },
    ],
  },
  {
    id: "community",
    title: "Community",
    items: [
      { id: "leaderboard", label: "Leaderboard", href: "/leaderboard", icon: Users },
      { id: "activity", label: "Activity", href: "/dashboard?tab=overview#activity", icon: Users },
    ],
  },
  {
    id: "ai-tools",
    title: "AI Tools",
    items: [
      { id: "adaptive", label: "Adaptive path", href: "/dashboard?tab=skills#adaptive", icon: Command },
      { id: "ai-reco", label: "AI recommendations", href: "/dashboard?tab=skills#ai", icon: Command },
      { id: "next-actions", label: "Next actions", href: "/dashboard?tab=overview#actions", icon: Command },
    ],
  },
  {
    id: "saas",
    title: "SaaS",
    items: [
      { id: "billing", label: "Billing", href: "/billing", icon: CreditCard },
      { id: "advanced-analytics", label: "Advanced analytics", href: "/analytics/advanced", icon: BarChart3 },
      { id: "teams", label: "Teams", href: "/teams", icon: Building2 },
    ],
  },
  {
    id: "admin",
    title: "Admin",
    items: [{ id: "admin-link", label: "Admin", href: "/admin", icon: Shield, adminOnly: true }],
  },
];

const mobileBottomItems: NavItem[] = [
  { id: "home", label: "Home", href: "/dashboard", icon: Home },
  { id: "tracks", label: "Tracks", href: "/tracks", icon: Target },
  { id: "missions", label: "Missions", href: "/missions", icon: Rocket },
  { id: "jobs", label: "Jobs", href: "/marketplace", icon: BriefcaseBusiness },
  { id: "profile", label: "Profile", href: "/login", icon: Users },
];

function isActive(pathname: string, href: string) {
  const targetPath = href.split("?")[0]?.split("#")[0] || href;
  return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
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
                    "mb-2 flex shrink-0 items-center gap-2 border-b border-slate-800/80 px-1 pb-3",
                    isSidebarCollapsed ? "justify-center" : "justify-between",
                  )}
                >
                  <Link href="/" className="truncate bg-gradient-to-r from-slate-100 via-sky-100 to-violet-200 bg-clip-text text-sm font-semibold text-transparent">
                    {isSidebarCollapsed ? "SP" : "SkillPath Academy"}
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

                <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 overscroll-contain [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700/70 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
                  {visibleSidebarGroups.map((group) => (
                    <div
                      key={group.id}
                      className={cn(
                        "space-y-1",
                        isSidebarCollapsed ? "mt-3 border-t border-slate-800/80 pt-3 first:mt-0 first:border-t-0 first:pt-0" : "",
                      )}
                    >
                      {!isSidebarCollapsed ? (
                        <p className="px-2 text-[10px] uppercase tracking-[0.16em] text-slate-500">{group.title}</p>
                      ) : null}
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(pathname, item.href);
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={closeSidebar}
                            className={cn(
                              "app-sidebar-link",
                              active && "app-sidebar-link-active",
                              isSidebarCollapsed && "mx-auto h-10 w-10 justify-center rounded-2xl border border-transparent px-0",
                              isSidebarCollapsed && active && "border-sky-400/35 bg-sky-500/15 text-sky-100 shadow-[0_0_0_1px_rgba(56,189,248,0.25),0_10px_20px_rgba(2,6,23,0.42)]",
                            )}
                            aria-label={isSidebarCollapsed ? item.label : undefined}
                            title={isSidebarCollapsed ? item.label : undefined}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            {isSidebarCollapsed ? null : <span className="truncate">{item.label}</span>}
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </nav>

                {!isSidebarCollapsed ? (
                  <div className="mt-3 shrink-0 rounded-xl border border-slate-800 bg-slate-900/75 p-3 text-xs text-slate-400">
                    <p className="font-semibold text-slate-200">Quick tip</p>
                    <p className="mt-1">Press Cmd/Ctrl + K to search lessons, missions, jobs, and admin entities.</p>
                  </div>
                ) : null}
              </div>
            </aside>

            {isSidebarOpen ? (
              <button
                type="button"
                onClick={closeSidebar}
                aria-label="Close sidebar overlay"
                className="fixed inset-0 z-30 bg-slate-950/45 lg:hidden"
              />
            ) : null}
          </>
        ) : null}

        <div className="app-main">
          {!isAuthScreen && !isFocusLearningMode ? (
            <header className="app-topbar premium-glow">
              <div className="flex flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="btn-secondary h-10 w-10 p-0 lg:hidden"
                  aria-label="Open navigation"
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
                    aria-label="Open command palette"
                  />
                  <Command className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link href="/tracks" className="btn-secondary hidden sm:inline-flex">Quick actions</Link>
                <button type="button" onClick={openCommandPalette} className="btn-secondary hidden md:inline-flex">
                  Cmd + K
                </button>
                <Link
                  href="/dashboard?tab=overview#notifications"
                  className="btn-secondary relative h-10 w-10 p-0"
                  aria-label="Notifications"
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
                    <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/85 px-3 text-sm text-slate-200">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="hidden sm:inline">{session?.user?.role ?? "Guest"}</span>
                    </span>
                  }
                  items={[
                    { id: "profile", label: session?.user?.email ?? "Not signed in", href: "/login" },
                    { id: "dashboard", label: "Open dashboard", href: "/dashboard" },
                    ...(isAdmin ? [{ id: "admin", label: "Open admin", href: "/admin" }] : []),
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
            <div className="surface-glass mb-4 flex items-center justify-between gap-2 p-2 text-xs text-slate-300">
              <p>Focus learning mode enabled</p>
              <Link href="/dashboard" className="btn-secondary h-8 px-3 py-1 text-xs">
                Exit focus mode
              </Link>
            </div>
          ) : null}

          <main className={cn("min-w-0", !isAuthScreen ? "px-1 pb-2 sm:px-2" : "px-1")}>{children}</main>
          {!isFocusLearningMode ? <SiteFooter /> : null}
        </div>
      </div>

      {!isAuthScreen && !isFocusLearningMode ? (
        <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
          {mobileBottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn("mobile-bottom-link", isActive(pathname, item.href) && "mobile-bottom-link-active")}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}

      <AppCommandPalette isAdmin={isAdmin} />
    </>
  );
}
