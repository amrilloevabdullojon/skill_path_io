import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { TrackCategory } from "@prisma/client";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, Layers3, Lock, Sparkles, Trophy } from "lucide-react";
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
  trackCareerOutcome,
  trackNextSuggestion,
  trackWhatYouLearn,
} from "@/lib/tracks/progression";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

type TrackDetailsProps = {
  params: {
    trackId: string;
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

function stateStyles(state: LearningPathState) {
  if (state === "completed") {
    return {
      badge: "border-emerald-400/35 bg-emerald-500/15 text-emerald-200",
      dot: "bg-emerald-400",
    };
  }
  if (state === "in_progress") {
    return {
      badge: "border-sky-400/35 bg-sky-500/15 text-sky-200",
      dot: "bg-sky-400",
    };
  }
  if (state === "available") {
    return {
      badge: "border-amber-400/35 bg-amber-500/15 text-amber-200",
      dot: "bg-amber-300",
    };
  }
  return {
    badge: "border-border/60 bg-card/50 text-muted-foreground",
    dot: "bg-muted-foreground/40",
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
  if (minutes <= 0) return "Completed";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours}h`;
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

export default async function TrackDetailsPage({ params }: TrackDetailsProps) {
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
  const fallbackLearnings = trackWhatYouLearn(trackCategory);
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
      <header className="surface-elevated space-y-5 p-5 sm:p-7">
            <Breadcrumb items={[{ label: track.title }]} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide", accent.badge)}>
            {categoryLabel(trackCategory)} Track
          </span>
          <Link href="/tracks" className="btn-secondary px-3 py-2 text-sm">
            Back to tracks
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <h1 className="hero-title">{track.title}</h1>
            <p className="body-text">{track.description}</p>
            <div className="flex flex-wrap items-center gap-2">
              <LevelBadge level={level} />
              <span className="xp-pill px-2.5 py-1 text-xs">
                {progression.earnedXp} XP earned
              </span>
              <span className="xp-pill px-2.5 py-1 text-xs">
                ETA: {formatMinutes(progression.estimatedMinutesLeft)}
              </span>
            </div>
          </div>

          <div className={cn("surface-subtle space-y-3 p-4 ring-1", accent.ring)}>
            <p className="kicker">Track progress</p>
            <p className="text-3xl font-semibold text-foreground">{progression.overallProgressPercent}%</p>
            <div className="progress-track h-2">
              <div className={cn("h-full rounded-full progress-fill", accent.progress)} style={{ width: `${progression.overallProgressPercent}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">
              {progression.completedCount}/{progression.totalModules} modules completed
            </p>
            <p className="text-xs text-muted-foreground">
              XP to next level: {levelProgress.xpNeededForNext}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-elevated space-y-4 p-5">
            <h2 className="section-title">What you will learn</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            {whatYouLearnToShow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="surface-elevated space-y-4 p-5">
          <h2 className="section-title">Skills you will gain</h2>
          <div className="flex flex-wrap gap-2">
            {skillsToShow.map((skill) => (
              <span key={skill} className="skill-tag px-2.5 py-1 text-xs">
                {skill}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Strongest now: {strongestSkill} | Focus next: {weakestSkill}</p>
        </section>
      </div>

      <section className="surface-elevated space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">Skill radar</h2>
          <p className="text-xs text-muted-foreground">Live estimation from module progression and XP milestones.</p>
        </div>
        <SkillRadarChart data={radarData} />
      </section>

      <section className="surface-elevated space-y-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">Learning path</h2>
          <Link
            href={`/tracks/${track.slug}/modules/${firstActiveModule?.id}`}
            className="btn-primary inline-flex items-center gap-2"
          >
            Continue learning
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {progression.modules.map((moduleItem, index) => {
            const style = stateStyles(moduleItem.state);
            return (
              <div key={moduleItem.id} className="space-y-2">
                <article className="surface-subtle p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="module-order-label">Module {moduleItem.order}</p>
                      <p className="section-heading">{moduleItem.title}</p>
                      <p className="text-sm text-muted-foreground">{moduleItem.shortDescription}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", style.badge)}>
                        {moduleItem.stateLabel}
                      </span>
                      {moduleItem.state === "locked" ? <Lock className="h-4 w-4 text-muted-foreground" /> : null}
                    </div>
                  </div>
                  <div className="progress-track mt-3 h-2">
                    <div className={cn("h-full rounded-full progress-fill", accent.progress)} style={{ width: `${moduleItem.progressPercent}%` }} />
                  </div>
                  {moduleItem.unlockRequirement ? (
                    <p className="mt-2 text-xs text-amber-300">{moduleItem.unlockRequirement}</p>
                  ) : null}
                </article>
                {index < progression.modules.length - 1 ? (
                  <div className="flex justify-center">
                    <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground" />
                  </div>
                ) : null}
              </div>
            );
          })}
          <article className={cn("surface-subtle border p-4", accent.subtle)}>
            <p className="module-order-label">Final challenge</p>
            <p className="mt-1 text-sm text-foreground">{progression.modules[progression.modules.length - 1]?.finalChallenge}</p>
          </article>
        </div>
      </section>

      <section className="surface-elevated space-y-5 p-5">
        <h2 className="section-title">Module cards</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {progression.modules.map((moduleItem) => {
            const style = stateStyles(moduleItem.state);
            return (
              <article key={moduleItem.id} className="surface-subtle space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="module-order-label">Module {moduleItem.order}</p>
                    <h3 className="section-heading">{moduleItem.title}</h3>
                  </div>
                  <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", style.badge)}>
                    {moduleItem.stateLabel}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{moduleItem.shortDescription}</p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p className="data-pill px-2 py-1.5">Duration: {moduleItem.durationMinutes} min</p>
                  <p className="data-pill px-2 py-1.5">XP reward: +{moduleItem.xpReward}</p>
                  <p className="data-pill px-2 py-1.5">Lessons: {moduleItem.lessonsCount}</p>
                  <p className="data-pill px-2 py-1.5">Quiz: {moduleItem.quizCount}</p>
                  <p className="data-pill px-2 py-1.5">Simulation: {moduleItem.simulationCount}</p>
                  <p className="data-pill px-2 py-1.5">Difficulty: {moduleItem.difficulty}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="skill-tag px-2 py-1 text-[10px]">Lesson</span>
                  <span className="skill-tag px-2 py-1 text-[10px]">Quiz</span>
                  <span className="skill-tag px-2 py-1 text-[10px]">Practice</span>
                  <span className="skill-tag px-2 py-1 text-[10px]">Simulation</span>
                </div>

                <div className="progress-track h-2">
                  <div className={cn("h-full rounded-full progress-fill", accent.progress)} style={{ width: `${moduleItem.progressPercent}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{moduleItem.progressPercent}% progress</p>

                <p className="text-xs text-muted-foreground">Final challenge: {moduleItem.finalChallenge}</p>
                <p className="text-xs text-muted-foreground">Real world example: {moduleItem.realWorldExample}</p>

                <Link
                  href={`/tracks/${track.slug}/modules/${moduleItem.id}`}
                  className={cn(
                    "btn-secondary inline-flex w-full items-center justify-center gap-2",
                    moduleItem.state === "locked" && "pointer-events-none opacity-50",
                  )}
                >
                  Open module
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="surface-elevated space-y-3 p-5">
          <h2 className="section-title">XP and badges</h2>
          <p className="text-sm text-muted-foreground">
            XP rules: Lesson +20, Quiz +50, Simulation +100.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <p className="data-pill px-2 py-1.5">Earned XP: {progression.earnedXp}</p>
            <p className="data-pill px-2 py-1.5">Total XP available: {progression.totalXpAvailable}</p>
            <p className="data-pill px-2 py-1.5">Current level: {level}</p>
            <p className="data-pill px-2 py-1.5">Streak: {progression.completionStreakDays} days</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {progression.earnedBadges.map((badge) => (
              <span key={badge} className="rounded-full border border-sky-400/30 bg-sky-500/12 px-2.5 py-1 text-xs text-sky-200">
                {badge}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {progression.unlockedSkills.map((skill) => (
              <span key={skill} className="rounded-full border border-emerald-400/30 bg-emerald-500/12 px-2.5 py-1 text-xs text-emerald-200">
                {skill} unlocked
              </span>
            ))}
          </div>
        </article>

        <article className="surface-elevated space-y-3 p-5">
          <h2 className="section-title">Career outcome</h2>
          <p className="text-sm text-foreground">{trackCareerOutcome(trackCategory)}</p>
          <p className="text-sm text-muted-foreground">{trackNextSuggestion(trackCategory)}</p>
          <p className="text-xs text-muted-foreground">Estimated completion time left: {formatMinutes(progression.estimatedMinutesLeft)}</p>
          <p className="text-xs text-muted-foreground">Current active modules: {progression.inProgressCount}</p>
        </article>
      </section>

      {progression.isTrackCompleted ? (
        <section className="surface-elevated space-y-4 p-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/12 px-3 py-1 text-xs text-amber-200">
            <Trophy className="h-4 w-4" />
            Congratulations - Track completed
          </div>
          <h2 className="text-2xl font-semibold text-foreground">You completed {track.title}</h2>
          <p className="text-sm text-muted-foreground">
            Skills gained: {skillsToShow.join(", ")}
          </p>
          <div className="flex flex-wrap gap-2">
            {certificate ? (
              <Link href={certificate.certificateUrl} className="btn-primary inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Open certificate
              </Link>
            ) : (
              <span className="xp-pill rounded-xl px-3 py-2 text-sm">
                Certificate will be available after final quiz confirmation.
              </span>
            )}
            <Link href="/career" className="btn-secondary">Open career roadmap</Link>
            <Link href="/tracks" className="btn-secondary">Choose next track</Link>
          </div>
        </section>
      ) : null}
    </section>
  );
}
