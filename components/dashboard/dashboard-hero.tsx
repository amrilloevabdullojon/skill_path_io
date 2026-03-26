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
      className="surface-panel hero-gradient-bg overflow-hidden p-5 sm:p-6"
    >
      <div className="relative space-y-6">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="kicker">{t("kicker")}</p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("title", { name })}
            </h1>
            <p className="max-w-lg text-sm text-muted-foreground sm:text-base">
              {t("description", { track: primaryTrackTitle })}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {role === "ADMIN" ? (
              <span className="badge-role-admin">{t("badges.admin")}</span>
            ) : (
              <span className="badge-role-student">{t("badges.student")}</span>
            )}
            <LevelBadge level={level} />
            {isDemoUser ? (
              <span className="badge-role-demo">{t("badges.demo")}</span>
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
        <div className="hero-module-progress">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">
              {t("progress.modulesCompleted", { done: completedModules, total: totalModules })}
            </span>
            <span className="text-muted-foreground">
              {totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0}%
            </span>
          </div>
          <div className="progress-track mt-2">
            <div
              className="progress-fill"
              style={{ width: totalModules > 0 ? `${Math.round((completedModules / totalModules) * 100)}%` : "0%" }}
            />
          </div>
        </div>

        {/* CTAs */}
        <div className="grid gap-2 sm:grid-cols-3">
          <Link href={continueHref} className="btn-primary gap-2">
            {t("cta.continueLearning")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={roadmapHref} className="btn-secondary gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            {t("cta.openRoadmap")}
          </Link>
          <Link href={mentorHref} className="btn-accent gap-2">
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
        <Sparkles className="h-4 w-4 text-sky-400" />
        <p className="text-sm font-semibold text-foreground">{t("title")}</p>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t("totalCompletion")}</span>
            <span className="font-semibold text-foreground">{overallProgress}%</span>
          </div>
          <div className="progress-track mt-1.5 h-2">
            <div
              className="progress-fill h-full"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{primaryTrackTitle}</span>
            <span className="font-semibold text-foreground">{primaryTrackProgress}%</span>
          </div>
          <div className="progress-track mt-1.5 h-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-slow ease-smooth"
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
