import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  HelpCircle,
  Lock,
  PlayCircle,
  Target,
} from "lucide-react";

import { cn } from "@/lib/utils";

type LearningPathState = "locked" | "available" | "in_progress" | "completed";

type LessonHubItem = {
  id: string;
  order: number;
  title: string;
  description: string;
  typeLabel: string;
  state: LearningPathState;
  href: string;
};

type ModuleLessonHubProps = {
  moduleTitle: string;
  progressPercent: number;
  durationLabel: string;
  lessons: LessonHubItem[];
  quizHref: string | null;
  quizTitle: string | null;
  quizState: LearningPathState;
  finalChallenge: string;
};

const stateCopy: Record<LearningPathState, { label: string; icon: typeof PlayCircle; className: string }> = {
  completed: {
    label: "Готово",
    icon: CheckCircle2,
    className: "border-emerald-400/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  },
  in_progress: {
    label: "В процессе",
    icon: PlayCircle,
    className: "border-sky-400/35 bg-sky-500/10 text-sky-600 dark:text-sky-300",
  },
  available: {
    label: "Открыть",
    icon: PlayCircle,
    className: "border-amber-400/35 bg-amber-500/10 text-amber-600 dark:text-amber-300",
  },
  locked: {
    label: "Закрыто",
    icon: Lock,
    className: "border-border-subtle bg-muted/20 text-muted-foreground",
  },
};

function statusIcon(state: LearningPathState) {
  const Icon = stateCopy[state].icon;
  return <Icon className="h-4 w-4" />;
}

export function ModuleLessonHub({
  moduleTitle,
  progressPercent,
  durationLabel,
  lessons,
  quizHref,
  quizTitle,
  quizState,
  finalChallenge,
}: ModuleLessonHubProps) {
  const nextLesson =
    lessons.find((lesson) => lesson.state === "in_progress") ??
    lessons.find((lesson) => lesson.state === "available") ??
    lessons[0] ??
    null;
  const quizStatus = stateCopy[quizState];

  return (
    <section className="overflow-hidden rounded-4xl border border-border bg-background/75 shadow-sm backdrop-blur">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="space-y-5 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-300">
                <BookOpen className="h-3.5 w-3.5" />
                Карта уроков
              </div>
              <h4 className="mt-3 text-xl font-black text-foreground">{moduleTitle}</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Сначала пройдите короткие уроки, затем закрепите материал тестом и финальным артефактом.
              </p>
            </div>
            <div className="grid min-w-56 grid-cols-2 gap-2">
              <div className="rounded-2xl bg-muted/35 p-3">
                <Clock3 className="h-4 w-4 text-amber-500" />
                <p className="mt-1 text-sm font-black text-foreground">{durationLabel}</p>
                <p className="text-[11px] text-muted-foreground">время</p>
              </div>
              <div className="rounded-2xl bg-muted/35 p-3">
                <Target className="h-4 w-4 text-sky-500" />
                <p className="mt-1 text-sm font-black text-foreground">{progressPercent}%</p>
                <p className="text-[11px] text-muted-foreground">прогресс</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {lessons.map((lesson) => {
              const state = stateCopy[lesson.state];
              const locked = lesson.state === "locked";

              const card = (
                <article
                  className={cn(
                    "group flex min-h-40 flex-col justify-between rounded-3xl border bg-card p-4 shadow-sm transition",
                    !locked && "hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md",
                    lesson.state === "in_progress" && "border-sky-400/40 ring-2 ring-sky-400/10",
                    lesson.state === "completed" && "border-emerald-400/30",
                    locked && "opacity-60",
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-sm font-black text-slate-950">
                        {lesson.order}
                      </div>
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-bold", state.className)}>
                        {statusIcon(lesson.state)}
                        {state.label}
                      </span>
                    </div>
                    <h4 className="mt-4 line-clamp-2 text-base font-black text-foreground">{lesson.title}</h4>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{lesson.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      {lesson.typeLabel}
                    </span>
                    {!locked ? <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-amber-500" /> : null}
                  </div>
                </article>
              );

              return locked ? (
                <div key={lesson.id}>{card}</div>
              ) : (
                <a key={lesson.id} href={lesson.href}>
                  {card}
                </a>
              );
            })}
          </div>
        </div>

        <aside className="border-t border-border bg-card/70 p-4 sm:p-5 xl:border-l xl:border-t-0">
          <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm dark:bg-white dark:text-slate-950">
            <p className="text-xs font-bold uppercase tracking-wide opacity-70">Следующий шаг</p>
            <h4 className="mt-2 text-xl font-black">{nextLesson?.title ?? "Уроки модуля"}</h4>
            <p className="mt-2 text-sm leading-6 opacity-75">
              {nextLesson?.description ?? "Откройте первый доступный урок и соберите рабочий артефакт."}
            </p>
            {nextLesson ? (
              <a
                href={nextLesson.href}
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 text-sm font-black text-slate-950 transition hover:bg-amber-300"
              >
                {nextLesson.state === "completed" ? "Повторить урок" : "Открыть урок"}
                <ArrowRight className="h-4 w-4" />
              </a>
            ) : null}
          </div>

          <div className="mt-4 rounded-3xl border border-border/50 bg-background/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-1.5 text-sm font-black text-foreground">
                  <HelpCircle className="h-4 w-4 text-amber-500" />
                  Тест
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{quizTitle ?? "Тест появится после добавления вопросов."}</p>
              </div>
              <span className={cn("rounded-full border px-2 py-1 text-[11px] font-bold", quizStatus.className)}>
                {quizStatus.label}
              </span>
            </div>
            {quizHref ? (
              <Link href={quizHref} className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-2xl border text-sm font-bold transition hover:border-amber-400 hover:text-amber-500">
                Перейти к тесту
              </Link>
            ) : null}
          </div>

          <div className="mt-4 rounded-3xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <p className="text-sm font-black text-emerald-700 dark:text-emerald-300">Финальный артефакт</p>
            <p className="mt-2 line-clamp-4 text-sm leading-6 text-emerald-900/75 dark:text-emerald-100/75">
              {finalChallenge}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
