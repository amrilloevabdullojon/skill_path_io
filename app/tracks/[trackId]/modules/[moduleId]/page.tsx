import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { ProgressStatus, TrackCategory } from "@prisma/client";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Flag,
  FolderKanban,
  GraduationCap,
  Rocket,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import { AIExerciseReview } from "@/components/simulation/ai-exercise-review";
import { MarkModuleCompleteButton } from "@/components/tracks/mark-module-complete-button";
import { ModuleArtifactWorkspace } from "@/components/tracks/module-artifact-workspace";
import { ModuleCompletionReadiness } from "@/components/tracks/module-completion-readiness";
import { ModuleProgressChecklist } from "@/components/tracks/module-progress-checklist";
import { ModuleQuickPractice } from "@/components/tracks/module-quick-practice";
import { ModuleQuizReadiness } from "@/components/tracks/module-quiz-readiness";
import { ModuleStudySession } from "@/components/tracks/module-study-session";
import { TrackStickyProgress } from "@/components/tracks/track-sticky-progress";
import { buttonVariants } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { findRuntimeQuizAttemptSummaries } from "@/lib/learning/quiz-attempts";
import { findRuntimeModuleProgress } from "@/lib/learning/progress";
import { resolveRuntimeCourseBySlug } from "@/lib/learning/runtime-content";
import { resolveLearningUser } from "@/lib/learning-user";
import { applyTrackContentOverrides, normalizeLearningLocale } from "@/lib/tracks/content-overrides";
import { buildQaShiftBrief } from "@/lib/tracks/module-brief";
import { buildModulePrimaryCta } from "@/lib/tracks/module-cta";
import { buildTrackProgression, parseModuleContent } from "@/lib/tracks/progression";
import { cn } from "@/lib/utils";
import { markModuleAsCompleted } from "./actions";

type ModulePageProps = {
  params: Promise<{
    trackId: string;
    moduleId: string;
  }>;
};

