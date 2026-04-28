"use client";

import { ArrowUpRight, BriefcaseBusiness, TrendingUp } from "lucide-react";

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
  return (
    <section className="space-y-6">
      <FadeInUp delay={0}>
        <header className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md space-y-3 p-5 sm:p-7 mb-2 rounded-[24px]">
          <p className="kicker text-indigo-400">Аналитика Готовности</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Целевая роль: {role}</h1>
          <p className="text-sm text-foreground/70 max-w-2xl">Отслеживайте свой индекс готовности к собеседованиям, критические пробелы в навыках и следующий шаг на пути к офферу.</p>
        </header>
      </FadeInUp>

      <FadeInUp delay={0.08}>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md space-y-5 p-6 sm:p-8 rounded-[24px]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Индекс готовности</h2>
            <span className="rounded-full border border-indigo-400/35 bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-200">
              {readiness.level}
            </span>
          </div>

          <p className="text-5xl font-extrabold text-foreground tracking-tight">{readiness.score}%</p>
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

        <article className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md space-y-4 p-6 sm:p-8 rounded-[24px]">
          <h2 className="text-lg font-semibold text-foreground">Пробелы в навыках</h2>
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
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {recommendedActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
        </article>
      </div>
      </FadeInUp>

      <FadeInUp delay={0.16}>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md space-y-4 p-6 sm:p-8 rounded-[24px]">
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

        <article className="surface-elevated relative overflow-hidden bg-card/40 backdrop-blur-md space-y-4 p-6 sm:p-8 rounded-[24px] border border-indigo-500/30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none -z-10" />
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 uppercase tracking-wider">
            <BriefcaseBusiness className="h-4 w-4" />
            Карьерный Манёвр
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed font-medium">Перейдите от теории к готовности к собеседованиям. Мы нашли подходящие для вас вакансии.</p>
          <a href="/jobs" className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-indigo-500/20">
            Открыть Job Matching
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </article>
      </div>
      </FadeInUp>
    </section>
  );
}
