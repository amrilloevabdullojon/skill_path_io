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
      <header className="surface-elevated space-y-2 p-5 sm:p-6">
        <p className="kicker">Personal Planner</p>
        <h1 className="page-title">Build realistic weekly learning pace</h1>
        <p className="section-description">Set a concrete goal and get workload forecast with adaptive recommendations.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="surface-elevated space-y-4 p-5">
          <label className="space-y-2 text-sm text-muted-foreground">
            Your target
            <input value={goal} onChange={(event) => setGoal(event.target.value)} className="input-base" />
          </label>

          <label className="space-y-2 text-sm text-muted-foreground">
            Hours per week
            <input
              type="number"
              min={1}
              max={30}
              value={weeklyHours}
              onChange={(event) => setWeeklyHours(Number(event.target.value))}
              className="input-base"
            />
          </label>

          <button type="button" onClick={calculateForecast} className="btn-primary inline-flex items-center gap-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
            Calculate weekly forecast
          </button>
        </article>

        <article className="surface-elevated space-y-4 p-5">
          <p className="text-sm font-semibold text-foreground">Weekly plan tasks</p>
          <div className="space-y-2">
            {weeklyTasks.map((task) => (
              <div key={task.id} className="surface-subtle flex items-center justify-between p-3">
                <div>
                  <p className="text-sm text-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.day} | {task.type}</p>
                </div>
                <span className="text-xs text-muted-foreground">{task.durationMinutes} min</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      {forecast ? (
        <section className="surface-elevated space-y-3 p-5">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-sky-200">
            <Target className="h-4 w-4" />
            Forecast summary
          </p>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="surface-subtle p-3">
              <p className="text-xs text-muted-foreground">Total plan load</p>
              <p className="text-lg font-semibold text-foreground">{forecast.totalMinutes} min</p>
            </div>
            <div className="surface-subtle p-3">
              <p className="text-xs text-muted-foreground">Weekly capacity</p>
              <p className="text-lg font-semibold text-foreground">{forecast.weeklyCapacity} min</p>
            </div>
            <div className="surface-subtle p-3">
              <p className="text-xs text-muted-foreground">Load</p>
              <p className="text-lg font-semibold text-foreground">{forecast.loadPercent}%</p>
            </div>
            <div className="surface-subtle p-3">
              <p className="text-xs text-muted-foreground">Feasibility</p>
              <p className={`text-lg font-semibold ${forecast.realistic ? "text-emerald-200" : "text-amber-200"}`}>
                {forecast.realistic ? "Realistic" : "Tight"}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{forecast.recommendation}</p>
        </section>
      ) : null}
    </section>
  );
}
