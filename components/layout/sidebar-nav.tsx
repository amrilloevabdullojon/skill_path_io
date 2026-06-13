"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import {
  ChartLine,
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Rocket,
  Shield,
  Target,
  Users,
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
    id: "learn",
    titleKey: "groups",
    items: [
      { id: "today", labelKey: "today", href: "/dashboard", icon: LayoutDashboard },
      { id: "study", labelKey: "study", href: "/tracks", icon: Target },
      { id: "practice", labelKey: "practice", href: "/missions", icon: Rocket },
      { id: "progress", labelKey: "progress", href: "/dashboard?tab=skills", icon: ChartLine },
      { id: "portfolio", labelKey: "portfolio", href: "/portfolio", icon: FolderKanban },
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
  const { isSidebarCollapsed, closeSidebar } = useUiStore();
  
  const isAdmin = session?.user?.role === "ADMIN";
  
  // State for collapsible groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

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
      <nav id="sidebar-nav" aria-label="Main navigation" className="sidebar-scroll px-3 py-4 space-y-6 overflow-x-hidden">
        {visibleSidebarGroups.map((group) => {
          const isCollapsed = collapsedGroups[group.id];
          const groupLabel = t(group.titleKey as Parameters<typeof t>[0]);

          return (
            <div key={group.id} className="flex flex-col gap-1">
              {!isSidebarCollapsed && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="sidebar-group-label flex w-full items-center justify-between px-3 py-1.5 hover:text-foreground transition-colors select-none"
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
                      const label = t(item.labelKey as Parameters<typeof t>[0]);
                      
                      return (
                        <div key={item.id} className="relative group">
                          <Link
                            href={item.href}
                            onClick={closeSidebar}
                            className={cn(
                              "focus-ring relative z-10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 select-none",
                              active
                                ? "text-indigo-700 dark:text-indigo-300"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
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

      {/* Bottom Profile Section */}
      <div className="mt-auto px-4 pb-0 pt-4 flex flex-col gap-4 border-t border-border-subtle">
        <Dropdown
          align={isSidebarCollapsed ? "left" : "right"}
          trigger={
            <div className={cn(
              "flex items-center gap-3 rounded-xl transition-colors hover:bg-secondary/50 border border-transparent hover:border-border/50",
              isSidebarCollapsed ? "p-2 mx-auto justify-center" : "p-2 w-full text-left"
            )}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md">
                <Users className="h-5 w-5 text-primary-foreground" />
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
