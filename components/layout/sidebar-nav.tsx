"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import {
  BarChart3,
  Bot,
  Brain,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChartLine,
  ChevronDown,
  Command,
  CreditCard,
  Database,
  FlameKindling,
  FolderKanban,
  GitBranch,
  Layers,
  LayoutDashboard,
  LogOut,
  MapPin,
  Network,
  Rocket,
  Scan,
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

import { cn } from "@/lib/utils";
import { Dropdown } from "@/components/ui/dropdown";
import { useUiStore } from "@/store/user/use-ui-store";

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
      { id: "resumeScanner", labelKey: "resumeScanner", href: "/resume-scanner", icon: Scan },
      { id: "interviewPreview", labelKey: "interviewPreview", href: "/interview-preview", icon: Bot },
      { id: "public-profile", labelKey: "publicProfile", href: "/profile/me", icon: UserCircle2 },
    ],
  },
  {
    id: "community",
    titleKey: "community",
    items: [
      { id: "leaderboard", labelKey: "leaderboard", href: "/leaderboard", icon: Trophy },
      { id: "peerReview", labelKey: "peerReview", href: "/peer-review", icon: Layers },
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
    id: "tools",
    titleKey: "tools",
    items: [
      { id: "api-sandbox", labelKey: "apiSandbox", href: "/tools/api-sandbox", icon: Network },
      { id: "sql-sandbox", labelKey: "sqlSandbox", href: "/tools/sql-sandbox", icon: Database },
    ],
  },
  {
    id: "admin",
    titleKey: "admin",
    items: [{ id: "admin-link", labelKey: "admin", href: "/admin", icon: Shield, adminOnly: true }],
  },
];

function isActive(pathname: string, href: string) {
  const targetPath = href.split("?")[0]?.split("#")[0] || href;
  return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
}

export function SidebarNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const { isSidebarCollapsed, closeSidebar, openCommandPalette } = useUiStore();
  
  const isAdmin = session?.user?.role === "ADMIN";
  
  // State for collapsible groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Quick tip dismiss state (persisted in localStorage)
  const [quickTipDismissed, setQuickTipDismissed] = useState(true); // start hidden to avoid flash
  useEffect(() => {
    setQuickTipDismissed(localStorage.getItem("levio:quickTipDismissed") === "true");
  }, []);

  const dismissQuickTip = () => {
    localStorage.setItem("levio:quickTipDismissed", "true");
    setQuickTipDismissed(true);
  };

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

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

  return (
    <div className="flex h-full min-h-0 flex-col pb-4">
      <nav className="sidebar-scroll flex-1 px-3 py-4 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {visibleSidebarGroups.map((group) => {
          const isCollapsed = collapsedGroups[group.id];
          const groupLabel = group.id === "tools" ? "Тренажеры" : t(group.titleKey as Parameters<typeof t>[0]);

          return (
            <div key={group.id} className="flex flex-col gap-1">
              {!isSidebarCollapsed && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none group"
                >
                  {groupLabel}
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      isCollapsed ? "-rotate-90" : "rotate-0"
                    )}
                  />
                </button>
              )}
              
              <AnimatePresence initial={false}>
                {(!isCollapsed || isSidebarCollapsed) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="flex flex-col gap-1 overflow-hidden"
                  >
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(pathname, item.href);
                      let label = "";
                      if (item.id === "api-sandbox") label = "API Sandbox";
                      else if (item.id === "sql-sandbox") label = "SQL Sandbox";
                      else label = t(item.labelKey as Parameters<typeof t>[0]);
                      
                      return (
                        <div key={item.id} className="relative group">
                          <Link
                            href={item.href}
                            onClick={closeSidebar}
                            className={cn(
                              "relative z-10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 select-none",
                              active
                                ? "text-indigo-700 dark:text-indigo-300"
                                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
                              isSidebarCollapsed && "justify-center px-0 h-11 w-11 mx-auto"
                            )}
                            aria-label={isSidebarCollapsed ? label : undefined}
                            aria-current={active ? "page" : undefined}
                          >
                            <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-indigo-600 dark:text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]")} />
                            {!isSidebarCollapsed && <span className="truncate">{label}</span>}
                          </Link>
                          
                          {/* Premium Active Background Layout Animation */}
                          {active && (
                            <motion.div
                              layoutId="active-sidebar-pill"
                              className={cn(
                                "absolute inset-0 z-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.08)!important] glassmorphism",
                                isSidebarCollapsed && "mx-auto w-11"
                              )}
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                          )}

                          {/* Tooltip for collapsed mode */}
                          {isSidebarCollapsed && (
                            <div className="pointer-events-none fixed left-16 z-50 ml-2 rounded-lg border bg-popover px-3 py-2 text-sm font-semibold text-popover-foreground shadow-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 backdrop-blur-md">
                              {label}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Bottom Profile / Quick Tip Section */}
      <div className="mt-auto px-4 pb-0 pt-4 flex flex-col gap-4 border-t border-border/40">
        {!isSidebarCollapsed && !quickTipDismissed && (
          <div className="relative flex items-start gap-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-3 border border-indigo-500/20 group">
            <button
              type="button"
              onClick={openCommandPalette}
              className="flex items-start gap-3 flex-1 text-left"
              aria-label={t("quickTip")}
            >
              <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shrink-0">
                <Command className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-0.5">{t("quickTip")}</p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">{t("quickTipText")}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={dismissQuickTip}
              aria-label={t("quickTipDismiss")}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <Dropdown
          align={isSidebarCollapsed ? "left" : "right"}
          trigger={
            <div className={cn(
              "flex items-center gap-3 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-border/50",
              isSidebarCollapsed ? "p-2 mx-auto justify-center" : "p-2 w-full text-left"
            )}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md">
                <Users className="h-5 w-5 text-white" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex min-w-0 flex-1 flex-col mr-2">
                  <span className="truncate text-sm font-bold text-foreground">
                    {session?.user?.name || "Levio User"}
                  </span>
                  <span className="truncate text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-0.5">
                    {session?.user?.role || "GUEST"}
                  </span>
                </div>
              )}
            </div>
          }
          items={[
            { id: "profile", label: session?.user?.email ?? "—", href: "/profile" },
            { id: "dashboard", label: t("dashboard"), href: "/dashboard" },
            ...(isAdmin ? [{ id: "admin", label: t("adminPanel"), href: "/admin", icon: <Shield className="w-4 h-4" /> }] : []),
            {
              id: "logout",
              label: t("logout"),
              destructive: true,
              icon: <LogOut className="w-4 h-4 ml-auto" />,
              onSelect: () => {
                void signOut({ callbackUrl: "/login" });
              },
            },
          ]}
        />
      </div>
    </div>
  );
}
