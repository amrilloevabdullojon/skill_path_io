"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Loader2, Target } from "lucide-react";

import { LearningPlan } from "@/types/personalization";

type PlannerResponse = {
  totalMinutes: number;
  weeklyCapacity: number;
  loadPercent: number;
  realistic: boolean;
  recommendation: string;
};

export function PersonalLearningPlanner({ initialPlan }: { initialPlan: LearningPlan }) {
  const [goal, setGoal] = useState(initialPlan.goal);
  const [weeklyHours, setWeeklyHours] = useState(initialPlan.weeklyHours);
  const [forecast, setForecast] = useState<PlannerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const weeklyTasks = useMemo(() => initialPlan.tasks, [initialPlan.tasks]);

  async function calculateForecast() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/planner/forecast", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          plan: {
            ...initialPlan,
            goal,
            weeklyHours,
          },
        }),
      });

      const data = (await response.json()) as PlannerResponse;
      setForecast(data);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-2 p-5 sm:p-6 border border-border/50 bg-card/40 backdrop-blur-md shadow-sm">
        <p className="kicker">Персональный Планировщик</p>
        <h1 className="page-title">Выстройте реалистичный темп обучения</h1>
        <p className="section-description">Определите цель и получите прогноз нагрузки с адаптивными рекомендациями.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="surface-elevated space-y-4 p-5 border border-border/50 bg-card/40 hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all backdrop-blur-md shadow-sm">
          <label className="space-y-2 text-sm text-muted-foreground font-medium">
            Ваша цель
            <input value={goal} onChange={(event) => setGoal(event.target.value)} className="input-base" placeholder="Найти работу QA" />
          </label>

          <label className="space-y-2 text-sm text-muted-foreground font-medium">
            Часов в неделю
            <input
              type="number"
              min={1}
              max={30}
              value={weeklyHours}
              onChange={(event) => setWeeklyHours(Number(event.target.value))}
              className="input-base"
            />
          </label>

          <button type="button" onClick={calculateForecast} className="btn-primary inline-flex items-center gap-2 w-full mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
            Рассчитать прогноз нагрузки
          </button>
        </article>

        <article className="surface-elevated space-y-4 p-5 border border-border/50 bg-card/40 backdrop-blur-md shadow-sm">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">Задачи на наделю</p>
          <div className="space-y-2">
            {weeklyTasks.map((task) => (
              <div key={task.id} className="surface-subtle flex items-center justify-between p-3 border border-border/40 hover:border-indigo-500/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{task.day} | {task.type}</p>
                </div>
                <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-400/20">{task.durationMinutes} мин</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      {forecast ? (
        <section className="surface-elevated space-y-4 p-5 border border-indigo-500/30 bg-indigo-500/5 backdrop-blur-md shadow-[0_0_20px_rgba(14,165,233,0.15)] animate-in fade-in zoom-in-95 duration-300">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-indigo-300 tracking-wide uppercase">
            <Target className="h-4 w-4" />
            Сводка прогноза
          </p>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="surface-subtle p-4 border border-indigo-400/20">
              <p className="text-xs text-muted-foreground mb-1">Итого по плану</p>
              <p className="text-xl font-bold text-foreground">{forecast.totalMinutes} мин</p>
            </div>
            <div className="surface-subtle p-4 border border-indigo-400/20">
              <p className="text-xs text-muted-foreground mb-1">Ваш лимит</p>
              <p className="text-xl font-bold text-foreground">{forecast.weeklyCapacity} мин</p>
            </div>
            <div className="surface-subtle p-4 border border-indigo-400/20">
              <p className="text-xs text-muted-foreground mb-1">Загруженность</p>
              <p className="text-xl font-bold text-foreground">{forecast.loadPercent}%</p>
            </div>
            <div className={`surface-subtle p-4 border ${forecast.realistic ? "border-emerald-400/30 bg-emerald-500/5 text-emerald-200" : "border-amber-400/30 bg-amber-500/5 text-amber-200"}`}>
              <p className="text-xs opacity-70 mb-1">Реалистичность</p>
              <p className={`text-xl font-bold`}>
                {forecast.realistic ? "Оптимально" : "Тяжело"}
              </p>
            </div>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-indigo-400 pl-3 ml-1">{forecast.recommendation}</p>
        </section>
      ) : null}
    </section>
  );
}
