"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ClipboardCheck,
  MessageSquareText,
  Target,
  TrendingUp,
} from "lucide-react";

import { FadeInUp, StaggerList } from "@/components/ui/fade-in";
import { ReadinessSnapshot } from "@/types/personalization";

export function CareerReadinessDashboard({
  role,
  readiness,
  coveredSkills,
  recommendedActions,
}: {
  role: "Junior QA" | "Junior BA" | "Junior Data Analyst";
  readiness: ReadinessSnapshot;
  coveredSkills: string[];
  recommendedActions: string[];
}) {
  const primaryAction =
    readiness.score >= 78
      ? { label: "Тренировать интервью", href: "/interview", icon: MessageSquareText }
      : readiness.score >= 60
        ? { label: "Усилить портфолио", href: "/portfolio", icon: ClipboardCheck }
        : { label: "Закрыть слабые вопросы", href: "/review", icon: Target };
  const PrimaryIcon = primaryAction.icon;

  return (
    <section className="space-y-6">
      <FadeInUp delay={0}>
        <header className="surface-elevated border border-border/50 bg-card space-y-5 p-5 sm:p-7 mb-2 rounded-2xl">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div className="space-y-3">
              <p className="kicker text-indigo-400">Карьерный навигатор</p>
              <h1 className="page-title tracking-tight text-foreground">Целевая роль: {role}</h1>
              <p className="text-sm text-foreground/70 max-w-2xl">
                Здесь видно, что уже можно показывать работодателю, какие пробелы мешают и какой следующий шаг быстрее всего поднимет готовность.
              </p>
            </div>
            <Link href={primaryAction.href} className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg">
              <PrimaryIcon className="h-4 w-4" />
              {primaryAction.label}
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <Link href="/portfolio" className="rounded-xl border border-border bg-background/60 p-3 transition-colors hover:bg-background/80">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Доказательства</p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                Портфолио
                <ClipboardCheck className="h-4 w-4" />
              </p>
            </Link>
            <Link href="/review" className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 transition-colors hover:bg-indigo-500/15">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">Пробелы</p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                Повторение
                <Target className="h-4 w-4" />
              </p>
            </Link>
            <Link href="/interview" className="rounded-xl border border-border bg-background/60 p-3 transition-colors hover:bg-background/80">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Собеседование</p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                Интервью
                <MessageSquareText className="h-4 w-4" />
              </p>
            </Link>
            <Link href="/jobs" className="rounded-xl border border-border bg-background/60 p-3 transition-colors hover:bg-background/80">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Рынок</p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                Вакансии
                <BriefcaseBusiness className="h-4 w-4" />
              </p>
            </Link>
          </div>
        </header>
      </FadeInUp>

      <FadeInUp delay={0.08}>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-elevated border border-border/50 bg-card space-y-5 p-6 sm:p-8 rounded-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Индекс готовности</h2>
            <span className="rounded-full border border-indigo-400/35 bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-200">
              {readiness.level}
            </span>
          </div>

          <p className="metric-value-lg">{readiness.score}%</p>
          <div className="progress-track h-3 overflow-hidden bg-indigo-500/10 border border-indigo-400/20 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-indigo-400 to-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] transition-all duration-1000 ease-out" style={{ width: `${readiness.score}%` }} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-card/40 p-4 border border-border/30 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">Прогресс к цели</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{readiness.progressToGoal}%</p>
            </div>
            <div className="rounded-xl bg-card/40 p-4 border border-border/30 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">Следующая веха</p>
              <p className="mt-1 text-sm font-semibold text-indigo-400 leading-tight">{readiness.nextMilestone}</p>
            </div>
          </div>
        </article>

        <article className="surface-elevated border border-border/50 bg-card space-y-4 p-6 sm:p-8 rounded-2xl">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Пробелы в навыках</h2>
            <span className="rounded-full border border-border bg-background/70 px-2.5 py-1 text-xs text-muted-foreground">
              {readiness.missingSkills.length} в фокусе
            </span>
          </div>
          <StaggerList className="space-y-2">
            {readiness.missingSkills.length === 0 ? (
              <p className="text-sm text-emerald-400 font-medium">Критических пробелов не найдено!</p>
            ) : readiness.missingSkills.map((skill) => (
              <div key={skill} className="flex items-center justify-between rounded-xl border border-amber-400/25 bg-amber-500/8 px-3 py-2">
                <span className="text-sm text-amber-100 font-medium">{skill}</span>
                <span className="text-[10px] uppercase font-bold text-amber-400/80 tracking-wider">Gap</span>
              </div>
            ))}
          </StaggerList>
          <div className="surface-subtle p-4 mt-2">
            <p className="text-xs uppercase tracking-wide font-bold text-muted-foreground">Рекомендованные шаги</p>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              {recommendedActions.map((action) => (
                <li key={action} className="rounded-lg border border-border bg-background/60 px-3 py-2">
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>
      </FadeInUp>

      <FadeInUp delay={0.16}>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="surface-elevated border border-border/50 bg-card space-y-4 p-6 sm:p-8 rounded-2xl">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 uppercase tracking-wider">
            <TrendingUp className="h-4 w-4" />
            Освоенные навыки
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {coveredSkills.map((skill) => (
              <span key={skill} className="rounded-full border border-emerald-400/30 bg-emerald-500/12 px-2.5 py-1 text-xs text-emerald-200">
                {skill}
              </span>
            ))}
          </div>
        </article>

        <article className="surface-elevated relative overflow-hidden bg-card space-y-4 p-6 sm:p-8 rounded-2xl border border-indigo-500/30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none -z-10" />
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 uppercase tracking-wider">
            <BriefcaseBusiness className="h-4 w-4" />
            Карьерный Манёвр
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed font-medium">Перейдите от теории к готовности к собеседованиям. Мы нашли подходящие для вас вакансии.</p>
          <Link href="/jobs" className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-indigo-500/20">
            Открыть Job Matching
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </article>
      </div>
      </FadeInUp>
    </section>
  );
}
