import Link from "next/link";
import { Activity, ArrowUpRight, CalendarClock, Gauge, Timer, Focus } from "lucide-react";
import { getLocale } from "next-intl/server";

import { DashboardSection } from "@/components/dashboard/dashboard-section";

export async function DashboardPlannerPreviewSection({
  goal,
  workload,
  forecastDate,
}: {
  goal: string;
  workload: string;
  forecastDate: string;
}) {
  const locale = await getLocale();

  const normalizedWorkload = workload.toLowerCase();
  const weeklyPace =
    normalizedWorkload === "intense"
      ? "~12+ часов/нед"
      : normalizedWorkload === "balanced"
        ? "~6-10 часов/нед"
        : "~2-4 часов/нед";
        
  const confidence =
    normalizedWorkload === "intense"
      ? "ВЫСОКАЯ 🚀"
      : normalizedWorkload === "balanced"
        ? "ОПТИМАЛЬНО"
        : "НИЗКАЯ 🐌";
        
  const workloadLabel =
    normalizedWorkload === "intense"
      ? "Интенсив"
      : normalizedWorkload === "balanced"
        ? "Сбалансированная"
        : "Легкая";

  const formattedDate = new Date(forecastDate).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardSection id="planner" title="Умное планирование" description="ИИ прогнозирует дату завершения вашего трека.">
      <article className="relative overflow-hidden surface-elevated border border-indigo-500/30 bg-card/60 backdrop-blur-xl rounded-[20px] p-5 lg:p-6 transition-all duration-300 shadow-[0_8px_30px_rgba(99,102,241,0.08)] group hover:border-indigo-500/50">
        <div className="absolute top-[-20%] left-[-20%] w-[200px] h-[200px] rounded-full blur-[50px] pointer-events-none transition-opacity opacity-20 group-hover:opacity-60 bg-indigo-500/30" />
        
        <div className="relative z-10 flex items-start gap-4">
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Focus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 mb-1">Фокус обучения</p>
            <p className="line-clamp-2 text-base font-bold leading-relaxed text-foreground drop-shadow-sm">{goal}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 relative z-10">
          <div className="bg-background/40 border border-border/40 px-3 py-2.5 rounded-xl transition-all group-hover:bg-background/60">
            <p className="text-[9px] uppercase font-bold text-foreground/50 tracking-wider flex items-center gap-1.5 mb-1">
              <Timer className="h-3 w-3 text-indigo-400" />
              Твоя нагрузка
            </p>
            <p className="text-sm font-semibold text-foreground tracking-wide mt-0.5">{workloadLabel}</p>
          </div>
          <div className="bg-background/40 border border-border/40 px-3 py-2.5 rounded-xl transition-all group-hover:bg-background/60">
            <p className="text-[9px] uppercase font-bold text-foreground/50 tracking-wider flex items-center gap-1.5 mb-1">
              <CalendarClock className="h-3 w-3 text-amber-400" />
              Прогноз завершения
            </p>
            <p className="text-sm font-semibold text-amber-400 tracking-wide mt-0.5">{formattedDate}</p>
          </div>
          <div className="bg-background/40 border border-border/40 px-3 py-2.5 rounded-xl transition-all group-hover:bg-background/60">
            <p className="text-[9px] uppercase font-bold text-foreground/50 tracking-wider flex items-center gap-1.5 mb-1">
              <Activity className="h-3 w-3 text-emerald-400" />
              Темп в неделю
            </p>
            <p className="text-sm font-semibold text-foreground tracking-wide mt-0.5">{weeklyPace}</p>
          </div>
          <div className="bg-background/40 border border-border/40 px-3 py-2.5 rounded-xl transition-all group-hover:bg-background/60">
            <p className="text-[9px] uppercase font-bold text-foreground/50 tracking-wider flex items-center gap-1.5 mb-1">
              <Gauge className="h-3 w-3 text-violet-400" />
              Уверенность ИИ
            </p>
            <p className="text-sm font-bold text-foreground tracking-wide mt-0.5">{confidence}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 relative z-10">
          <span className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            Активный план
          </span>
          <Link
            href="/planner"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg text-xs font-bold text-indigo-300 transition-colors"
          >
            Открыть планер
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </DashboardSection>
  );
}
