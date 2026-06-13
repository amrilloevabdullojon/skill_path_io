"use client";

import Link from "next/link";
import { BookOpenCheck, BriefcaseBusiness, CalendarClock, ClipboardCheck, Target } from "lucide-react";
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
  const primaryWeakSkill = snapshot.weakestSkills[0] ?? "следующий навык";
  const needsReview = snapshot.averageQuizAccuracy < 70 || snapshot.weakestSkills.length > 0;
  const nextAction = needsReview
    ? { label: "Разобрать слабые вопросы", href: "/review", icon: Target }
    : { label: "Перейти к практике", href: "/missions", icon: ClipboardCheck };
  const NextActionIcon = nextAction.icon;

  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-5 p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div className="space-y-2">
            <p className="kicker">Аналитика решений</p>
            <h1 className="page-title">Что тормозит прогресс и что делать дальше</h1>
            <p className="section-description max-w-2xl">
              Графики здесь нужны не ради графиков: они помогают выбрать следующий шаг между повторением, практикой, планом и карьерной готовностью.
            </p>
          </div>
          <Link href={nextAction.href} className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg">
            <NextActionIcon className="h-4 w-4" />
            {nextAction.label}
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <Link href="/review" className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 transition-colors hover:bg-indigo-500/15">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">Фокус</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              {primaryWeakSkill}
              <Target className="h-4 w-4" />
            </p>
          </Link>
          <Link href="/planner" className="rounded-xl border border-border bg-background/60 p-3 transition-colors hover:bg-background/80">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Темп</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              План недели
              <CalendarClock className="h-4 w-4" />
            </p>
          </Link>
          <Link href="/missions" className="rounded-xl border border-border bg-background/60 p-3 transition-colors hover:bg-background/80">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Практика</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              Миссии
              <ClipboardCheck className="h-4 w-4" />
            </p>
          </Link>
          <Link href="/career" className="rounded-xl border border-border bg-background/60 p-3 transition-colors hover:bg-background/80">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Итог</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              Карьера
              <BriefcaseBusiness className="h-4 w-4" />
            </p>
          </Link>
        </div>
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
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220} initialDimension={{ width: 0, height: 220 }}>
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
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220} initialDimension={{ width: 0, height: 220 }}>
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
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/review" className="btn-secondary inline-flex items-center gap-2 rounded-lg">
              <Target className="h-4 w-4" />
              Повторить
            </Link>
            <Link href="/tracks" className="btn-secondary inline-flex items-center gap-2 rounded-lg">
              <BookOpenCheck className="h-4 w-4" />
              Найти модуль
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
