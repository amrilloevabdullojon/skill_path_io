import Link from "next/link";
import { Activity, CreditCard, LayoutDashboard, Sparkles, Target } from "lucide-react";

import { DashboardTabsNav, DashboardTab } from "@/components/dashboard/dashboard-tabs-nav";
import { ResetProgressButton } from "@/components/dashboard/reset-progress-button";
import { ClientDate } from "@/components/dashboard/client-date";
import { cn } from "@/lib/utils";

export type DashboardTopbarProps = {
  name: string;
  role: string | null;
  currentTab: DashboardTab;
};

export function DashboardTopbar({ name: _name, role, currentTab }: DashboardTopbarProps) {
  return (
    <header className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md rounded-[24px] space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-indigo-300">
            <LayoutDashboard className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground truncate">Панель управления</h1>
            <p className="text-xs sm:text-sm text-foreground/60 truncate">Центр обучения</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ClientDate />
          <span
            className={cn(
              "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
              role === "ADMIN" ? "badge-role-admin" : "badge-role-student",
            )}
          >
            {role}
          </span>
          <ResetProgressButton />
        </div>
      </div>

      <DashboardTabsNav currentTab={currentTab} />

      <div className="flex flex-wrap items-center gap-2">
        <Link href="/tracks" className="topbar-action-link">
          <Target className="topbar-action-icon h-3.5 w-3.5" />
          Треки
        </Link>
        <Link href="/interview" className="topbar-action-link">
          <Activity className="topbar-action-icon h-3.5 w-3.5" />
          Собеседование
        </Link>
        <Link href="/career" className="topbar-action-link">
          <Sparkles className="topbar-action-icon h-3.5 w-3.5" />
          Карьера
        </Link>
        <Link href="/billing" className="topbar-action-link">
          <CreditCard className="topbar-action-icon h-3.5 w-3.5" />
          Тарифы
        </Link>
      </div>
    </header>
  );
}
