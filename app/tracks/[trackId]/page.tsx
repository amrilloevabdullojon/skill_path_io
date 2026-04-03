import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { TrackCategory } from "@prisma/client";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Flame,
  Layers3,
  Lock,
  PlayCircle,
  Sparkles,
  Star,
  Target,
  Timer,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { getLocale } from "next-intl/server";

import { SkillRadarChart } from "@/components/skill-radar/skill-radar";
import { LevelBadge } from "@/components/level/level-badge";
import { TrackStickyProgress } from "@/components/tracks/track-sticky-progress";
import { authOptions } from "@/lib/auth";
import { resolveRuntimeCourseBySlug } from "@/lib/learning/runtime-content";
import { resolveLearningUser } from "@/lib/learning-user";
import { getNextLevelTarget, getLevelByXp } from "@/lib/progress/xp";
import { prisma } from "@/lib/prisma";
import {
  applyTrackContentOverrides,
  normalizeLearningLocale,
} from "@/lib/tracks/content-overrides";
import {
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
  params: { trackId: string };
  searchParams?: { locked?: string };
};

function categoryAccent(category: TrackCategory) {
  if (category === TrackCategory.QA) {
    return {
      badge: "border-emerald-400/35 bg-emerald-500/15 text-emerald-200",
      progress: "bg-emerald-400",
      ring: "ring-emerald-400/35",
      subtle: "bg-emerald-500/8 border-emerald-400/25",
      strip: "bg-gradient-to-r from-emerald-400 to-emerald-500",
    };
  }
  if (category === TrackCategory.BA) {
    return {
      badge: "border-orange-400/35 bg-orange-500/15 text-orange-200",
      progress: "bg-orange-400",
      ring: "ring-orange-400/35",
      subtle: "bg-orange-500/8 border-orange-400/25",
      strip: "bg-gradient-to-r from-orange-400 to-orange-500",
    };
  }
  return {
    badge: "border-violet-400/35 bg-violet-500/15 text-violet-200",
    progress: "bg-violet-400",
    ring: "ring-violet-400/35",
    subtle: "bg-violet-500/8 border-violet-400/25",
    strip: "bg-gradient-to-r from-violet-400 to-violet-500",
  };
}

function categoryLabel(category: TrackCategory) {
  if (category === TrackCategory.QA) return "QA";
  if (category === TrackCategory.BA) return "BA";
  return "DA";
}

function toTrackCategory(value: string): TrackCategory {
  if (
    value === TrackCategory.QA ||
    value === TrackCategory.BA ||
    value === TrackCategory.DA
  )
    return value;
  return TrackCategory.QA;
}

