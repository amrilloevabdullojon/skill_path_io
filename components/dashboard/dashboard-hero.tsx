import Link from "next/link";
import { ArrowRight, Bot, Flame, Sparkles, Target, Trophy, Zap } from "lucide-react";

import { LevelBadge } from "@/components/level/level-badge";
import { LevelTier } from "@/lib/progress/xp";

type DashboardHeroProps = {
  id?: string;
  name: string;
  role: "ADMIN" | "STUDENT";
  isDemoUser: boolean;
  completedModules: number;
  totalModules: number;
  primaryTrackTitle: string;
  level: LevelTier;
  totalXp: number;
  learningStreakDays: number;
  overallSkillLevel: string;
  trackCompletionEstimate: string;
  continueHref: string;
  roadmapHref: string;
  mentorHref: string;
};

export async function DashboardHero({
  id,
  name,
  role,
  isDemoUser,
  completedModules,
  totalModules,
  primaryTrackTitle,
  level,
  totalXp,
  learningStreakDays,
  overallSkillLevel,
  trackCompletionEstimate,
  continueHref,
  roadmapHref,
  mentorHref,
}: DashboardHeroProps) {
  return (
    <section id={id} className="surface-hero p-6 sm:p-8">
      <div className="space-y-8">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="kicker flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-4 h-4" /> Личный центр управления
            </p>
            <h1 className="page-title text-balance">
              С возвращением, {name}
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              Прогресс в треке <span className="font-semibold text-foreground">{primaryTrackTitle}</span>. Держите этот спринт сфокусированным.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {role === "ADMIN" ? (
              <span className="badge-role-admin">Админ</span>
            ) : (
              <span className="badge-role-student">Студент</span>
            )}
            <LevelBadge level={level} />
            {isDemoUser && <span className="badge-role-demo">Демо</span>}
          </div>
        </div>

        {/* Stat grid: 1 hero + 2 secondary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="surface-elevated p-5 sm:col-span-2 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <p className="kicker">Всего XP</p>
              </div>
              <p className="metric-value-lg mt-2">
                {totalXp.toLocaleString()}
              </p>
            </div>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground sm:mt-0 sm:text-right">
              Уровень: <span className="font-semibold text-foreground">{overallSkillLevel}</span>
              <br />
              Завершение трека через {trackCompletionEstimate}
            </p>
          </div>

          <div className="surface-elevated p-5">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-400" />
              <p className="kicker">Серия</p>
            </div>
            <p className="metric-value mt-2">
              {learningStreakDays}<span className="ml-1 text-base font-normal text-muted-foreground">дней</span>
            </p>
          </div>

          <div className="surface-elevated p-5">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-emerald-400" />
              <p className="kicker">Модули</p>
            </div>
            <p className="metric-value mt-2">
              {completedModules}<span className="ml-1 text-base font-normal text-muted-foreground">/ {totalModules}</span>
            </p>
          </div>
        </div>

        {/* Module progress */}
        <div className="surface-subtle p-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="kicker">{completedModules} из {totalModules} модулей</span>
            <span className="text-sm font-bold text-indigo-400">
              {totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0}%
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: totalModules > 0 ? `${Math.round((completedModules / totalModules) * 100)}%` : "0%" }}
            />
          </div>
        </div>

        {/* CTAs */}
        <div className="grid gap-3 pt-2 md:grid-cols-3">
          <Link href={continueHref} className="btn-primary group justify-center gap-2">
            Продолжить учебу
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href={roadmapHref} className="btn-secondary justify-center gap-2">
            <Target className="h-4 w-4 text-indigo-400" />
            Дорожная карта
          </Link>
          <Link href={mentorHref} className="btn-accent justify-center gap-2">
            <Bot className="h-4 w-4" />
            ИИ Наставник
          </Link>
        </div>
      </div>
    </section>
  );
}

export async function DashboardProgressSnapshotCard({
  overallProgress,
  primaryTrackTitle,
  primaryTrackProgress,
  completedModules,
  learningStreakDays,
  trackCompletionEstimate,
}: {
  overallProgress: number;
  primaryTrackTitle: string;
  primaryTrackProgress: number;
  completedModules: number;
  learningStreakDays: number;
  trackCompletionEstimate: string;
}) {
  return (
    <section className="surface-elevated space-y-5 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-400" />
        <p className="text-sm font-bold tracking-wide uppercase text-foreground">Снимок вашего прогресса</p>
      </div>

      <div className="space-y-4">
        <div className="bg-background/40 p-3 rounded-xl border border-border-subtle">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-foreground/70 font-semibold uppercase tracking-wider">Общее прохождение трека</span>
            <span className="font-extrabold text-foreground">{overallProgress}%</span>
          </div>
          <div className="progress-track bg-slate-800/50 h-2 border border-slate-700/50 rounded-full">
            <div
              className="progress-fill h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] rounded-full"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-background/40 p-3 rounded-xl border border-border-subtle">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-foreground/70 font-semibold uppercase tracking-wider">{primaryTrackTitle}</span>
            <span className="font-extrabold text-indigo-400">{primaryTrackProgress}%</span>
          </div>
          <div className="progress-track bg-slate-800/50 h-2 border border-slate-700/50 rounded-full">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-700 ease-out"
              style={{ width: `${primaryTrackProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 pt-2">
        <div className="stat-card bg-card/50 border border-border-subtle rounded-xl p-4 text-center transition-colors hover:bg-card">
          <p className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">Завершено модулей</p>
          <p className="text-xl font-extrabold text-foreground mt-1">{completedModules}</p>
        </div>
        <div className="stat-card bg-card/50 border border-border-subtle rounded-xl p-3 text-center transition-colors hover:bg-card">
          <p className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">Огненная серия</p>
          <p className="text-xl font-extrabold text-orange-400 mt-1">{learningStreakDays} дней</p>
        </div>
        <div className="stat-card bg-card/50 border border-border-subtle rounded-xl p-3 text-center transition-colors hover:bg-card">
          <p className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">Оценочное время</p>
          <p className="text-[15px] font-bold text-indigo-300 mt-2 truncate">{trackCompletionEstimate}</p>
        </div>
      </div>
    </section>
  );
}
