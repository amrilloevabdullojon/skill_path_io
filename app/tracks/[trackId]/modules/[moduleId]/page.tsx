import Link from "next/link";
import { getServerSession } from "next-auth";
import { LessonType, ProgressStatus, TrackCategory } from "@prisma/client";
import { ChevronLeft, ChevronRight, CircleCheckBig, Clock3, Flag, Layers3, Lock, Sparkles, Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { MentorChatWidget } from "@/components/mentor/mentor-chat-widget";
import { AIExerciseReview } from "@/components/simulation/ai-exercise-review";
import { LessonBlockRenderer } from "@/components/tracks/lesson-block-renderer";
import { MarkModuleCompleteButton } from "@/components/tracks/mark-module-complete-button";
import { QuickSaveBookmarkButton } from "@/components/tracks/quick-save-bookmark-button";
import { authOptions } from "@/lib/auth";
import { resolveRuntimeCourseBySlug } from "@/lib/learning/runtime-content";
import { resolveLearningUser } from "@/lib/learning-user";
import { buildDefaultAdaptiveSignal } from "@/lib/personalization/adaptive-defaults";
import { prisma } from "@/lib/prisma";
import { getAdaptivePath } from "@/lib/recommendations/adaptive-path";
import { applyTrackContentOverrides, normalizeLearningLocale } from "@/lib/tracks/content-overrides";
import { buildLessonBlocks, buildLessonRecommendations } from "@/lib/tracks/lesson-blocks";
import {
  LearningPathState,
  buildTrackProgression,
  parseModuleContent,
  trackCareerOutcome,
} from "@/lib/tracks/progression";
import { cn } from "@/lib/utils";
import { markModuleAsCompleted } from "./actions";

type ModulePageProps = {
  params: {
    trackId: string;
    moduleId: string;
  };
};

type TimelineNode = {
  id: string;
  title: string;
  description: string;
  kind: "lesson" | "mini_challenge" | "quiz" | "simulation" | "final_challenge";
  state: LearningPathState;
  href?: string;
};

const moduleStateView: Record<
  LearningPathState,
  {
    label: string;
    badge: string;
    dot: string;
    panel: string;
  }
> = {
  locked: {
    label: "Locked",
    badge: "border-border bg-card/85 text-muted-foreground",
    dot: "bg-border",
    panel: "border-border/80 bg-card/65",
  },
  available: {
    label: "Available",
    badge: "border-amber-400/35 bg-amber-500/15 text-amber-200",
    dot: "bg-amber-300",
    panel: "border-amber-400/25 bg-amber-500/7",
  },
  in_progress: {
    label: "In progress",
    badge: "border-sky-400/35 bg-sky-500/15 text-sky-200",
    dot: "bg-sky-400",
    panel: "border-sky-400/25 bg-sky-500/7",
  },
  completed: {
    label: "Completed",
    badge: "border-emerald-400/35 bg-emerald-500/15 text-emerald-200",
    dot: "bg-emerald-400",
    panel: "border-emerald-400/25 bg-emerald-500/7",
  },
};

const statusView = {
  [ProgressStatus.NOT_STARTED]: {
    label: "Not started",
    badge: "bg-card text-muted-foreground",
  },
  [ProgressStatus.IN_PROGRESS]: {
    label: "In progress",
    badge: "bg-sky-500/20 text-sky-300",
  },
  [ProgressStatus.COMPLETED]: {
    label: "Completed",
    badge: "bg-emerald-500/20 text-emerald-300",
  },
} as const;

function timelineLessonState(state: LearningPathState, lessonIndex: number, totalLessons: number): LearningPathState {
  if (state === "completed") {
    return "completed";
  }
  if (state === "locked") {
    return "locked";
  }
  if (state === "available") {
    return lessonIndex === 0 ? "available" : "locked";
  }
  if (totalLessons <= 1) {
    return "in_progress";
  }
  if (lessonIndex === 0) {
    return "completed";
  }
  if (lessonIndex === 1) {
    return "in_progress";
  }
  return "available";
}

function lessonTypeLabel(type: string) {
  if (type === LessonType.VIDEO || type === "VIDEO") {
    return "Video lesson";
  }
  if (type === LessonType.TASK || type === "TASK") {
    return "Practice lesson";
  }
  return "Text lesson";
}

function toTrackCategory(value: string) {
  if (value === TrackCategory.QA || value === TrackCategory.BA || value === TrackCategory.DA) {
    return value;
  }
  return TrackCategory.QA;
}

function timelineKindLabel(kind: TimelineNode["kind"]) {
  if (kind === "lesson") return "Lesson";
  if (kind === "mini_challenge") return "Mini challenge";
  if (kind === "quiz") return "Quiz";
  if (kind === "simulation") return "Simulation";
  return "Final challenge";
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours}h`;
}

export default async function ModulePage({ params }: ModulePageProps) {
  const [runtimeTrack, session, localeValue] = await Promise.all([
    resolveRuntimeCourseBySlug(params.trackId, { includeCourseEntities: true }),
    getServerSession(authOptions),
    getLocale(),
  ]);

  const track = runtimeTrack
    ? applyTrackContentOverrides(runtimeTrack, normalizeLearningLocale(localeValue))
    : null;

  if (!track) {
    notFound();
  }

  const trackCategory = toTrackCategory(track.category);

  const currentModuleIndex = track.modules.findIndex((moduleItem) => moduleItem.id === params.moduleId);
  const currentModule = track.modules[currentModuleIndex];

  if (!currentModule) {
    notFound();
  }

  const user = await resolveLearningUser(session?.user?.email);
  const isDemoUser = Boolean(user && (!session?.user?.email || session.user.email !== user.email));

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

  const progressByModuleId = new Map(progressRecords.map((progress) => [progress.moduleId, progress]));
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

  const currentModuleCard =
    progression.modules.find((moduleItem) => moduleItem.id === currentModule.id) ?? progression.modules[0];
  const currentState = currentModuleCard.state;
  const currentStatus = progressByModuleId.get(currentModule.id)?.status ?? ProgressStatus.NOT_STARTED;
  const completedCount = progression.completedCount;
  const progressPercent = progression.overallProgressPercent;

  const previousModule = currentModuleIndex > 0 ? track.modules[currentModuleIndex - 1] : null;
  const nextModule = currentModuleIndex < track.modules.length - 1 ? track.modules[currentModuleIndex + 1] : null;

  const primaryLesson = currentModule.lessons[0] ?? null;
  const nextLesson = currentModule.lessons[1] ?? null;
  const taskLesson =
    currentModule.lessons.find((lesson) => lesson.lessonType === LessonType.TASK || lesson.lessonType === "TASK") ??
    currentModule.lessons[currentModule.lessons.length - 1] ??
    null;

  const parsedContent = parseModuleContent(currentModule.content, trackCategory, currentModule.title, currentModule.order);
  const resources = parsedContent.resources.length > 0 ? parsedContent.resources : ["Read module notes", "Complete practical task", "Review quiz result"];

  const lessonBlocks = buildLessonBlocks({
    category: trackCategory,
    locale: normalizeLearningLocale(localeValue),
    moduleTitle: currentModule.title,
    moduleDescription: currentModule.description,
    moduleOverview: parsedContent.overview,
    outcomes: parsedContent.outcomes,
    resources,
    realWorldExample: parsedContent.realWorldExample,
    quickChecks: parsedContent.quickChecks,
    lessons: currentModule.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      body: lesson.body,
      order: lesson.order,
    })),
  });

  const recommendations = buildLessonRecommendations({
    hasNextLesson: Boolean(nextLesson),
    nextLessonTitle: nextLesson?.title ?? null,
    nextModuleTitle: nextModule?.title ?? null,
  });
  const remediationSuggestions = getAdaptivePath(buildDefaultAdaptiveSignal({
    completedModules: progression.completedCount,
    quizAccuracy: progressByModuleId.get(currentModule.id)?.score ?? undefined,
    skippedLessons: Math.max(currentModule.lessons.length - 1, 0),
    timeSpentMinutes: progression.completedCount * 40 + currentModule.lessons.length * 12,
    simulationPerformance: currentModuleCard.simulationCount > 0 ? 72 : 64,
    frequentMistakes: [],
  })).suggestions.slice(0, 3);

  const quizPassed =
    currentModule.quiz &&
    (progressByModuleId.get(currentModule.id)?.score ?? 0) >= currentModule.quiz.passingScore;

  const miniChallengeState: LearningPathState =
    currentState === "locked" ? "locked" : currentState === "completed" ? "completed" : "in_progress";
  const quizState: LearningPathState =
    currentState === "locked" ? "locked" : quizPassed ? "completed" : "available";
  const simulationState: LearningPathState =
    currentState === "locked" ? "locked" : currentState === "completed" ? "completed" : "available";
  const finalChallengeState: LearningPathState = currentState === "completed" ? "completed" : currentState;

  const timelineNodes: TimelineNode[] = [
    ...currentModule.lessons.map((lesson, index) => ({
      id: `lesson-${lesson.id}`,
      kind: "lesson" as const,
      title: `${lesson.order}. ${lesson.title}`,
      description: lessonTypeLabel(lesson.lessonType),
      state: timelineLessonState(currentState, index, currentModule.lessons.length),
    })),
    {
      id: `mini-${currentModule.id}`,
      kind: "mini_challenge" as const,
      title: "Mini challenge",
      description: "Short practical checkpoint inside lesson blocks",
      state: miniChallengeState,
    },
    ...(currentModule.quiz
      ? [
          {
            id: `quiz-${currentModule.quiz.id}`,
            kind: "quiz" as const,
            title: currentModule.quiz.title,
            description: `Passing score ${currentModule.quiz.passingScore}%`,
            state: quizState,
            href: `/tracks/${track.slug}/modules/${currentModule.id}/quiz`,
          },
        ]
      : []),
    ...(currentModuleCard.simulationCount > 0
      ? [
          {
            id: `simulation-${currentModule.id}`,
            kind: "simulation" as const,
            title: "Module simulation",
            description: "Practice real-world workflow for this topic",
            state: simulationState,
          },
        ]
      : []),
    {
      id: `final-${currentModule.id}`,
      kind: "final_challenge" as const,
      title: "Final challenge",
      description: parsedContent.finalChallenge,
      state: finalChallengeState,
    },
  ];

  const lessonContextText = [
    primaryLesson?.title ?? currentModule.title,
    primaryLesson?.body ?? "",
    parsedContent.overview,
    parsedContent.finalChallenge,
    parsedContent.realWorldExample,
  ]
    .join("\n\n")
    .slice(0, 2000);

  const navLinks = [
    { id: "module-overview", label: "Module overview" },
    { id: "lessons-timeline", label: "Lessons timeline" },
    { id: "lesson-content", label: "Lesson blocks" },
    { id: "practical-task", label: "Practical task" },
    ...(currentModule.quiz ? [{ id: "module-quiz", label: "Quiz" }] : []),
    ...(currentModuleCard.simulationCount > 0 ? [{ id: "module-simulation", label: "Simulation" }] : []),
    { id: "recommendations", label: "Recommendations" },
  ];

  return (
    <>
      <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)] sm:gap-6">
        <aside className="surface-elevated space-y-6 p-4 text-foreground sm:p-5 xl:sticky xl:top-20 xl:h-[calc(100vh-6rem)] xl:overflow-y-auto">
          <div className="space-y-2">
            <p className="kicker">Track progress</p>
            <h2 className="text-lg font-semibold">{track.title}</h2>
            <p className="text-sm text-muted-foreground">
              {completedCount}/{track.modules.length} modules completed
            </p>
            <div className="progress-track h-2">
              <div className="h-full rounded-full bg-sky-400 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{progressPercent}% overall</p>
            {isDemoUser && user ? <p className="text-xs text-muted-foreground">Demo user: {user.email}</p> : null}
          </div>

          <div className="space-y-2">
            <p className="kicker">Modules</p>
            <div className="space-y-2">
              {progression.modules.map((moduleItem) => {
                const stateStyle = moduleStateView[moduleItem.state];
                const isCurrent = moduleItem.id === currentModule.id;

                return (
                  <Link
                    key={moduleItem.id}
                    href={`/tracks/${track.slug}/modules/${moduleItem.id}`}
                    className={cn(
                      "surface-panel-hover block rounded-xl border border-border bg-card/80 p-3",
                      isCurrent && "border-sky-500/60 bg-card",
                      moduleItem.state === "locked" && "pointer-events-none opacity-60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Module {moduleItem.order}</p>
                        <p className="break-words text-sm font-medium text-foreground">{moduleItem.title}</p>
                      </div>
                      <span className={cn("mt-0.5 h-2.5 w-2.5 rounded-full", stateStyle.dot)} />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium", stateStyle.badge)}>
                        {stateStyle.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{moduleItem.progressPercent}%</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="kicker">Lesson checkpoints</p>
            <div className="space-y-1.5 rounded-2xl border border-border bg-card/55 p-2">
              {timelineNodes.map((node) => {
                const style = moduleStateView[node.state];
                return (
                  <div key={node.id} className="rounded-xl border border-border/70 bg-card/70 px-2.5 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-foreground">{node.title}</p>
                      <span className={cn("mt-0.5 h-2 w-2 rounded-full", style.dot)} />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{timelineKindLabel(node.kind)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <nav className="space-y-2">
            <p className="kicker">Lesson navigation</p>
            <div className="space-y-1 rounded-2xl border border-border bg-card/55 p-2">
              {navLinks.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="nav-link block">
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        </aside>

        <div className="space-y-6">
          <header className="surface-elevated space-y-4 p-5 sm:p-6">
            <p className="kicker">Module</p>
            <div className="space-y-2">
              <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">{currentModule.title}</h1>
              <p className="text-sm text-muted-foreground">{currentModule.description}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="chip-neutral inline-flex items-center gap-1 px-2.5 py-1">
                <Layers3 className="h-3.5 w-3.5" />
                Module {currentModule.order}/{track.modules.length}
              </span>
              <span className="chip-neutral inline-flex items-center gap-1 px-2.5 py-1">
                <Clock3 className="h-3.5 w-3.5" />
                {formatMinutes(currentModule.estimatedDuration)}
              </span>
              <span className="chip-neutral inline-flex items-center gap-1 px-2.5 py-1">
                <Flag className="h-3.5 w-3.5" />
                {currentModule.lessons.length} lessons
              </span>
              <span className="chip-neutral inline-flex items-center gap-1 px-2.5 py-1">
                <Sparkles className="h-3.5 w-3.5" />+{currentModuleCard.xpReward} XP
              </span>
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1", statusView[currentStatus].badge)}>
                <CircleCheckBig className="h-3.5 w-3.5" />
                {statusView[currentStatus].label}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <QuickSaveBookmarkButton
                title={`Module: ${currentModule.title}`}
                href={`/tracks/${track.slug}/modules/${currentModule.id}`}
                tag={trackCategory}
                type="module"
              />
              <Link href="/notes" className="btn-secondary px-3 py-2 text-xs">
                Open notes
              </Link>
            </div>
          </header>

          <section id="module-overview" className="surface-elevated space-y-4 p-5">
            <h2 className="section-title">Module overview</h2>
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <article className="surface-subtle space-y-3 p-4">
                <h3 className="text-base font-semibold text-foreground">Learning objectives</h3>
                <p className="text-sm text-muted-foreground">{parsedContent.overview || currentModule.description}</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {(parsedContent.objectives.length > 0 ? parsedContent.objectives : parsedContent.outcomes).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className={cn("surface-subtle space-y-3 p-4", moduleStateView[currentState].panel)}>
                <h3 className="text-base font-semibold text-foreground">Progression rewards</h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <p className="rounded-lg border border-border bg-card/70 px-2 py-1.5">Lesson XP: +{currentModuleCard.lessonXpReward}</p>
                  <p className="rounded-lg border border-border bg-card/70 px-2 py-1.5">Quiz XP: +{currentModuleCard.quizXpReward}</p>
                  <p className="rounded-lg border border-border bg-card/70 px-2 py-1.5">Simulation XP: +{currentModuleCard.simulationXpReward}</p>
                  <p className="rounded-lg border border-border bg-card/70 px-2 py-1.5">Difficulty: {currentModuleCard.difficulty}</p>
                </div>
                <p className="text-xs text-muted-foreground">{trackCareerOutcome(trackCategory)}</p>
              </article>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">What you will learn</h3>
              <div className="flex flex-wrap gap-2">
                {(parsedContent.whatYouWillLearn.length > 0 ? parsedContent.whatYouWillLearn : currentModuleCard.outcomes).map((item) => (
                  <span key={item} className="skill-tag px-2.5 py-1 text-xs">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section id="lessons-timeline" className="surface-elevated space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Lessons timeline</h2>
              <span className="text-xs text-muted-foreground">Learning path</span>
            </div>

            <div className="space-y-3">
              {timelineNodes.map((node, index) => {
                const style = moduleStateView[node.state];
                return (
                  <div key={node.id} className="space-y-2">
                    <article className={cn("surface-subtle p-4", style.panel)}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="module-order-label tracking-[0.16em]">{timelineKindLabel(node.kind)}</p>
                          <p className="text-sm font-semibold text-foreground">{node.title}</p>
                          <p className="text-xs text-muted-foreground">{node.description}</p>
                        </div>
                        <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold", style.badge)}>
                          {style.label}
                        </span>
                      </div>
                      {node.href ? (
                        <Link
                          href={node.state === "locked" ? "#" : node.href}
                          className={cn(
                            "mt-3 btn-secondary inline-flex items-center gap-2 px-3 py-1.5 text-xs",
                            node.state === "locked" && "pointer-events-none opacity-60",
                          )}
                        >
                          Open
                          {node.state === "locked" ? <Lock className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </Link>
                      ) : null}
                    </article>
                    {index < timelineNodes.length - 1 ? (
                      <div className="flex justify-center">
                        <ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground" />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          <section id="lesson-content" className="surface-elevated space-y-4 p-5">
            <h2 className="section-title">Lesson content</h2>
            <LessonBlockRenderer blocks={lessonBlocks} />
          </section>

          <section id="practical-task" className="space-y-4 rounded-2xl border border-emerald-500/28 bg-emerald-500/8 p-4 sm:p-5">
            <h2 className="text-xl font-semibold text-emerald-200">Practical task</h2>
            <p className="text-sm text-emerald-50/90">
              {taskLesson?.body ?? "Complete the practical task for this module and prepare a short summary of your work."}
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-emerald-100/90">
              {resources.map((resource) => (
                <li key={resource}>{resource}</li>
              ))}
            </ul>
            <p className="rounded-xl border border-emerald-400/35 bg-emerald-500/12 px-3 py-2 text-sm text-emerald-100">
              <span className="font-semibold">Final challenge:</span> {parsedContent.finalChallenge}
            </p>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <form action={markModuleAsCompleted} className="w-full sm:w-auto">
                <input type="hidden" name="trackSlug" value={track.slug} />
                <input type="hidden" name="moduleId" value={currentModule.id} />
                <MarkModuleCompleteButton isCompleted={currentStatus === ProgressStatus.COMPLETED} />
              </form>
              {currentModule.quiz ? (
                <Link href={`/tracks/${track.slug}/modules/${currentModule.id}/quiz`} id="module-quiz" className="btn-secondary inline-flex w-full items-center justify-center sm:w-auto">
                  Go to quiz
                </Link>
              ) : null}
            </div>
          </section>

          <section id="module-simulation">
            <AIExerciseReview moduleTitle={currentModule.title} trackTitle={track.title} />
          </section>

          <section id="recommendations" className="surface-elevated space-y-4 p-5">
            <h2 className="section-title">After lesson recommendations</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {recommendations.map((item) => (
                <article key={item.id} className="surface-subtle space-y-2 p-4">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs leading-6 text-muted-foreground">{item.description}</p>
                </article>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {nextLesson ? (
                <a href="#lesson-content" className="btn-secondary">
                  Continue lesson
                </a>
              ) : null}
              {nextModule ? (
                <Link href={`/tracks/${track.slug}/modules/${nextModule.id}`} className="btn-secondary">
                  Open next module
                </Link>
              ) : null}
              <Link href={`/tracks/${track.slug}`} className="btn-secondary">
                Back to track map
              </Link>
            </div>
          </section>

          <section className="surface-elevated space-y-4 p-5">
            <h2 className="section-title">AI remediation suggestions</h2>
            <div className="space-y-2">
              {remediationSuggestions.map((item) => (
                <article key={item.id} className="surface-subtle space-y-1 p-3">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                  <p className="text-xs text-muted-foreground">{item.action}</p>
                </article>
              ))}
            </div>
          </section>

          <nav className="surface-elevated flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={previousModule ? `/tracks/${track.slug}/modules/${previousModule.id}` : `/tracks/${track.slug}`}
              className="btn-secondary inline-flex w-full items-center gap-2 text-left sm:w-auto sm:text-center"
            >
              <ChevronLeft className="h-4 w-4" />
              {previousModule ? "Back: previous module" : "Back to track"}
            </Link>

            <Link
              href={
                nextModule
                  ? `/tracks/${track.slug}/modules/${nextModule.id}`
                  : currentModule.quiz
                    ? `/tracks/${track.slug}/modules/${currentModule.id}/quiz`
                    : `/tracks/${track.slug}`
              }
              className="btn-primary inline-flex w-full items-center gap-2 text-left sm:w-auto sm:text-center"
            >
              {nextModule ? "Next: following module" : currentModule.quiz ? "Next: go to quiz" : "Next: back to track"}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </nav>

          {progression.isTrackCompleted ? (
            <section className="surface-elevated space-y-4 p-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/12 px-3 py-1 text-xs text-amber-200">
                <Trophy className="h-4 w-4" />
                Track completion unlocked
              </div>
              <p className="text-sm text-muted-foreground">
                Congratulations. You finished all modules in this track and unlocked progression rewards.
              </p>
            </section>
          ) : null}
        </div>
      </section>

      <MentorChatWidget
        trackSlug={track.slug}
        moduleId={currentModule.id}
        trackTitle={track.title}
        moduleTitle={currentModule.title}
        lessonText={lessonContextText}
      />
    </>
  );
}
