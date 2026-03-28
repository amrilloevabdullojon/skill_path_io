import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { TrackCategory } from "@prisma/client";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, Layers3, Sparkles, Trophy } from "lucide-react";
import { getLocale } from "next-intl/server";

import { SkillRadarChart } from "@/components/skill-radar/skill-radar";
import { LevelBadge } from "@/components/level/level-badge";
import { authOptions } from "@/lib/auth";
import { resolveRuntimeCourseBySlug } from "@/lib/learning/runtime-content";
import { resolveLearningUser } from "@/lib/learning-user";
import { getNextLevelTarget, getLevelByXp } from "@/lib/progress/xp";
import { prisma } from "@/lib/prisma";
import { applyTrackContentOverrides, normalizeLearningLocale } from "@/lib/tracks/content-overrides";
import {
  LearningPathState,
  buildTrackProgression,
  buildTrackSkillRadar,
  getTrackCareerOutcome,
  getTrackLearningOutcomes,
  trackNextSuggestion,
} from "@/lib/tracks/progression";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { TrackModuleTree } from "@/components/tracks/track-module-tree";

type TrackDetailsProps = {
  params: {
    trackId: string;
  };
  searchParams?: {
    locked?: string;
  };
};

function categoryAccent(category: TrackCategory) {
  if (category === TrackCategory.QA) {
    return {
      badge: "border-emerald-400/35 bg-emerald-500/15 text-emerald-200",
      progress: "bg-emerald-400",
      ring: "ring-emerald-400/35",
      subtle: "bg-emerald-500/8 border-emerald-400/25",
    };
  }
  if (category === TrackCategory.BA) {
    return {
      badge: "border-orange-400/35 bg-orange-500/15 text-orange-200",
      progress: "bg-orange-400",
      ring: "ring-orange-400/35",
      subtle: "bg-orange-500/8 border-orange-400/25",
    };
  }
  return {
    badge: "border-violet-400/35 bg-violet-500/15 text-violet-200",
    progress: "bg-violet-400",
    ring: "ring-violet-400/35",
    subtle: "bg-violet-500/8 border-violet-400/25",
  };
}

function categoryLabel(category: TrackCategory) {
  if (category === TrackCategory.QA) return "QA";
  if (category === TrackCategory.BA) return "BA";
  return "DA";
}

function toTrackCategory(value: string): TrackCategory {
  if (value === TrackCategory.QA || value === TrackCategory.BA || value === TrackCategory.DA) {
    return value;
  }
  return TrackCategory.QA;
}

