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
    <section
      id={id}
      className="surface-panel relative overflow-hidden bg-card/60 backdrop-blur-xl border border-indigo-500/20 shadow-[0_8px_30px_rgba(99,102,241,0.1)] p-6 sm:p-8 rounded-[32px] mb-6"
    >
      <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-indigo-400/20 blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[0%] left-[-10%] w-[200px] h-[200px] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none z-0" />

      <div className="relative z-10 space-y-8">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="kicker text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Личный центр управления
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl text-balance">
              С возвращением, {name}
            </h1>
            <p className="max-w-lg text-sm text-foreground/70 sm:text-base leading-relaxed">
              Прогресс в треке <span className="text-indigo-300 font-semibold">{primaryTrackTitle}</span>. Держите этот спринт сфокусированным!
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {role === "ADMIN" ? (
              <span className="badge-role-admin border-rose-500/40 text-rose-300 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.15)] rounded-full px-3 py-1 text-xs font-bold uppercase">Админ</span>
            ) : (
              <span className="badge-role-student border-indigo-500/40 text-indigo-300 bg-indigo-500/10 rounded-full px-3 py-1 text-xs font-bold uppercase">Студент</span>
            )}
            <div className="scale-110 shadow-[0_0_20px_rgba(99,102,241,0.2)] rounded-full">
              <LevelBadge level={level} />
            </div>
            {isDemoUser && (
              <span className="badge-role-demo border-amber-500/40 text-amber-300 bg-amber-500/10 rounded-full px-3 py-1 text-xs font-bold uppercase">Демо</span>
            )}
          </div>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card flex flex-col justify-between surface-elevated border border-border/50 bg-card/60 backdrop-blur-md p-5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 blur-[20px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-amber-400" />
              <p className="text-xs uppercase tracking-wider font-semibold text-foreground/60">Всего XP</p>
            </div>
            <p className="text-3xl font-extrabold text-foreground tracking-tight drop-shadow-sm">{totalXp.toLocaleString()}</p>
          </div>

          <div className="stat-card flex flex-col justify-between surface-elevated border border-border/50 bg-card/60 backdrop-blur-md p-5 rounded-2xl relative overflow-hidden group hover:border-orange-500/40 transition-colors">
             <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 blur-[20px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-4 w-4 text-orange-400" />
              <p className="text-xs uppercase tracking-wider font-semibold text-foreground/60">Серия</p>
            </div>
            <p className="text-3xl font-extrabold text-foreground tracking-tight drop-shadow-sm">{learningStreakDays} дней</p>
          </div>

          <div className="stat-card flex flex-col justify-between surface-elevated border border-border/50 bg-card/60 backdrop-blur-md p-5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
             <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 blur-[20px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-indigo-400" />
              <p className="text-xs uppercase tracking-wider font-semibold text-foreground/60">Уровень навыков</p>
            </div>
            <p className="text-2xl font-bold text-foreground tracking-tight truncate drop-shadow-sm">{overallSkillLevel}</p>
          </div>

          <div className="stat-card flex flex-col justify-between surface-elevated border border-border/50 bg-card/60 backdrop-blur-md p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
             <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-[20px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-emerald-400" />
              <p className="text-xs uppercase tracking-wider font-semibold text-foreground/60">Завершение через</p>
            </div>
            <p className="text-xl font-bold text-foreground tracking-tight truncate drop-shadow-sm mt-1">{trackCompletionEstimate}</p>
          </div>
        </div>

        {/* Module progress */}
        <div className="hero-module-progress bg-card/50 border border-border/40 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs mb-2.5">
            <span className="font-bold text-foreground tracking-wide uppercase">
              {completedModules} из {totalModules} модулей завершено
            </span>
            <span className="text-indigo-400 font-extrabold text-sm">
              {totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0}%
            </span>
          </div>
          <div className="progress-track h-2 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="progress-fill h-full bg-gradient-to-r from-indigo-400 to-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-out"
              style={{ width: totalModules > 0 ? `${Math.round((completedModules / totalModules) * 100)}%` : "0%" }}
            />
          </div>
        </div>

        {/* CTAs */}
        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-3 pt-2">
          <Link href={continueHref} className="btn-primary gap-2 bg-indigo-500 hover:bg-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all font-bold group rounded-xl text-sm justify-center">
            Продолжить учебу
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href={roadmapHref} className="btn-secondary gap-2 border-slate-600/50 hover:bg-slate-800/50 transition-colors font-semibold rounded-xl">
            <Target className="h-4 w-4 text-indigo-400" />
            Дорожная карта
          </Link>
          <Link href={mentorHref} className="btn-accent gap-2 border-indigo-500/50 hover:bg-indigo-500/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)] transition-all font-semibold rounded-xl text-indigo-300">
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
    <section className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md rounded-[24px] space-y-5 p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-400" />
        <p className="text-sm font-bold tracking-wide uppercase text-foreground">Снимок вашего прогресса</p>
      </div>

      <div className="space-y-4">
        <div className="bg-background/40 p-3 rounded-xl border border-border/40">
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

        <div className="bg-background/40 p-3 rounded-xl border border-border/40">
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
        <div className="stat-card bg-card/50 border border-border/40 rounded-xl p-4 text-center transition-colors hover:bg-card">
          <p className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">Завершено модулей</p>
          <p className="text-xl font-extrabold text-foreground mt-1">{completedModules}</p>
        </div>
        <div className="stat-card bg-card/50 border border-border/40 rounded-xl p-3 text-center transition-colors hover:bg-card">
          <p className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">Огненная серия</p>
          <p className="text-xl font-extrabold text-orange-400 mt-1">{learningStreakDays} дней</p>
        </div>
        <div className="stat-card bg-card/50 border border-border/40 rounded-xl p-3 text-center transition-colors hover:bg-card">
          <p className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">Оценочное время</p>
          <p className="text-[15px] font-bold text-indigo-300 mt-2 truncate">{trackCompletionEstimate}</p>
        </div>
      </div>
    </section>
  );
}
