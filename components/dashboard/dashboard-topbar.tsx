import Link from "next/link";
import { ArrowRight, LayoutDashboard, Target } from "lucide-react";

import { DashboardTabsNav, DashboardTab } from "@/components/dashboard/dashboard-tabs-nav";
import { ClientDate } from "@/components/dashboard/client-date";
import { cn } from "@/lib/utils";

export type DashboardTopbarProps = {
  name: string;
  role: string | null;
  currentTab: DashboardTab;
  nextActionTitle: string;
  nextActionHref: string;
  nextActionMeta: string;
};

export function DashboardTopbar({
  name,
  role,
  currentTab,
  nextActionTitle,
  nextActionHref,
  nextActionMeta,
}: DashboardTopbarProps) {
  return (
    <header className="surface-elevated border border-border/50 bg-card rounded-2xl space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-indigo-300">
            <LayoutDashboard className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground truncate">Сегодня</h1>
            <p className="text-xs sm:text-sm text-foreground/60 truncate">{name}, ваш учебный рабочий стол</p>
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
        </div>
      </div>

      <DashboardTabsNav currentTab={currentTab} />

      <div className="flex flex-col gap-3 rounded-xl border border-indigo-400/20 bg-indigo-500/8 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-400/25 bg-background/50 text-indigo-300">
            <Target className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">Главный шаг сейчас</p>
            <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-foreground">{nextActionTitle}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{nextActionMeta}</p>
          </div>
        </div>
        <Link href={nextActionHref} className="btn-primary inline-flex shrink-0 justify-center gap-2 px-4 py-2 text-sm">
          Продолжить
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
