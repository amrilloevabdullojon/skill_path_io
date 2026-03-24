import Link from "next/link";
import { ArrowRight, Bot, Sparkles, Target } from "lucide-react";

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

export function DashboardHero({
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
      className="surface-panel surface-panel-hover overflow-hidden border-slate-700/80 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-indigo-950/55 p-5 sm:p-7"
    >
      <div className="relative space-y-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <p className="kicker">Personal command center</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
              Welcome back, {name}
            </h1>
            <p className="text-sm text-slate-300 sm:text-base">
              You are progressing through <span className="font-semibold text-slate-100">{primaryTrackTitle}</span>.
              Keep this sprint focused and finish your next module.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700/80 bg-slate-950/55 px-4 py-3 text-sm">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Current milestone</p>
            <p className="mt-1 font-semibold text-slate-100">{completedModules}/{totalModules} modules completed</p>
            <p className="mt-0.5 text-xs text-slate-400">Next target: finish current module sprint</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              role === "ADMIN"
                ? "border-orange-400/35 bg-orange-500/15 text-orange-200"
                : "border-emerald-400/35 bg-emerald-500/15 text-emerald-200"
            }`}
          >
            {role}
          </span>
          <LevelBadge level={level} />
          <span className="inline-flex rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
            {totalXp} XP
          </span>
          <span className="inline-flex rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
            Skill level: {overallSkillLevel}
          </span>
          <span className="inline-flex rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
            Streak: {learningStreakDays} days
          </span>
          <span className="inline-flex rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
            ETA: {trackCompletionEstimate}
          </span>
          {isDemoUser ? (
            <span className="inline-flex rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-400">
              Demo session
            </span>
          ) : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <Link
            href={continueHref}
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-sky-300"
          >
            Continue learning
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={roadmapHref}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-slate-600 hover:bg-slate-800/80"
          >
            <Target className="h-4 w-4 text-slate-300" />
            Open roadmap
          </Link>
          <Link
            href={mentorHref}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-violet-400/40 bg-violet-500/15 px-4 py-2.5 text-sm font-semibold text-violet-100 transition-colors hover:bg-violet-500/25"
          >
            <Bot className="h-4 w-4" />
            Ask AI mentor
          </Link>
        </div>
      </div>
    </section>
  );
}

export function DashboardProgressSnapshotCard({
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
    <section className="surface-elevated surface-panel-hover space-y-4 p-4">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
        <Sparkles className="h-4 w-4 text-sky-300" />
        Progress snapshot
      </p>
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Total completion</span>
          <span>{overallProgress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-sky-400 transition-all duration-500" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{primaryTrackTitle}</span>
          <span>{primaryTrackProgress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${primaryTrackProgress}%` }} />
        </div>
      </div>
      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <p className="text-xs text-slate-500">Modules done</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">{completedModules}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <p className="text-xs text-slate-500">Learning streak</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">{learningStreakDays} days</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <p className="text-xs text-slate-500">Track estimate</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">{trackCompletionEstimate}</p>
        </div>
      </div>
    </section>
  );
}
