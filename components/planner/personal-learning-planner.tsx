"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarClock,
  ClipboardCheck,
  Filter,
  Loader2,
  Target,
} from "lucide-react";

import { LearningPlan, LearningPlanTask } from "@/types/personalization";

type PlannerResponse = {
  totalMinutes: number;
  weeklyCapacity: number;
  loadPercent: number;
  realistic: boolean;
  recommendation: string;
};

type TaskFilter = "all" | LearningPlanTask["type"];

const filterOptions: Array<{ label: string; value: TaskFilter }> = [
  { label: "Все", value: "all" },
  { label: "Уроки", value: "lesson" },
  { label: "Квизы", value: "quiz" },
  { label: "Практика", value: "mission" },
  { label: "Review", value: "review" },
  { label: "Симуляции", value: "simulation" },
];

const taskTypeLabels: Record<LearningPlanTask["type"], string> = {
  lesson: "Урок",
  quiz: "Квиз",
  simulation: "Симуляция",
  review: "Review",
  mission: "Миссия",
};

function getTaskHref(type: LearningPlanTask["type"]) {
  if (type === "review") return "/review";
  if (type === "mission") return "/missions";
  if (type === "quiz") return "/tracks";
  if (type === "simulation") return "/simulation";
  return "/tracks";
}

export function PersonalLearningPlanner({ initialPlan }: { initialPlan: LearningPlan }) {
  const [goal, setGoal] = useState(initialPlan.goal);
  const [weeklyHours, setWeeklyHours] = useState(initialPlan.weeklyHours);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all");
  const [forecast, setForecast] = useState<PlannerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const weeklyTasks = useMemo(() => initialPlan.tasks, [initialPlan.tasks]);
  const filteredTasks = useMemo(
    () => weeklyTasks.filter((task) => activeFilter === "all" || task.type === activeFilter),
    [activeFilter, weeklyTasks],
  );
  const totalMinutes = weeklyTasks.reduce((sum, task) => sum + task.durationMinutes, 0);
  const practiceTasks = weeklyTasks.filter((task) => task.type === "mission" || task.type === "simulation").length;
  const reviewTasks = weeklyTasks.filter((task) => task.type === "review" || task.type === "quiz").length;

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
      <header className="surface-elevated space-y-5 p-5 sm:p-6 border border-border/50 bg-card shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div className="space-y-2">
            <p className="kicker">Недельный маршрут</p>
            <h1 className="page-title">Соберите реалистичный цикл обучения</h1>
            <p className="section-description max-w-2xl">
              План должен вести по цепочке: закрыть слабые места, пройти материал, сделать практику, обновить портфолио и подготовиться к рынку.
            </p>
          </div>
          <Link href="/career" className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg">
            <BriefcaseBusiness className="h-4 w-4" />
            Сверить карьерную цель
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-border bg-background/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Всего задач</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{weeklyTasks.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Нагрузка</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{totalMinutes} мин</p>
          </div>
          <div className="rounded-xl border border-border bg-background/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Практика</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{practiceTasks}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Повторение</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{reviewTasks}</p>
          </div>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        <Link href="/review" className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 transition-colors hover:bg-indigo-500/15">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">Старт</p>
          <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            Слабые вопросы
            <Target className="h-4 w-4" />
          </p>
        </Link>
        <Link href="/tracks" className="rounded-xl border border-border bg-background/60 p-3 transition-colors hover:bg-background/80">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Учеба</p>
          <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            Модули
            <BookOpenCheck className="h-4 w-4" />
          </p>
        </Link>
        <Link href="/missions" className="rounded-xl border border-border bg-background/60 p-3 transition-colors hover:bg-background/80">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Практика</p>
          <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            Миссии
            <ClipboardCheck className="h-4 w-4" />
          </p>
        </Link>
        <Link href="/portfolio" className="rounded-xl border border-border bg-background/60 p-3 transition-colors hover:bg-background/80">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Итог</p>
          <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            Портфолио
            <BriefcaseBusiness className="h-4 w-4" />
          </p>
        </Link>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="surface-elevated space-y-4 p-5 border border-border/50 bg-card shadow-sm">
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

        <article className="surface-elevated space-y-4 p-5 border border-border/50 bg-card shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">Задачи на неделю</p>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setActiveFilter(option.value)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    activeFilter === option.value
                      ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-200"
                      : "border-border bg-background/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <div key={task.id} className="surface-subtle flex items-center justify-between p-3 border border-border-subtle hover:border-indigo-500/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{task.day} | {taskTypeLabels[task.type]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-400/20">{task.durationMinutes} мин</span>
                  <Link href={getTaskHref(task.type)} className="btn-secondary px-3 py-1.5 text-xs">
                    Открыть
                  </Link>
                </div>
              </div>
            ))}
            {filteredTasks.length === 0 ? (
              <div className="rounded-lg border border-border bg-background/60 p-4 text-sm text-muted-foreground">
                В этом фильтре задач нет.
              </div>
            ) : null}
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
