import Link from "next/link";
import { Activity, CalendarDays, CreditCard, LayoutDashboard, Sparkles, Target } from "lucide-react";

import { DashboardTabsNav, DashboardTab } from "@/components/dashboard/dashboard-tabs-nav";
import { cn } from "@/lib/utils";

type DashboardTopbarProps = {
  name: string;
  role: "ADMIN" | "STUDENT";
  currentTab: DashboardTab;
};

export function DashboardTopbar({ name, role, currentTab }: DashboardTopbarProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="surface-elevated space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-sky-300">
            <LayoutDashboard className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Dashboard</h1>
            <p className="section-description truncate">{name}&apos;s learning command center</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="topbar-info-pill">
            <CalendarDays className="topbar-info-pill-icon h-3.5 w-3.5" />
            {formattedDate}
          </span>
          <span
            className={cn(
              "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
              role === "ADMIN" ? "badge-role-admin" : "badge-role-student",
            )}
          >
            {role}
          </span>
        </div>
      </div>

      <DashboardTabsNav currentTab={currentTab} />

      <div className="flex flex-wrap items-center gap-2">
        <Link href="/tracks" className="topbar-action-link">
          <Target className="topbar-action-icon h-3.5 w-3.5" />
          Open tracks
        </Link>
        <Link href="/interview" className="topbar-action-link">
          <Activity className="topbar-action-icon h-3.5 w-3.5" />
          Mock interview
        </Link>
        <Link href="/career" className="topbar-action-link">
          <Sparkles className="topbar-action-icon h-3.5 w-3.5" />
          Career roadmap
        </Link>
        <Link href="/billing" className="topbar-action-link">
          <CreditCard className="topbar-action-icon h-3.5 w-3.5" />
          Billing
        </Link>
      </div>
    </header>
  );
}
