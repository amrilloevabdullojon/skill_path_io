import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { TrackCategory } from "@prisma/client";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDot,
  FileText,
  FolderKanban,
  GraduationCap,
  Lock,
  Map,
  Rocket,
  Target,
  Trophy,
} from "lucide-react";

import { TrackStickyProgress } from "@/components/tracks/track-sticky-progress";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { resolveRuntimeCourseBySlug } from "@/lib/learning/runtime-content";
import { findRuntimeModuleProgress } from "@/lib/learning/progress";
import { resolveLearningUser } from "@/lib/learning-user";
import { prisma } from "@/lib/prisma";
import {
  applyTrackContentOverrides,
  normalizeLearningLocale,
} from "@/lib/tracks/content-overrides";
import {
  buildTrackProgression,
  getTrackLearningOutcomes,
  type ModuleProgressionCard,
} from "@/lib/tracks/progression";
import { cn, pluralRu } from "@/lib/utils";

type TrackDetailsProps = {
  params: Promise<{ trackId: string }>;
  searchParams?: Promise<{ locked?: string }>;
};

function toTrackCategory(value: string): TrackCategory {
  if (value === TrackCategory.QA || value === TrackCategory.BA || value === TrackCategory.DA) {
    return value;
  }
  return TrackCategory.QA;
}

function categoryLabel(category: TrackCategory) {
  if (category === TrackCategory.QA) return "QA";
  if (category === TrackCategory.BA) return "BA";
  return "DA";
}

function categoryAccent(category: TrackCategory) {
  if (category === TrackCategory.QA) {
    return {
      badge: "border-emerald-400/35 bg-emerald-500/15 text-emerald-200",
      progress: "bg-emerald-400",
      soft: "border-emerald-400/25 bg-emerald-500/8",
      text: "text-emerald-300",
    };
  }
  if (category === TrackCategory.BA) {
    return {
      badge: "border-orange-400/35 bg-orange-500/15 text-orange-200",
      progress: "bg-orange-400",
      soft: "border-orange-400/25 bg-orange-500/8",
      text: "text-orange-300",
    };
  }
  return {
    badge: "border-violet-400/35 bg-violet-500/15 text-violet-200",
    progress: "bg-violet-400",
    soft: "border-violet-400/25 bg-violet-500/8",
    text: "text-violet-300",
  };
}

function formatMinutes(minutes: number) {
  if (minutes <= 0) return "—";
  if (minutes < 60) return `${minutes} мин`;
  return `${Math.round((minutes / 60) * 10) / 10} ч`;
}

function progressWidth(value: number) {
  return `${Math.max(0, Math.min(100, value))}%`;
}

function stateIcon(moduleItem: ModuleProgressionCard) {
  if (moduleItem.state === "completed") return <CheckCircle2 className="h-4 w-4 text-emerald-300" />;
  if (moduleItem.state === "locked") return <Lock className="h-4 w-4 text-muted-foreground" />;
  if (moduleItem.state === "in_progress") return <CircleDot className="h-4 w-4 text-indigo-300" />;
  return <BookOpenCheck className="h-4 w-4 text-sky-300" />;
}

function stateLabel(moduleItem: ModuleProgressionCard) {
  if (moduleItem.state === "completed") return "Готово";
  if (moduleItem.state === "locked") return "Закрыто";
  if (moduleItem.state === "in_progress") return "В процессе";
  return "Следующий шаг";
}

function portfolioArtifacts(category: TrackCategory, modules: ModuleProgressionCard[]) {
  const fromModules = modules
    .map((moduleItem) => moduleItem.finalChallenge)
    .filter(Boolean)
    .slice(0, 3);

  if (fromModules.length >= 3) return fromModules;
  if (category === TrackCategory.QA) {
    return ["Баг-репорт с severity и шагами воспроизведения", "Тест-чеклист для фичи", "Короткий release risk summary"];
  }
  if (category === TrackCategory.BA) {
    return ["User story с acceptance criteria", "Карта требований и вопросов к стейкхолдерам", "Мини-спецификация для передачи команде"];
  }
  return ["SQL-анализ с выводами", "Мини-dashboard brief", "Продуктовый insight report"];
}

