import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  HelpCircle,
  Lock,
  PlayCircle,
  Route,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

type LearningPathState = "locked" | "available" | "in_progress" | "completed";

type LessonOverviewModule = {
  id: string;
  order: number;
  title: string;
  description: string;
  state: LearningPathState;
  progressPercent: number;
  durationMinutes: number;
  lessonsCount: number;
  quizCount: number;
  href: string;
  unlockRequirement?: string | null;
};

type TrackLessonsOverviewProps = {
  title: string;
  progressPercent: number;
  completedCount: number;
  totalCount: number;
  nextModule: LessonOverviewModule | null;
  modules: LessonOverviewModule[];
};

const moduleTheme: Record<LearningPathState, string> = {
  completed: "from-emerald-500 to-teal-600",
  in_progress: "from-sky-600 to-indigo-700",
  available: "from-amber-400 to-orange-500",
  locked: "from-slate-800 to-slate-950",
};

const stateLabel: Record<LearningPathState, string> = {
  completed: "Завершено",
  in_progress: "Продолжить",
  available: "Начать",
  locked: "Закрыто",
};

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} мин`;
  return `${Math.round((minutes / 60) * 10) / 10}ч`;
}

export function TrackLessonsOverview({
  title,
  progressPercent,
  completedCount,
  totalCount,
  nextModule,
  modules,
}: TrackLessonsOverviewProps) {
  return (
    <section className="rounded-4xl border border-border bg-background/70 p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-500">
                <Route className="h-3.5 w-3.5" />
                Текущие уроки
              </div>
              <h3 className="mt-3 text-xl font-black tracking-tight text-foreground sm:text-2xl">
                {title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Понятная карта уроков: что доступно, что завершено и куда нажать дальше.
              </p>
            </div>
            <div className="min-w-44 rounded-2xl bg-muted/35 p-3">
              <div className="flex items-center justify-between text-sm font-bold">
                <span>{progressPercent}%</span>
                <span className="text-muted-foreground">{completedCount}/{totalCount}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-background">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {modules.map((moduleItem) => {
              const locked = moduleItem.state === "locked";
              const card = (
                <article
                  className={cn(
                    "relative flex h-56 w-72 shrink-0 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-primary-foreground shadow-sm transition",
                    moduleTheme[moduleItem.state],
                    !locked && "hover:-translate-y-1 hover:shadow-xl",
                    locked && "opacity-70",
                  )}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.28),transparent_28%),radial-gradient(circle_at_88%_70%,rgba(255,255,255,0.14),transparent_24%)]" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-2xl font-black">Модуль {moduleItem.order}</p>
                        <p className="mt-1 line-clamp-2 text-sm font-semibold text-primary-foreground/82">
                          {moduleItem.title}
                        </p>
                      </div>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/18">
                        {moduleItem.state === "completed" ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : locked ? (
                          <Lock className="h-5 w-5" />
                        ) : (
                          <PlayCircle className="h-5 w-5" />
                        )}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-primary-foreground/70">
                      {moduleItem.description}
                    </p>
                  </div>

                  <div className="relative space-y-3">
                    <div className="flex flex-wrap gap-2 text-[11px] font-bold text-primary-foreground/85">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/16 px-2 py-1">
                        <BookOpen className="h-3 w-3" />
                        {moduleItem.lessonsCount}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/16 px-2 py-1">
                        <HelpCircle className="h-3 w-3" />
                        {moduleItem.quizCount}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/16 px-2 py-1">
                        <Clock3 className="h-3 w-3" />
                        {formatMinutes(moduleItem.durationMinutes)}
                      </span>
                    </div>
                    <div className="h-10 w-36 rounded-full bg-white/85 p-1">
                      <div
                        className="flex h-full min-w-10 items-center justify-center rounded-full bg-amber-400 px-3 text-xs font-black text-slate-950"
                        style={{ width: `${Math.max(30, moduleItem.progressPercent)}%` }}
                      >
                        {moduleItem.progressPercent}%
                      </div>
                    </div>
                    <p className="text-sm font-black">{stateLabel[moduleItem.state]}</p>
                  </div>
                </article>
              );

              return locked ? (
                <div key={moduleItem.id} title={moduleItem.unlockRequirement ?? "Закрыто"}>
                  {card}
                </div>
              ) : (
                <Link key={moduleItem.id} href={moduleItem.href}>
                  {card}
                </Link>
              );
            })}
          </div>
        </div>

        <aside className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h3 className="font-black text-foreground">Следующий шаг</h3>
          </div>
          {nextModule ? (
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Модуль {nextModule.order}
                </p>
                <h4 className="mt-1 text-xl font-black text-foreground">{nextModule.title}</h4>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{nextModule.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-muted/40 p-3">
                  <BookOpen className="mx-auto h-4 w-4 text-amber-500" />
                  <p className="mt-1 text-sm font-black">{nextModule.lessonsCount}</p>
                  <p className="text-[11px] text-muted-foreground">уроки</p>
                </div>
                <div className="rounded-2xl bg-muted/40 p-3">
                  <HelpCircle className="mx-auto h-4 w-4 text-sky-500" />
                  <p className="mt-1 text-sm font-black">{nextModule.quizCount}</p>
                  <p className="text-[11px] text-muted-foreground">тесты</p>
                </div>
                <div className="rounded-2xl bg-muted/40 p-3">
                  <Clock3 className="mx-auto h-4 w-4 text-emerald-500" />
                  <p className="mt-1 text-sm font-black">{formatMinutes(nextModule.durationMinutes)}</p>
                  <p className="text-[11px] text-muted-foreground">время</p>
                </div>
              </div>
              <Link
                href={nextModule.href}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 text-sm font-black text-slate-950 shadow-sm transition hover:bg-amber-300"
              >
                {nextModule.state === "in_progress" ? "Продолжить" : "Начать"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Все доступные модули уже завершены.</p>
          )}
        </aside>
      </div>
    </section>
  );
}
