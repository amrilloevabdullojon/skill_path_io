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
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/85 text-sky-300">
            <LayoutDashboard className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-slate-100">Dashboard</h1>
            <p className="truncate text-sm text-slate-300">{name}&apos;s learning command center</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/85 px-3 py-1 text-xs text-slate-300">
            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
            {formattedDate}
          </span>
          <span
            className={cn(
              "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
              role === "ADMIN"
                ? "border-orange-400/35 bg-orange-500/15 text-orange-200"
                : "border-emerald-400/35 bg-emerald-500/15 text-emerald-200",
            )}
          >
            {role}
          </span>
        </div>
      </div>

      <DashboardTabsNav currentTab={currentTab} />

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/tracks"
          className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800/80"
        >
          <Target className="h-3.5 w-3.5 text-slate-400" />
          Open tracks
        </Link>
        <Link
          href="/interview"
          className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800/80"
        >
          <Activity className="h-3.5 w-3.5 text-slate-400" />
          Mock interview
        </Link>
        <Link
          href="/career"
          className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800/80"
        >
          <Sparkles className="h-3.5 w-3.5 text-slate-400" />
          Career roadmap
        </Link>
        <Link
          href="/billing"
          className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800/80"
        >
          <CreditCard className="h-3.5 w-3.5 text-slate-400" />
          Billing
        </Link>
      </div>
    </header>
  );
}