export async function generateMetadata({ params }: TrackDetailsProps): Promise<Metadata> {
  const resolvedParams = await params;
  const [runtimeTrack, localeValue] = await Promise.all([
    resolveRuntimeCourseBySlug(resolvedParams.trackId, { includeCourseEntities: false }),
    getLocale(),
  ]);
  const track = runtimeTrack
    ? applyTrackContentOverrides(runtimeTrack, normalizeLearningLocale(localeValue))
    : null;

  if (!track) return { title: "Track not found" };

  return {
    title: track.title,
    description: `${track.title}: практический учебный путь с уроками, миссиями и портфолио-артефактами.`,
    openGraph: {
      title: track.title,
      description: track.description,
      type: "website",
    },
  };
}

export default async function TrackDetailsPage({ params, searchParams }: TrackDetailsProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const [runtimeTrack, session, localeValue] = await Promise.all([
    resolveRuntimeCourseBySlug(resolvedParams.trackId, { includeCourseEntities: true }),
    getServerSession(authOptions),
    getLocale(),
  ]);

  const track = runtimeTrack
    ? applyTrackContentOverrides(runtimeTrack, normalizeLearningLocale(localeValue))
    : null;

  if (!track) notFound();

  const trackCategory = toTrackCategory(track.category);
  const accent = categoryAccent(trackCategory);
  const moduleIds = track.modules.map((moduleItem) => moduleItem.id);

  const [user, enrolledStudents] = await Promise.all([
    resolveLearningUser(session?.user?.email),
    track.source === "prisma-track" && moduleIds.length > 0
      ? prisma.userProgress
          .groupBy({ by: ["userId"], where: { moduleId: { in: moduleIds } } })
          .then((groups) => groups.length)
      : Promise.resolve(0),
  ]);

  const progressRecords = user
    ? await findRuntimeModuleProgress({
        userId: user.id,
        moduleIds,
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
    userProgress: progressRecords.map((record) => ({
      moduleId: record.moduleId,
      status: record.status,
      score: record.score,
      completedAt: record.completedAt,
    })),
  });

  const nextModule =
    progression.modules.find((moduleItem) => moduleItem.state === "in_progress") ??
    progression.modules.find((moduleItem) => moduleItem.state === "available") ??
    progression.modules[0] ??
    null;
  const ctaHref = nextModule ? `/tracks/${track.slug}/modules/${nextModule.id}` : "/tracks";
  const ctaLabel = progression.isTrackCompleted
    ? "Повторить трек"
    : progression.completedCount > 0
      ? "Продолжить"
      : "Начать трек";
  const learningOutcomes = getTrackLearningOutcomes(trackCategory, track.learningOutcomes ?? undefined).slice(0, 4);
  const skills = Array.from(
    new Set([
      ...(track.skills ?? []),
      ...progression.modules.flatMap((moduleItem) => moduleItem.skills),
    ]),
  ).slice(0, 8);
  const artifacts = portfolioArtifacts(trackCategory, progression.modules);
  const totalMinutes = progression.modules.reduce((sum, moduleItem) => sum + moduleItem.durationMinutes, 0);

  if (progression.totalModules === 0) {
    return (
      <section className="page-shell">
        <EmptyState
          title="В треке пока нет модулей"
          description="Контент ещё не опубликован. Вернитесь к каталогу и выберите другой путь."
          actionLabel="К трекам"
          actionHref="/tracks"
        />
      </section>
    );
  }

  return (
    <section className="page-shell pb-32 lg:pb-8">
      {resolvedSearchParams?.locked ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Завершите предыдущий модуль, чтобы открыть этот шаг.
        </div>
      ) : null}

      <header className="surface-elevated overflow-hidden p-0">
        <div className={cn("h-1 w-full", accent.progress)} />
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6 p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href="/tracks" className="btn-secondary inline-flex items-center gap-2 px-3 py-1.5 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" />
                К трекам
              </Link>
              <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", accent.badge)}>
                {categoryLabel(trackCategory)} путь
              </span>
            </div>

            <div className="max-w-3xl space-y-3">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <Map className="h-4 w-4" />
                Учебная дорога
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{track.title}</h1>
              <p className="text-sm leading-6 text-muted-foreground sm:text-base">{track.description}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={ctaHref} className={cn(buttonVariants({ variant: "contrast", size: "lg" }), "gap-2")}>
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#path" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "gap-2")}>
                Посмотреть путь
                <Map className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <aside className="border-t border-border-subtle bg-background/30 p-5 lg:border-l lg:border-t-0 sm:p-7">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Прогресс трека</span>
                  <span className="font-semibold text-foreground">{progression.overallProgressPercent}%</span>
                </div>
                <div className="progress-track mt-2 h-2.5">
                  <div className={cn("h-full rounded-full", accent.progress)} style={{ width: progressWidth(progression.overallProgressPercent) }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="mini-stat-box p-3">
                  <p className="text-muted-foreground">Модули</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {progression.completedCount}/{progression.totalModules}
                  </p>
                </div>
                <div className="mini-stat-box p-3">
                  <p className="text-muted-foreground">Время</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{formatMinutes(totalMinutes)}</p>
                </div>
                <div className="mini-stat-box p-3">
                  <p className="text-muted-foreground">XP</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{progression.totalXpAvailable}</p>
                </div>
                <div className="mini-stat-box p-3">
                  <p className="text-muted-foreground">Учатся</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{enrolledStudents || "—"}</p>
                </div>
              </div>

              {nextModule ? (
                <div className={cn("rounded-xl border p-4", accent.soft)}>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Следующий шаг</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{nextModule.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatMinutes(nextModule.durationMinutes)} · +{nextModule.xpReward} XP</p>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0 space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            <article className="surface-elevated space-y-3 p-5">
              <GraduationCap className={cn("h-5 w-5", accent.text)} />
              <h2 className="section-heading">Цель трека</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Довести вас до уверенного первого рабочего сценария: урок, практика, проверка и портфолио-результат.
              </p>
            </article>
            <article className="surface-elevated space-y-3 p-5">
              <Target className={cn("h-5 w-5", accent.text)} />
              <h2 className="section-heading">Кому подходит</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Новичкам, которые хотят не просто читать теорию, а собрать понятные доказательства навыков.
              </p>
            </article>
            <article className="surface-elevated space-y-3 p-5">
              <FolderKanban className={cn("h-5 w-5", accent.text)} />
              <h2 className="section-heading">Результат</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                После модулей у вас останутся артефакты, которые можно перенести в портфолио.
              </p>
            </article>
          </section>

          <section id="path" className="surface-elevated space-y-5 p-5 sm:p-6">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="section-heading">Последовательность обучения</h2>
                <p className="section-subtext mt-1">Проходите сверху вниз: теория, короткая проверка, практический артефакт.</p>
              </div>
              <span className="chip-neutral px-2.5 py-1 text-xs">
                {progression.totalModules} {pluralRu(progression.totalModules, ["модуль", "модуля", "модулей"])}
              </span>
            </header>

            <div className="space-y-3">
              {progression.modules.map((moduleItem) => {
                const href = `/tracks/${track.slug}/modules/${moduleItem.id}`;
                const locked = moduleItem.state === "locked";
                return (
                  <article key={moduleItem.id} className="content-card p-4 sm:p-5">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className={cn("flex h-10 w-10 items-center justify-center rounded-full border bg-background/60", locked ? "border-border" : "border-indigo-400/30")}>
                          {stateIcon(moduleItem)}
                        </span>
                        <span className="mt-2 h-full min-h-8 w-px bg-border-subtle" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Модуль {moduleItem.order}</p>
                            <h3 className="mt-1 text-base font-semibold text-foreground">{moduleItem.title}</h3>
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{moduleItem.shortDescription}</p>
                          </div>
                          <span className="chip-neutral shrink-0 px-2.5 py-1 text-xs">{stateLabel(moduleItem)}</span>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3">
                          <div className="mini-stat-box p-3">
                            <p className="text-[11px] text-muted-foreground">Уроки</p>
                            <p className="mt-1 text-sm font-semibold text-foreground">{moduleItem.lessonsCount}</p>
                          </div>
                          <div className="mini-stat-box p-3">
                            <p className="text-[11px] text-muted-foreground">Практика</p>
                            <p className="mt-1 text-sm font-semibold text-foreground">{moduleItem.practiceCount}</p>
                          </div>
                          <div className="mini-stat-box p-3">
                            <p className="text-[11px] text-muted-foreground">Время</p>
                            <p className="mt-1 text-sm font-semibold text-foreground">{formatMinutes(moduleItem.durationMinutes)}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Готовность</span>
                            <span className="font-semibold text-foreground">{moduleItem.progressPercent}%</span>
                          </div>
                          <div className="progress-track h-2">
                            <div className={cn("h-full rounded-full", accent.progress)} style={{ width: progressWidth(moduleItem.progressPercent) }} />
                          </div>
                        </div>

                        {moduleItem.finalChallenge ? (
                          <div className="rounded-xl border border-border-subtle bg-background/35 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Артефакт модуля</p>
                            <p className="mt-1 text-sm text-foreground">{moduleItem.finalChallenge}</p>
                          </div>
                        ) : null}

                        {locked ? (
                          <p className="text-xs text-muted-foreground">{moduleItem.unlockRequirement ?? "Сначала завершите предыдущий шаг."}</p>
                        ) : (
                          <Link href={href} className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm">
                            {moduleItem.state === "completed" ? "Повторить" : moduleItem.state === "in_progress" ? "Продолжить" : "Начать"}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <article className="surface-elevated space-y-4 p-5 sm:p-6">
              <header className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background/50 text-indigo-300">
                  <BriefcaseBusiness className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="section-heading">Практические задания</h2>
                  <p className="section-subtext mt-1">Задачи имитируют рабочий контекст, а не школьный тест.</p>
                </div>
              </header>
              <div className="space-y-3">
                {progression.modules.slice(0, 4).map((moduleItem) => (
                  <div key={moduleItem.id} className="content-card p-4">
                    <p className="text-sm font-semibold text-foreground">{moduleItem.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{moduleItem.realWorldExample}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="surface-elevated space-y-4 p-5 sm:p-6">
              <header className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background/50 text-emerald-300">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="section-heading">Портфолио-артефакты</h2>
                  <p className="section-subtext mt-1">Что ученик должен вынести из трека как доказательство навыка.</p>
                </div>
              </header>
              <div className="space-y-3">
                {artifacts.map((artifact) => (
                  <div key={artifact} className="content-card flex items-start gap-3 p-4">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <p className="text-sm text-foreground">{artifact}</p>
                  </div>
                ))}
              </div>
              <Link href="/portfolio" className="btn-secondary inline-flex w-full justify-center gap-2 px-4 py-2.5">
                Открыть портфолио
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          </section>
        </main>

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <section className="surface-elevated space-y-4 p-5">
            <h2 className="section-heading">После трека вы умеете</h2>
            <ul className="space-y-3">
              {learningOutcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="surface-elevated space-y-4 p-5">
            <h2 className="section-heading">Навыки</h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span key={skill} className="skill-tag px-2.5 py-1 text-xs">{skill}</span>
              ))}
            </div>
          </section>

          <section className="surface-elevated space-y-4 p-5">
            <h2 className="section-heading">Быстрый старт</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Не нужно выбирать из десятка действий. Откройте следующий шаг, выполните практику и сохраните результат.
            </p>
            <Link href={ctaHref} className="btn-primary inline-flex w-full justify-center gap-2 px-4 py-3">
              {ctaLabel}
              <Rocket className="h-4 w-4" />
            </Link>
          </section>
        </aside>
      </div>

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
