import Link from "next/link";
import { ArrowRight, Bot, Flame, Sparkles, Target, Trophy, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";

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
  const t = await getTranslations("dashboard.hero");

  return (
    <section
      id={id}
      className="surface-panel overflow-hidden border-slate-700/70 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-indigo-950/50 p-5 sm:p-7"
    >
      <div className="relative space-y-6">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="kicker">{t("kicker")}</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
              {t("title", { name })}
            </h1>
            <p className="max-w-lg text-sm text-slate-400 sm:text-base">
              {t("description", { track: primaryTrackTitle })}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {role === "ADMIN" ? (
              <span className="inline-flex rounded-lg border border-orange-400/35 bg-orange-500/15 px-2.5 py-1 text-xs font-semibold text-orange-200">
                {t("badges.admin")}
              </span>
            ) : (
              <span className="inline-flex rounded-lg border border-emerald-400/35 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                {t("badges.student")}
              </span>
            )}
            <LevelBadge level={level} />
            {isDemoUser ? (
              <span className="inline-flex rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-400">
                {t("badges.demo")}
              </span>
            ) : null}
          </div>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="stat-card space-y-1">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <p className="stat-card-label">{t("stats.totalXp")}</p>
            </div>
            <p className="stat-card-value">{totalXp.toLocaleString()}</p>
          </div>
          <div className="stat-card space-y-1">
            <div className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              <p className="stat-card-label">{t("stats.streak")}</p>
            </div>
            <p className="stat-card-value">{learningStreakDays} {t("stats.streakUnit")}</p>
          </div>
          <div className="stat-card space-y-1">
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-sky-400" />
              <p className="stat-card-label">{t("stats.skillLevel")}</p>
            </div>
            <p className="stat-card-value">{overallSkillLevel}</p>
          </div>
          <div className="stat-card space-y-1">
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-emerald-400" />
              <p className="stat-card-label">{t("stats.eta")}</p>
            </div>
            <p className="stat-card-value">{trackCompletionEstimate}</p>
          </div>
        </div>

        {/* Module progress */}
        <div className="rounded-xl border border-slate-700/60 bg-slate-950/50 px-4 py-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">
              {t("progress.modulesCompleted", { done: completedModules, total: totalModules })}
            </span>
            <span className="text-slate-500">
              {totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-sky-400 transition-all duration-700"
              style={{ width: totalModules > 0 ? `${Math.round((completedModules / totalModules) * 100)}%` : "0%" }}
            />
          </div>
        </div>

        {/* CTAs */}
        <div className="grid gap-2 sm:grid-cols-3">
          <Link
            href={continueHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_6px_20px_rgba(56,189,248,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-300 hover:shadow-[0_10px_28px_rgba(56,189,248,0.3)] active:scale-[0.98]"
          >
            {t("cta.continueLearning")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={roadmapHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-600 hover:bg-slate-900 active:scale-[0.98]"
          >
            <Target className="h-4 w-4 text-slate-400" />
            {t("cta.openRoadmap")}
          </Link>
          <Link
            href={mentorHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-400/35 bg-violet-500/12 px-4 py-2.5 text-sm font-semibold text-violet-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-500/20 active:scale-[0.98]"
          >
            <Bot className="h-4 w-4" />
            {t("cta.askAiMentor")}
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
  const t = await getTranslations("dashboard.progressSnapshot");

  return (
    <section className="surface-elevated space-y-4 p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-sky-300" />
        <p className="text-sm font-semibold text-slate-100">{t("title")}</p>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">{t("totalCompletion")}</span>
            <span className="font-semibold text-slate-300">{overallProgress}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">{primaryTrackTitle}</span>
            <span className="font-semibold text-slate-300">{primaryTrackProgress}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${primaryTrackProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="stat-card">
          <p className="stat-card-label">{t("modulesDone")}</p>
          <p className="stat-card-value mt-1">{completedModules}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">{t("learningStreak")}</p>
          <p className="stat-card-value mt-1">{learningStreakDays}d</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">{t("estCompletion")}</p>
          <p className="stat-card-value mt-1 text-sm">{trackCompletionEstimate}</p>
        </div>
      </div>
    </section>
  );
}
