"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StudentAnalyticsSnapshot } from "@/types/personalization";

export function StudentAnalyticsDashboard({ snapshot }: { snapshot: StudentAnalyticsSnapshot }) {
  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-2 p-5 sm:p-6">
        <p className="kicker">Аналитика студента</p>
        <h1 className="page-title">Тренды обучения и показатели успеваемости</h1>
        <p className="section-description">Отслеживай время обучения, точность квизов, выполнение миссий и результаты симуляций.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="surface-elevated p-4">
          <p className="text-xs text-muted-foreground">Время обучения</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{snapshot.totalLearningMinutes} мин</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="text-xs text-muted-foreground">Завершено уроков</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{snapshot.completedLessons}</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="text-xs text-muted-foreground">Точность квизов</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{snapshot.averageQuizAccuracy}%</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="text-xs text-muted-foreground">Выполнение миссий</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{snapshot.missionCompletionRate}%</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="surface-elevated p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Недельный прогресс</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
              <AreaChart data={snapshot.weeklyProgress}>
                <defs>
                  <linearGradient id="analyticsProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="week" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))" }} />
                <Area type="monotone" dataKey="value" stroke="#38bdf8" fill="url(#analyticsProgress)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="surface-elevated p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Прогресс vs точность по дням</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
              <LineChart data={snapshot.trend}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))" }} />
                <Line type="monotone" dataKey="progress" stroke="#22d3ee" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="accuracy" stroke="#a78bfa" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="surface-elevated p-4">
          <p className="text-sm font-semibold text-emerald-200">Сильные навыки</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {snapshot.strongestSkills.map((skill) => (
              <span key={skill} className="rounded-full border border-emerald-400/35 bg-emerald-500/12 px-2.5 py-1 text-xs text-emerald-200">
                {skill}
              </span>
            ))}
          </div>
        </article>

        <article className="surface-elevated p-4">
          <p className="text-sm font-semibold text-amber-200">Слабые навыки</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {snapshot.weakestSkills.map((skill) => (
              <span key={skill} className="rounded-full border border-amber-400/35 bg-amber-500/12 px-2.5 py-1 text-xs text-amber-200">
                {skill}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Результат симуляций: {snapshot.simulationPerformance}%</p>
        </article>
      </div>
    </section>
  );
}