function formatMinutes(minutes: number) {
  if (minutes <= 0) return "Завершено";
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours}ч`;
}

export async function generateMetadata({ params }: TrackDetailsProps): Promise<Metadata> {
  const [runtimeTrack, localeValue] = await Promise.all([
    resolveRuntimeCourseBySlug(params.trackId, { includeCourseEntities: false }),
    getLocale(),
  ]);

  const track = runtimeTrack
    ? applyTrackContentOverrides(runtimeTrack, normalizeLearningLocale(localeValue))
    : null;

  if (!track) return { title: "Track not found — SkillPath Academy" };

  return {
    title: `${track.title} — SkillPath Academy`,
    description: `${track.category} career track with ${track.modules.length} modules. Master real-world skills and land your first tech role.`,
    openGraph: {
      title: track.title,
      description: `${track.category} career track on SkillPath Academy`,
      type: "website",
    },
  };
}

export default async function TrackDetailsPage({ params, searchParams }: TrackDetailsProps) {
  const [runtimeTrack, session, localeValue] = await Promise.all([
    resolveRuntimeCourseBySlug(params.trackId, { includeCourseEntities: true }),
    getServerSession(authOptions),
    getLocale(),
  ]);

  const track = runtimeTrack ? applyTrackContentOverrides(runtimeTrack, normalizeLearningLocale(localeValue)) : null;

  if (!track) {
    notFound();
  }

  const trackCategory = toTrackCategory(track.category);
  const user = await resolveLearningUser(session?.user?.email);
  const progressRecords = user
    ? await prisma.userProgress.findMany({
        where: {
          userId: user.id,
          moduleId: {
            in: track.modules.map((moduleItem) => moduleItem.id),
          },
        },
      })
    : [];

  const certificate = user
    && track.source === "prisma-track"
    ? await prisma.certificate.findUnique({
        where: {
          userId_trackId: {
            userId: user.id,
            trackId: track.id,
          },
        },
      })
    : null;

  const progression = buildTrackProgression({
    category: trackCategory,
    modules: track.modules.map((moduleItem) => ({
      id: moduleItem.id,
      order: moduleItem.order,
      title: moduleItem.title,
      description: moduleItem.description,
      duration: moduleItem.estimatedDuration,
      content: moduleItem.content,
      lessonsCount: moduleItem.lessons.length,
      quizCount: moduleItem.quiz ? 1 : 0,
      simulationCount: moduleItem.simulations.length,
    })),
    userProgress: progressRecords.map((progress) => ({
      moduleId: progress.moduleId,
      status: progress.status,
      score: progress.score,
      completedAt: progress.completedAt,
    })),
  });

  const radarData = buildTrackSkillRadar({
    category: trackCategory,
    progression,
  });

  const level = getLevelByXp(progression.earnedXp);
  const levelProgress = getNextLevelTarget(progression.earnedXp);
  const accent = categoryAccent(trackCategory);
  const localizedLearnings = progression.modules.flatMap((moduleItem) =>
    moduleItem.whatYouWillLearn.length > 0 ? moduleItem.whatYouWillLearn : moduleItem.outcomes,
  );
  const whatYouLearn = Array.from(new Set(localizedLearnings)).slice(0, 6);
  const fallbackLearnings = getTrackLearningOutcomes(
    trackCategory,
    track.learningOutcomes ?? undefined,
  );
  const whatYouLearnToShow = whatYouLearn.length > 0 ? whatYouLearn : fallbackLearnings;
  const fallbackSkills = progression.modules.flatMap((moduleItem) => moduleItem.skills);
  const skillsToShow = progression.unlockedSkills.length > 0
    ? progression.unlockedSkills
    : Array.from(new Set(fallbackSkills)).slice(0, 8);
  const firstActiveModule =
    progression.modules.find((moduleItem) => moduleItem.state !== "locked") ?? progression.modules[0];
  const strongestSkill = [...radarData].sort((a, b) => b.value - a.value)[0]?.skill ?? "Core skill";
  const weakestSkill = [...radarData].sort((a, b) => a.value - b.value)[0]?.skill ?? "Core skill";

  return (
    <section className="page-shell">
      {searchParams?.locked && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          Завершите предыдущий модуль для разблокировки этого.
        </div>
      )}
      <header className="surface-elevated space-y-5 p-5 sm:p-7">
            <Breadcrumb items={[{ label: track.title }]} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide", accent.badge)}>
            {categoryLabel(trackCategory)} Трек
          </span>
          <Link href="/tracks" className="btn-secondary px-3 py-2 text-sm">
            К трекам
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <h1 className="hero-title">{track.title}</h1>
            <p className="body-text">{track.description}</p>
            <div className="flex flex-wrap items-center gap-2">
              <LevelBadge level={level} />
              <span className="xp-pill px-2.5 py-1 text-xs">
                {progression.earnedXp} XP заработано
              </span>
              <span className="xp-pill px-2.5 py-1 text-xs">
                Осталось: {formatMinutes(progression.estimatedMinutesLeft)}
              </span>
            </div>
          </div>

          <div className={cn("surface-subtle space-y-3 p-4 ring-1", accent.ring)}>
            <p className="kicker">Прогресс</p>
            <p className="text-3xl font-semibold text-foreground">{progression.overallProgressPercent}%</p>
            <div className="progress-track h-2">
              <div className={cn("h-full rounded-full progress-fill", accent.progress)} style={{ width: `${progression.overallProgressPercent}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">
              {progression.completedCount}/{progression.totalModules} модулей завершено
            </p>
            <p className="text-xs text-muted-foreground">
              XP до следующего уровня: {levelProgress.xpNeededForNext}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-elevated space-y-4 p-5">
            <h2 className="section-title">Чему вы научитесь</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            {whatYouLearnToShow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="surface-elevated space-y-4 p-5">
          <h2 className="section-title">Навыки, которые вы получите</h2>
          <div className="flex flex-wrap gap-2">
            {skillsToShow.map((skill) => (
              <span key={skill} className="skill-tag px-2.5 py-1 text-xs">
                {skill}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Сильнее всего: {strongestSkill} | Развивать дальше: {weakestSkill}</p>
        </section>
      </div>

      <section className="surface-elevated space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">Радар навыков</h2>
          <p className="text-xs text-muted-foreground">Оценка на основе прогресса и XP.</p>
        </div>
        <SkillRadarChart data={radarData} />
      </section>

      <section className="surface-elevated space-y-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">Учебный путь</h2>
          <Link
            href={`/tracks/${track.slug}/modules/${firstActiveModule?.id}`}
            className="btn-primary inline-flex items-center gap-2"
          >
            Продолжить обучение
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <TrackModuleTree
          nodes={progression.modules.map((m) => ({
            id: m.id,
            order: m.order,
            title: m.title,
            shortDescription: m.shortDescription,
            state: m.state,
            stateLabel: m.stateLabel,
            progressPercent: m.progressPercent,
            durationMinutes: m.durationMinutes,
            xpReward: m.xpReward,
            href: `/tracks/${track.slug}/modules/${m.id}`,
            unlockRequirement: m.unlockRequirement,
          }))}
          accentProgress={accent.progress}
        />
        <article className={cn("surface-subtle border p-4", accent.subtle)}>
          <p className="module-order-label">Финальное задание</p>
          <p className="mt-1 text-sm text-foreground">{progression.modules[progression.modules.length - 1]?.finalChallenge}</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* XP and Achievements */}
        <article className="surface-elevated space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="section-title">XP и достижения</h2>
            <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide", accent.badge)}>
              {level}
            </span>
          </div>

          {/* XP progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">{progression.earnedXp} XP</span>
              <span className="text-xs text-muted-foreground">из {progression.totalXpAvailable} доступно</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full transition-all duration-700", accent.progress)}
                style={{ width: `${progression.totalXpAvailable > 0 ? Math.min(100, Math.round((progression.earnedXp / progression.totalXpAvailable) * 100)) : 0}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">До следующего уровня: {levelProgress.xpNeededForNext} XP</p>
          </div>

          {/* Stats 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card/70 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Серия</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {progression.completionStreakDays}
                <span className="ml-1 text-sm font-normal text-muted-foreground">дней</span>
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card/70 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Модулей</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {progression.completedCount}
                <span className="text-sm font-normal text-muted-foreground">/{progression.totalModules}</span>
              </p>
            </div>
          </div>

          {/* Badges */}
          {progression.earnedBadges.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Значки</p>
              <div className="flex flex-wrap gap-1.5">
                {progression.earnedBadges.map((badge) => (
                  <span key={badge} className="inline-flex items-center gap-1 rounded-full border border-sky-400/30 bg-sky-50 px-2.5 py-1 text-xs text-sky-600">
                    🏆 {badge}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Unlocked skills */}
          {progression.unlockedSkills.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Разблокированные навыки</p>
              <div className="flex flex-wrap gap-1.5">
                {progression.unlockedSkills.map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" /> {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Career outcome */}
        <article className="surface-elevated space-y-4 p-5">
          <h2 className="section-title">Карьерный результат</h2>

          {/* Career path as visual steps */}
          <div className={cn("rounded-xl border p-4", accent.subtle)}>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Путь роста</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {getTrackCareerOutcome(trackCategory, track.careerImpact ?? undefined)
                .replace(/^Карьерный путь:\s*/i, "")
                .replace(/\.$/, "")
                .split(/\s*→\s*/)
                .map((step, i, arr) => (
                  <span key={step} className="flex items-center gap-1.5">
                    <span className={cn(
                      "rounded-lg border px-2.5 py-1 text-xs font-semibold",
                      i === 0 ? accent.badge : "border-border/60 bg-card/80 text-foreground",
                    )}>
                      {step.trim()}
                    </span>
                    {i < arr.length - 1 && (
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                    )}
                  </span>
                ))}
            </div>
          </div>

          {/* Next track suggestion */}
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Следующий трек</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {trackNextSuggestion(trackCategory).replace(/^Следующий рекомендуемый трек:\s*/i, "")}
              </p>
            </div>
          </div>

          {/* Time + active modules */}
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              Осталось: {formatMinutes(progression.estimatedMinutesLeft)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Layers3 className="h-3.5 w-3.5" />
              Активных модулей: {progression.inProgressCount}
            </span>
          </div>
        </article>
      </section>

      {progression.isTrackCompleted ? (
        <section className="surface-elevated space-y-4 p-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/12 px-3 py-1 text-xs text-amber-200">
            <Trophy className="h-4 w-4" />
            Поздравляем — Трек завершён
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Вы завершили {track.title}</h2>
          <p className="text-sm text-muted-foreground">
            Получены навыки: {skillsToShow.join(", ")}
          </p>
          <div className="flex flex-wrap gap-2">
            {certificate ? (
              <Link href={certificate.certificateUrl} className="btn-primary inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Открыть сертификат
              </Link>
            ) : (
              <span className="xp-pill rounded-xl px-3 py-2 text-sm">
                Сертификат будет доступен после подтверждения финального теста.
              </span>
            )}
            <Link href="/career" className="btn-secondary">Открыть карьерную карту</Link>
            <Link href="/tracks" className="btn-secondary">Выбрать следующий трек</Link>
          </div>
        </section>
      ) : null}
    </section>
  );
}
