import Link from "next/link";
import { Activity, ArrowUpRight, CalendarClock, Gauge, Timer } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";

export function DashboardPlannerPreviewSection({
  goal,
  workload,
  forecastDate,
}: {
  goal: string;
  workload: string;
  forecastDate: string;
}) {
  const normalizedWorkload = workload.toLowerCase();
  const weeklyPace =
    normalizedWorkload === "intense"
      ? "5 focused sessions / week"
      : normalizedWorkload === "balanced"
        ? "3-4 focused sessions / week"
        : "2-3 focused sessions / week";
  const confidence =
    normalizedWorkload === "intense" ? "High confidence" : normalizedWorkload === "balanced" ? "On track" : "Steady pace";

  return (
    <DashboardSection id="planner" title="Planner Preview" description="Weekly pace and realistic completion forecast.">
      <article className="surface-panel-hover rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Current plan</p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-100">{goal}</p>

        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/50 px-2.5 py-2">
            <p className="inline-flex items-center gap-1 text-slate-500">
              <Timer className="h-3.5 w-3.5" />
              Workload
            </p>
            <p className="mt-1 text-slate-200">{workload}</p>
          </div>
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/50 px-2.5 py-2">
            <p className="inline-flex items-center gap-1 text-slate-500">
              <CalendarClock className="h-3.5 w-3.5" />
              Forecast date
            </p>
            <p className="mt-1 text-slate-200">{new Date(forecastDate).toLocaleDateString()}</p>
          </div>
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/50 px-2.5 py-2">
            <p className="inline-flex items-center gap-1 text-slate-500">
              <Activity className="h-3.5 w-3.5" />
              Weekly pace
            </p>
            <p className="mt-1 text-slate-200">{weeklyPace}</p>
          </div>
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/50 px-2.5 py-2">
            <p className="inline-flex items-center gap-1 text-slate-500">
              <Gauge className="h-3.5 w-3.5" />
              Confidence
            </p>
            <p className="mt-1 text-slate-200">{confidence}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
            Plan status: active
          </span>
          <Link
            href="/planner"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-xs font-medium text-sky-300 transition-colors hover:border-slate-600 hover:text-sky-200"
          >
            Open planner
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>
    </DashboardSection>
  );
}