function toTrackCategory(value: string) {
  if (value === TrackCategory.QA || value === TrackCategory.BA || value === TrackCategory.DA) {
    return value;
  }
  return TrackCategory.QA;
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} мин`;
  return `${Math.round((minutes / 60) * 10) / 10} ч`;
}

function progressWidth(value: number) {
  return `${Math.max(0, Math.min(100, value))}%`;
}

function lessonPreview(text: string) {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\|.*\|$/gm, "")
    .replace(/^-{3,}$/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 720);
}

function statusCopy(status: ProgressStatus) {
  if (status === ProgressStatus.COMPLETED) {
    return {
      label: "Завершён",
      className: "border-emerald-400/35 bg-emerald-500/10 text-emerald-300",
      icon: CheckCircle2,
    };
  }
  if (status === ProgressStatus.IN_PROGRESS) {
    return {
      label: "В процессе",
      className: "border-sky-400/35 bg-sky-500/10 text-sky-300",
      icon: Sparkles,
    };
  }
  return {
    label: "Не начат",
    className: "border-border-subtle bg-muted/10 text-muted-foreground",
    icon: Flag,
  };
}

function categoryAccent(category: TrackCategory) {
  if (category === TrackCategory.QA) {
    return {
      progress: "bg-emerald-400",
      text: "text-emerald-300",
      soft: "border-emerald-400/25 bg-emerald-500/8",
    };
  }
  if (category === TrackCategory.BA) {
    return {
      progress: "bg-orange-400",
      text: "text-orange-300",
      soft: "border-orange-400/25 bg-orange-500/8",
    };
  }
  return {
    progress: "bg-violet-400",
    text: "text-violet-300",
    soft: "border-violet-400/25 bg-violet-500/8",
  };
}

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const runtimeTrack = await resolveRuntimeCourseBySlug(resolvedParams.trackId, { includeCourseEntities: true });
  const moduleItem = runtimeTrack?.modules.find((item) => item.id === resolvedParams.moduleId);

  if (!runtimeTrack || !moduleItem) return {};

  return {
    title: `${moduleItem.title} — ${runtimeTrack.title}`,
    description: moduleItem.description || `${runtimeTrack.category} module: ${moduleItem.title}`,
    robots: { index: false },
  };
}

export default async function ModulePage({ params }: ModulePageProps) {
  const resolvedParams = await params;
  const [runtimeTrack, session, localeValue] = await Promise.all([
    resolveRuntimeCourseBySlug(resolvedParams.trackId, { includeCourseEntities: true }),
    getServerSession(authOptions),
    getLocale(),
  ]);

  const track = runtimeTrack
    ? applyTrackContentOverrides(runtimeTrack, normalizeLearningLocale(localeValue))
    : null;

  if (!track) notFound();

  const currentModuleIndex = track.modules.findIndex((moduleItem) => moduleItem.id === resolvedParams.moduleId);
  const currentModule = track.modules[currentModuleIndex];

  if (!currentModule) notFound();

  const trackCategory = toTrackCategory(track.category);
  const accent = categoryAccent(trackCategory);
  const user = await resolveLearningUser(session?.user?.email);
  const progressRecords = user
    ? await findRuntimeModuleProgress({
        userId: user.id,
        moduleIds: track.modules.map((moduleItem) => moduleItem.id),
        source: track.source,
      })
    : [];

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

  const progressByModuleId = new Map(progressRecords.map((progress) => [progress.moduleId, progress]));
  const currentModuleCard = progression.modules.find((moduleItem) => moduleItem.id === currentModule.id) ?? progression.modules[0];
  const currentState = currentModuleCard.state;
  const currentProgress = progressByModuleId.get(currentModule.id);
  const currentStatus = currentProgress?.status ?? ProgressStatus.NOT_STARTED;
  const currentScore = currentProgress?.score ?? null;
  const status = statusCopy(currentStatus);
  const StatusIcon = status.icon;

  if (currentModule.order > 1) {
    if (!session) {
      redirect(`/login?callbackUrl=/tracks/${resolvedParams.trackId}/modules/${resolvedParams.moduleId}`);
    }
    if (currentState === "locked") {
      redirect(`/tracks/${resolvedParams.trackId}?locked=true`);
    }
  }

  const previousModule = currentModuleIndex > 0 ? track.modules[currentModuleIndex - 1] : null;
  const nextModule = currentModuleIndex < track.modules.length - 1 ? track.modules[currentModuleIndex + 1] : null;
  const parsedContent = parseModuleContent(currentModule.content, trackCategory, currentModule.title, currentModule.order);
  const resources =
    parsedContent.resources.length > 0
      ? parsedContent.resources
      : ["Прочитать ключевую теорию", "Выполнить практическую задачу", "Собрать итоговый артефакт"];
  const quizAttempts = user && currentModule.quiz
    ? await findRuntimeQuizAttemptSummaries({
        userId: user.id,
        moduleId: currentModule.id,
        quizId: currentModule.quiz.id,
        take: 3,
      })
    : [];
  const qaShiftBrief = trackCategory === TrackCategory.QA
    ? buildQaShiftBrief({
        moduleOrder: currentModule.order,
        lessons: currentModule.lessons.map((lesson) => ({ title: lesson.title })),
        finalChallenge: parsedContent.finalChallenge,
      })
    : null;
  const modulePrimaryCta = buildModulePrimaryCta({
    isCompleted: currentStatus === ProgressStatus.COMPLETED,
    nextModuleHref: nextModule ? `/tracks/${track.slug}/modules/${nextModule.id}` : null,
  });
  const theoryItems = currentModule.lessons.length > 0
    ? currentModule.lessons
    : [{ id: currentModule.id, order: 1, title: currentModule.title, body: parsedContent.overview || currentModule.description, lessonType: "TEXT" }];
  const lessonStepState =
    currentStatus === ProgressStatus.COMPLETED
      ? "completed"
      : currentStatus === ProgressStatus.IN_PROGRESS
        ? "in_progress"
        : "available";
  const quizStepState = currentModule.quiz
    ? currentStatus === ProgressStatus.COMPLETED || (currentScore !== null && currentScore >= currentModule.quiz.passingScore)
      ? "completed"
      : currentScore !== null
        ? "in_progress"
        : "available"
    : "locked";
  const moduleSteps = [
    {
      id: "lessons",
      title: "Понять основу",
      description: "Прочитайте короткую теорию и выделите, что нужно применить в рабочем сценарии.",
      state: lessonStepState,
      href: "#theory",
      metric: `${theoryItems.length} уроков · ${formatMinutes(currentModule.estimatedDuration)}`,
    },
    {
      id: "practice",
      title: "Закрепить действием",
      description: "Разберите практическую задачу и проверьте себя на коротких вопросах.",
      state: currentStatus === ProgressStatus.COMPLETED ? "completed" : "available",
      href: "#practice",
      metric: currentModule.quiz ? `${currentModule.quiz.questions.length} вопросов в quiz` : "Практический сценарий",
    },
    {
      id: "artifact",
      title: "Собрать артефакт",
      description: "Заполните рабочий результат, который можно перенести в портфолио.",
      state: currentStatus === ProgressStatus.COMPLETED ? "completed" : "available",
      href: "#artifact",
      metric: "5 веток артефакта",
    },
    {
      id: "quiz",
      title: "Проверить готовность",
      description: "Закройте quiz или повторите попытку, если нужно добрать баллы.",
      state: quizStepState,
      href: currentModule.quiz ? `/tracks/${track.slug}/modules/${currentModule.id}/quiz` : "#artifact",
      metric: currentModule.quiz ? `Порог ${currentModule.quiz.passingScore}%` : "Без quiz",
    },
  ] as const;

  return (
    <>
      <TrackStickyProgress
        progressPercent={progression.overallProgressPercent}
        completedCount={progression.completedCount}
        totalModules={track.modules.length}
        ctaHref={modulePrimaryCta.href}
        ctaLabel={modulePrimaryCta.label}
        accentProgress={accent.progress}
      />

      <section className="page-shell pb-32 lg:pb-8">
        <header className="surface-elevated overflow-hidden p-0">
          <div className={cn("h-1 w-full", accent.progress)} />
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-6 p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link href={`/tracks/${track.slug}`} className="btn-secondary inline-flex items-center gap-2 px-3 py-1.5 text-xs">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  К треку
                </Link>
                <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", status.className)}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </span>
              </div>

              <div className="max-w-3xl space-y-3">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  Модуль {currentModule.order} из {track.modules.length}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{currentModule.title}</h1>
                <p className="text-sm leading-6 text-muted-foreground sm:text-base">{currentModule.description}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a href="#theory" className={cn(buttonVariants({ variant: "contrast", size: "lg" }), "gap-2")}>
                  Начать сценарий
                  <ArrowRight className="h-4 w-4" />
                </a>
                {currentModule.quiz ? (
                  <Link href={`/tracks/${track.slug}/modules/${currentModule.id}/quiz`} className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "gap-2")}>
                    Открыть quiz
                    <BookOpenCheck className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>

            <aside className="border-t border-border-subtle bg-background/30 p-5 lg:border-l lg:border-t-0 sm:p-7">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Готовность модуля</span>
                    <span className="font-semibold text-foreground">{currentModuleCard.progressPercent}%</span>
                  </div>
                  <div className="progress-track mt-2 h-2.5">
                    <div className={cn("h-full rounded-full", accent.progress)} style={{ width: progressWidth(currentModuleCard.progressPercent) }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="mini-stat-box p-3">
                    <p className="text-muted-foreground">Время</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{formatMinutes(currentModule.estimatedDuration)}</p>
                  </div>
                  <div className="mini-stat-box p-3">
                    <p className="text-muted-foreground">XP</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{currentModuleCard.xpReward}</p>
                  </div>
                  <div className="mini-stat-box p-3">
                    <p className="text-muted-foreground">Уроки</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{currentModule.lessons.length}</p>
                  </div>
                  <div className="mini-stat-box p-3">
                    <p className="text-muted-foreground">Quiz</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{currentModule.quiz ? currentModule.quiz.questions.length : "—"}</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <main className="min-w-0 space-y-6">
            <ModuleProgressChecklist
              moduleTitle={currentModule.title}
              progressPercent={currentModuleCard.progressPercent}
              steps={moduleSteps}
              primaryHref={modulePrimaryCta.href}
              primaryLabel={modulePrimaryCta.label}
            />

            <ModuleStudySession
              moduleTitle={currentModule.title}
              durationLabel={formatMinutes(currentModule.estimatedDuration)}
              progressPercent={currentModuleCard.progressPercent}
              overview={parsedContent.overview || currentModule.description}
              finalChallenge={parsedContent.finalChallenge}
              resources={resources}
              quizHref={currentModule.quiz ? `/tracks/${track.slug}/modules/${currentModule.id}/quiz` : null}
              quizQuestionCount={currentModule.quiz?.questions.length ?? 0}
              accentText={accent.text}
              accentSoft={accent.soft}
            />

            <section id="theory" className="surface-elevated space-y-5 p-5 sm:p-6">
              <header>
                <h2 className="section-heading">Короткая теория</h2>
                <p className="section-subtext mt-1">Прочитайте основу и сразу переходите к рабочему действию.</p>
              </header>
              <div className="space-y-3">
                {theoryItems.map((lesson) => (
                  <article key={lesson.id} className="content-card p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="chip-neutral px-2.5 py-1 text-xs">Урок {lesson.order}</span>
                      <span className="chip-neutral px-2.5 py-1 text-xs">{lesson.lessonType}</span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-foreground">{lesson.title}</h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                      {lessonPreview(lesson.body || currentModule.description)}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section id="practice" className="space-y-4">
              <article className={cn("surface-elevated space-y-4 p-5 sm:p-6", accent.soft)}>
                <header className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background/50">
                    <BriefcaseIcon />
                  </span>
                  <div>
                    <h2 className="section-heading">Практическая задача</h2>
                    <p className="section-subtext mt-1">Сделайте маленькую рабочую deliverable, а не просто прочитайте текст.</p>
                  </div>
                </header>
                {qaShiftBrief ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="content-card p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Сцена</p>
                      <p className="mt-2 text-sm leading-6 text-foreground">{qaShiftBrief.scene}</p>
                    </div>
                    <div className="content-card p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Ставки</p>
                      <p className="mt-2 text-sm leading-6 text-foreground">{qaShiftBrief.stakes}</p>
                    </div>
                  </div>
                ) : null}
                <div className="content-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Что сделать</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
                    {resources.map((resource) => (
                      <li key={resource}>{resource}</li>
                    ))}
                  </ul>
                </div>
              </article>

              {currentModule.quiz ? (
                <>
                  <ModuleQuizReadiness
                    quizTitle={currentModule.quiz.title}
                    quizHref={`/tracks/${track.slug}/modules/${currentModule.id}/quiz`}
                    questionCount={currentModule.quiz.questions.length}
                    passingScore={currentModule.quiz.passingScore}
                    previousScore={currentScore}
                    isCompleted={currentStatus === ProgressStatus.COMPLETED}
                    attempts={quizAttempts}
                  />
                  <ModuleQuickPractice
                    moduleTitle={currentModule.title}
                    quizHref={`/tracks/${track.slug}/modules/${currentModule.id}/quiz`}
                    questions={currentModule.quiz.questions.map((question) => ({
                      id: question.id,
                      text: question.text,
                      type: question.type,
                      options: question.options,
                      correctAnswer: question.correctAnswer,
                    }))}
                  />
                </>
              ) : null}
            </section>

            <section id="artifact" className="space-y-4">
              <ModuleArtifactWorkspace
                moduleId={currentModule.id}
                moduleTitle={currentModule.title}
                trackTitle={track.title}
                finalChallenge={parsedContent.finalChallenge}
                skills={(parsedContent.whatYouWillLearn.length > 0 ? parsedContent.whatYouWillLearn : currentModuleCard.outcomes).slice(0, 8)}
                shiftBrief={qaShiftBrief}
              />
              <article className="surface-elevated space-y-4 p-5 sm:p-6">
                <header>
                  <h2 className="section-heading">Готовность к завершению</h2>
                  <p className="section-subtext mt-1">Закрывайте модуль только когда есть понятный рабочий результат.</p>
                </header>
                <ModuleCompletionReadiness
                  moduleId={currentModule.id}
                  isCompleted={currentStatus === ProgressStatus.COMPLETED}
                />
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <form action={markModuleAsCompleted} className="w-full sm:w-auto">
                    <input type="hidden" name="trackSlug" value={track.slug} />
                    <input type="hidden" name="moduleId" value={currentModule.id} />
                    <MarkModuleCompleteButton isCompleted={currentStatus === ProgressStatus.COMPLETED} />
                  </form>
                  {currentModule.quiz ? (
                    <Link href={`/tracks/${track.slug}/modules/${currentModule.id}/quiz`} className="btn-secondary inline-flex w-full items-center justify-center sm:w-auto">
                      Пройти quiz
                    </Link>
                  ) : null}
                </div>
              </article>
            </section>

            {currentModuleCard.simulationCount > 0 ? (
              <section id="review">
                <AIExerciseReview moduleTitle={currentModule.title} trackTitle={track.title} />
              </section>
            ) : null}

            <nav className="surface-elevated flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={previousModule ? `/tracks/${track.slug}/modules/${previousModule.id}` : `/tracks/${track.slug}`}
                className="btn-secondary inline-flex w-full items-center gap-2 text-left sm:w-auto sm:text-center"
              >
                <ChevronLeft className="h-4 w-4" />
                {previousModule ? "Предыдущий модуль" : "К треку"}
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
                {nextModule ? "Следующий модуль" : currentModule.quiz ? "К quiz" : "К треку"}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </nav>
          </main>

          <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
            <section className="surface-elevated space-y-4 p-5">
              <h2 className="section-heading">Сценарий модуля</h2>
              <div className="space-y-3">
                {[
                  { label: "1. Теория", href: "#theory", icon: FileText },
                  { label: "2. Практика", href: "#practice", icon: Target },
                  { label: "3. Артефакт", href: "#artifact", icon: FolderKanban },
                  { label: "4. Проверка", href: currentModule.quiz ? `/tracks/${track.slug}/modules/${currentModule.id}/quiz` : "#artifact", icon: Trophy },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.label} href={item.href} className="content-card flex items-center gap-3 p-3 hover:border-indigo-400/40">
                      <Icon className={cn("h-4 w-4", accent.text)} />
                      <span className="text-sm font-semibold text-foreground">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="surface-elevated space-y-4 p-5">
              <h2 className="section-heading">Навыки</h2>
              <div className="flex flex-wrap gap-1.5">
                {currentModuleCard.skills.slice(0, 8).map((skill) => (
                  <span key={skill} className="skill-tag px-2.5 py-1 text-xs">{skill}</span>
                ))}
              </div>
            </section>

            <section className="surface-elevated space-y-4 p-5">
              <h2 className="section-heading">Следующий шаг</h2>
              <p className="text-sm leading-6 text-muted-foreground">{modulePrimaryCta.description}</p>
              <Link href={modulePrimaryCta.href} className="btn-primary inline-flex w-full justify-center gap-2 px-4 py-3">
                {modulePrimaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          </aside>
        </div>
      </section>
    </>
  );
}

function BriefcaseIcon() {
  return <Rocket className="h-5 w-5 text-indigo-300" />;
}