function formatMinutes(minutes: number) {
  if (minutes <= 0) return "—";
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours}ч`;
}

/** Estimate days to completion at ~30 min/day pace */
function formatForecast(minutesLeft: number): string {
  if (minutesLeft <= 0) return "";
  const days = Math.ceil(minutesLeft / 30);
  if (days >= 30) return `~${Math.round(days / 30)} мес.`;
  if (days >= 7) return `~${Math.round(days / 7)} нед.`;
  return `~${days} дн.`;
}

/** Map next track suggestion text to a track slug */
function nextTrackHref(suggestion: string): string {
  const s = suggestion.toLowerCase();
  if (s.includes("business analyst") || s.includes("ba ")) return "/tracks/ba-engineer";
  if (s.includes("data analyst") || s.includes("da ")) return "/tracks/da-engineer";
  if (s.includes("automation")) return "/tracks/qa-automation";
  return "/tracks";
}

export async function generateMetadata({
  params,
}: TrackDetailsProps): Promise<Metadata> {
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

export default async function TrackDetailsPage({
  params,
  searchParams,
}: TrackDetailsProps) {
  const [runtimeTrack, session, localeValue] = await Promise.all([
    resolveRuntimeCourseBySlug(params.trackId, { includeCourseEntities: true }),
    getServerSession(authOptions),
    getLocale(),
  ]);

  const track = runtimeTrack
    ? applyTrackContentOverrides(runtimeTrack, normalizeLearningLocale(localeValue))
    : null;
  if (!track) notFound();

  const trackCategory = toTrackCategory(track.category);
  const moduleIds = track.modules.map((m) => m.id);

  const [user, enrolledStudents] = await Promise.all([
    resolveLearningUser(session?.user?.email),
    track.source === "prisma-track"
      ? prisma.userProgress
          .groupBy({ by: ["userId"], where: { moduleId: { in: moduleIds } } })
          .then((g) => g.length)
      : Promise.resolve(0),
  ]);

  const [progressRecords, certificate] = await Promise.all([
    user
      ? prisma.userProgress.findMany({
          where: { userId: user.id, moduleId: { in: moduleIds } },
        })
      : Promise.resolve([]),
    user && track.source === "prisma-track"
      ? prisma.certificate.findUnique({
          where: { userId_trackId: { userId: user.id, trackId: track.id } },
        })
      : Promise.resolve(null),
  ]);

  const progression = buildTrackProgression({
    category: trackCategory,
    modules: track.modules.map((m) => ({
      id: m.id,
      order: m.order,
      title: m.title,
      description: m.description,
      duration: m.estimatedDuration,
      content: m.content,
      lessonsCount: m.lessons.length,
      quizCount: m.quiz ? 1 : 0,
      simulationCount: m.simulations.length,
    })),
    userProgress: progressRecords.map((p) => ({
      moduleId: p.moduleId,
      status: p.status,
      score: p.score,
      completedAt: p.completedAt,
    })),
  });

  const radarData = buildTrackSkillRadar({ category: trackCategory, progression });
  const level = getLevelByXp(progression.earnedXp);
  const levelProgress = getNextLevelTarget(progression.earnedXp);
  const accent = categoryAccent(trackCategory);

  const localizedLearnings = progression.modules.flatMap((m) =>
    m.whatYouWillLearn.length > 0 ? m.whatYouWillLearn : m.outcomes,
  );
  const whatYouLearnToShow =
    Array.from(new Set(localizedLearnings)).slice(0, 6).length > 0
      ? Array.from(new Set(localizedLearnings)).slice(0, 6)
      : getTrackLearningOutcomes(trackCategory, track.learningOutcomes ?? undefined);

  const fallbackSkills = progression.modules.flatMap((m) => m.skills);
  const skillsToShow =
    progression.unlockedSkills.length > 0
      ? progression.unlockedSkills
      : Array.from(new Set(fallbackSkills)).slice(0, 8);

  const firstActiveModule =
    progression.modules.find((m) => m.state !== "locked") ?? progression.modules[0];

  const strongestSkill = [...radarData].sort((a, b) => b.value - a.value)[0]?.skill ?? "";
  const weakestSkill = [...radarData].sort((a, b) => a.value - b.value)[0]?.skill ?? "";

  const totalDurationMinutes = progression.modules.reduce(
    (sum, m) => sum + m.durationMinutes,
    0,
  );
  const forecastDays = formatForecast(progression.estimatedMinutesLeft);

  // State breakdown
  const lockedCount = progression.modules.filter((m) => m.state === "locked").length;
  const nextStepModule = progression.modules.find(
    (m) => m.state === "in_progress" || m.state === "available",
  );

  // XP ring geometry (SVG circle, r=22, cx=cy=28, viewBox 56x56)
  const RING_R = 22;
  const RING_C = parseFloat((2 * Math.PI * RING_R).toFixed(2));
  const xpPercent =
    progression.totalXpAvailable > 0
      ? Math.min(100, Math.round((progression.earnedXp / progression.totalXpAvailable) * 100))
      : 0;
  const ringOffset = parseFloat((RING_C * (1 - xpPercent / 100)).toFixed(2));

  const nextSuggestion = trackNextSuggestion(trackCategory).replace(
    /^Следующий рекомендуемый трек:\s*/i,
    "",
  );

  const ctaHref = `/tracks/${track.slug}/modules/${firstActiveModule?.id}`;
  const ctaLabel = progression.isTrackCompleted
    ? "Повторить трек"
    : progression.completedCount > 0
      ? "Продолжить обучение"
      : "Начать обучение";

  const careerSteps = getTrackCareerOutcome(
    trackCategory,
    track.careerImpact ?? undefined,
  )
    .replace(/^Карьерный путь:\s*/i, "")
    .replace(/\.$/, "")
    .split(/\s*→\s*/);

  return (
    <section className="page-shell pb-32 lg:pb-8">
      {/* Locked module notification */}
      {searchParams?.locked && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          Завершите предыдущий модуль для разблокировки этого.
        </div>
      )}

      {/* ── HERO ────────────────────────────────────────── */}
      <header className="surface-elevated overflow-hidden p-0">
        <div className={cn("h-1 w-full", accent.strip)} />

        <div className="space-y-5 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Breadcrumb items={[{ label: track.title }]} />
            <Link href="/tracks" className="btn-secondary px-3 py-1.5 text-xs">
              ← К трекам
            </Link>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
                accent.badge,
              )}
            >
              {categoryLabel(trackCategory)} Трек
            </span>
            <LevelBadge level={level} />
          </div>

          {/* Title + description */}
          <div>
            <h1 className="hero-title">{track.title}</h1>
            <p className="body-text mt-2 max-w-2xl">{track.description}</p>
          </div>

          {/* Social proof */}
          {enrolledStudents > 0 && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-sky-400" />
                <span>
                  <strong className="text-foreground">{enrolledStudents.toLocaleString()}</strong>{" "}
                  студентов изучают
                </span>
              </span>
              <span className="text-muted-foreground/30">•</span>
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <strong className="text-foreground">4.8</strong>
              </span>
            </div>
          )}

          {/* Meta pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="xp-pill inline-flex items-center gap-1.5 px-2.5 py-1 text-xs">
              <Clock3 className="h-3.5 w-3.5" />
              {formatMinutes(totalDurationMinutes)}
            </span>
            <span className="xp-pill inline-flex items-center gap-1.5 px-2.5 py-1 text-xs">
              <Layers3 className="h-3.5 w-3.5" />
              {progression.totalModules} модулей
            </span>
            <span className="xp-pill inline-flex items-center gap-1.5 px-2.5 py-1 text-xs">
              <Zap className="h-3.5 w-3.5" />
              {progression.totalXpAvailable} XP
            </span>
          </div>

          {/* Onboarding nudge — only when not started yet */}
          {progression.completedCount === 0 && !progression.isTrackCompleted && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/8 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                <Zap className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Первый модуль займёт{" "}
                  <span className="text-emerald-400">
                    {formatMinutes(progression.modules[0]?.durationMinutes ?? 60)}
                  </span>{" "}
                  — начните прямо сейчас
                </p>
                {enrolledStudents > 0 && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {enrolledStudents.toLocaleString()} студентов уже изучают этот трек
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Mobile CTA — button + progress on separate rows */}
          <div className="space-y-3 lg:hidden">
            <Link
              href={ctaHref}
              className="btn-primary inline-flex items-center gap-2"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {progression.overallProgressPercent > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
                  <div
                    className={cn("h-full rounded-full", accent.progress)}
                    style={{ width: `${progression.overallProgressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-semibold tabular-nums text-foreground">
                  {progression.overallProgressPercent}%
                </span>
                <span className="text-xs text-muted-foreground/50">•</span>
                <span className="text-xs text-muted-foreground">
                  {progression.completedCount}/{progression.totalModules} модулей
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN 2-COLUMN LAYOUT ────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

        {/* ── LEFT: main content ── */}
        <div className="min-w-0 space-y-6">

          {/* What you'll learn + Skills */}
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="surface-elevated space-y-4 p-5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                <h2 className="section-title">Чему вы научитесь</h2>
              </div>
              <ul className="space-y-2">
                {whatYouLearnToShow.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="surface-elevated space-y-4 p-5">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 shrink-0 text-muted-foreground" />
                <h2 className="section-title">Навыки, которые вы получите</h2>
              </div>
              {skillsToShow.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {skillsToShow.map((skill) => (
                    <span key={skill} className="skill-tag px-2.5 py-1 text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/60">
                  Навыки откроются по мере прохождения модулей
                </p>
              )}
              {strongestSkill && weakestSkill && (
                <div className="space-y-1 rounded-lg border border-border/40 bg-card/40 p-3 text-xs">
                  <p>
                    <span className="text-emerald-400">↑ Сильнее всего: </span>
                    <span className="text-muted-foreground">{strongestSkill}</span>
                  </p>
                  <p>
                    <span className="text-sky-400">↗ Развивать: </span>
                    <span className="text-muted-foreground">{weakestSkill}</span>
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Module tree */}
          <section className="surface-elevated space-y-5 p-5">

            {/* Header: title + progress bar */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="section-title">Учебный путь</h2>
                {/* State breakdown */}
                <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs">
                  {progression.completedCount > 0 && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {progression.completedCount} завершено
                    </span>
                  )}
                  {progression.inProgressCount > 0 && (
                    <span className="flex items-center gap-1 text-sky-400">
                      <PlayCircle className="h-3.5 w-3.5" />
                      {progression.inProgressCount} в процессе
                    </span>
                  )}
                  {lockedCount > 0 && (
                    <span className="flex items-center gap-1 text-muted-foreground/50">
                      <Lock className="h-3.5 w-3.5" />
                      {lockedCount} заблокировано
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted/40">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", accent.progress)}
                    style={{ width: `${progression.overallProgressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-semibold tabular-nums text-foreground">
                  {progression.overallProgressPercent}%
                </span>
              </div>
            </div>

            {/* «Ваш следующий шаг» — next active module callout */}
            {nextStepModule && !progression.isTrackCompleted && (
              <div className="rounded-xl border border-sky-400/25 bg-sky-500/8 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-400/80">
                      Ваш следующий шаг
                    </p>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {nextStepModule.title}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {nextStepModule.shortDescription}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {nextStepModule.durationMinutes} мин
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        +{nextStepModule.xpReward} XP
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/tracks/${track.slug}/modules/${nextStepModule.id}`}
                    className="btn-primary shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-sm"
                  >
                    {nextStepModule.state === "in_progress" ? "Продолжить" : "Начать"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                {nextStepModule.progressPercent > 0 && (
                  <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-sky-400/15">
                    <div
                      className="h-full rounded-full bg-sky-400/60 transition-all duration-500"
                      style={{ width: `${nextStepModule.progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
            )}

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
                lessonsCount: m.lessonsCount,
                quizCount: m.quizCount,
                difficulty: m.difficulty,
              }))}
              accentProgress={accent.progress}
            />

            {progression.modules[progression.modules.length - 1]?.finalChallenge && (
              <article className={cn("rounded-xl border p-4", accent.subtle)}>
                <p className="module-order-label">Финальное задание</p>
                <p className="mt-1 text-sm text-foreground">
                  {progression.modules[progression.modules.length - 1]?.finalChallenge}
                </p>
              </article>
            )}
          </section>

          {/* Career outcome */}
          <section className="surface-elevated space-y-4 p-5">
            <h2 className="section-title">Карьерный результат</h2>

            <div className={cn("rounded-xl border p-4", accent.subtle)}>
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Путь роста
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                {careerSteps.map((step, i) => (
                  <span key={step} className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-xs font-semibold",
                        i === 0
                          ? accent.badge
                          : "border-border/60 bg-card/80 text-foreground",
                      )}
                    >
                      {step.trim()}
                    </span>
                    {i < careerSteps.length - 1 && (
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Next track — proper card with link */}
            <Link
              href={nextTrackHref(nextSuggestion)}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card/60 p-4 transition-all hover:border-amber-400/40 hover:bg-amber-500/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 transition-colors group-hover:bg-amber-500/20">
                <Sparkles className="h-5 w-5 text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Следующий трек
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">
                  {nextSuggestion}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-400" />
            </Link>
          </section>

          {/* Skill radar */}
          <section className="surface-elevated space-y-4 p-5">
            <div>
              <h2 className="section-title">Профиль навыков</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Прогресс по ключевым компетенциям трека
              </p>
            </div>
            <SkillRadarChart data={radarData} />
          </section>

          {/* Completion section */}
          {progression.isTrackCompleted && (
            <section className="surface-elevated space-y-4 p-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/12 px-3 py-1 text-xs text-amber-300">
                <Trophy className="h-4 w-4" />
                Поздравляем — Трек завершён
              </div>
              <h2 className="text-2xl font-semibold text-foreground">
                Вы завершили {track.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                Получены навыки: {skillsToShow.join(", ")}
              </p>
              <div className="flex flex-wrap gap-2">
                {certificate ? (
                  <Link
                    href={certificate.certificateUrl}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Открыть сертификат
                  </Link>
                ) : (
                  <span className="xp-pill rounded-xl px-3 py-2 text-sm">
                    Сертификат будет доступен после подтверждения финального теста.
                  </span>
                )}
                <Link href="/career" className="btn-secondary">
                  Открыть карьерную карту
                </Link>
                <Link href="/tracks" className="btn-secondary">
                  Выбрать следующий трек
                </Link>
              </div>
            </section>
          )}
        </div>

        {/* ── RIGHT: sticky sidebar ── */}
        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">

          {/* Progress card */}
          <div className="surface-elevated space-y-4 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Ваш прогресс</p>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
                  accent.badge,
                )}
              >
                {level}
              </span>
            </div>

            <div className="py-1 text-center">
              <p className="text-5xl font-bold tabular-nums text-foreground">
                {progression.overallProgressPercent}
                <span className="text-2xl font-normal text-muted-foreground">%</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {progression.completedCount} из {progression.totalModules} модулей
              </p>
              {forecastDays && (
                <p className="mt-1 text-xs text-muted-foreground/60">
                  При темпе 30 мин/день:{" "}
                  <span className="font-medium text-muted-foreground">{forecastDays}</span>
                </p>
              )}
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className={cn("h-full rounded-full transition-all duration-700", accent.progress)}
                style={{ width: `${progression.overallProgressPercent}%` }}
              />
            </div>

            <Link
              href={ctaHref}
              className="btn-primary flex w-full items-center justify-center gap-2 text-sm"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Stats: XP ring + Streak */}
          <div className="surface-elevated overflow-hidden p-0">
            <div className="grid grid-cols-2">
              {/* XP — circular progress ring */}
              <div className="flex flex-col items-center gap-1.5 p-4">
                <div className="relative h-14 w-14">
                  <svg
                    width="56" height="56" viewBox="0 0 56 56"
                    style={{ transform: "rotate(-90deg)" }}
                    aria-hidden="true"
                  >
                    <circle
                      cx="28" cy="28" r={RING_R}
                      fill="none"
                      stroke="rgba(148,163,184,0.18)"
                      strokeWidth="5"
                    />
                    <circle
                      cx="28" cy="28" r={RING_R}
                      fill="none"
                      stroke="rgb(251,191,36)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={RING_C}
                      strokeDashoffset={ringOffset}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold tabular-nums leading-none text-foreground">
                      {progression.earnedXp}
                    </span>
                    <span className="mt-0.5 text-[9px] leading-none text-muted-foreground">XP</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">XP заработано</p>
                <p className="text-[10px] text-muted-foreground/50">
                  ещё {levelProgress.xpNeededForNext} до ур.
                </p>
              </div>
              {/* Streak */}
              <div className="flex flex-col items-center gap-1.5 border-l border-border/40 p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/10">
                  <Flame className="h-7 w-7 text-orange-400" />
                </div>
                <p className="text-xl font-bold tabular-nums text-foreground">
                  {progression.completionStreakDays}
                </p>
                <p className="text-[11px] text-muted-foreground">дней подряд</p>
                <p className="text-[10px] text-muted-foreground/50">серия занятий</p>
              </div>
            </div>
          </div>

          {/* Badges */}
          {progression.earnedBadges.length > 0 && (
            <div className="surface-elevated space-y-3 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Значки
              </p>
              <div className="flex flex-wrap gap-1.5">
                {progression.earnedBadges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300"
                  >
                    <Trophy className="h-3 w-3" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Unlocked skills */}
          {progression.unlockedSkills.length > 0 && (
            <div className="surface-elevated space-y-3 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Разблокированные навыки
              </p>
              <div className="flex flex-wrap gap-1.5">
                {progression.unlockedSkills.slice(0, 6).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certificate (if completed) */}
          {progression.isTrackCompleted && certificate && (
            <Link
              href={certificate.certificateUrl}
              className="surface-elevated flex items-center gap-3 p-4 transition-all hover:ring-1 hover:ring-amber-400/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
                <Trophy className="h-5 w-5 text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">Сертификат</p>
                <p className="text-xs text-muted-foreground">Открыть и поделиться</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          )}
        </aside>
      </div>

      {/* Mobile sticky progress bar — appears above bottom nav after scroll */}
      <TrackStickyProgress
        progressPercent={progression.overallProgressPercent}
        completedCount={progression.completedCount}
        totalModules={progression.totalModules}
        ctaHref={ctaHref}
        ctaLabel={ctaLabel}
        accentProgress={accent.progress}
      />
    </section>
  );
}
