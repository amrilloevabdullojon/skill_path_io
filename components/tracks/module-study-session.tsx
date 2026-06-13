import Link from "next/link";
import { ArrowRight, BookOpenCheck, CheckCircle2, ClipboardCheck, FileCheck2, TimerReset } from "lucide-react";

import { cn } from "@/lib/utils";

type SessionAction = {
  id: string;
  title: string;
  description: string;
  href: string;
};

type ModuleStudySessionProps = {
  moduleTitle: string;
  durationLabel: string;
  progressPercent: number;
  overview: string;
  finalChallenge: string;
  resources: string[];
  quizHref: string | null;
  quizQuestionCount: number;
  accentText: string;
  accentSoft: string;
};

export function ModuleStudySession({
  moduleTitle,
  durationLabel,
  progressPercent,
  overview,
  finalChallenge,
  resources,
  quizHref,
  quizQuestionCount,
  accentText,
  accentSoft,
}: ModuleStudySessionProps) {
  const actions: SessionAction[] = [
    {
      id: "theory",
      title: "Понять основу",
      description: overview,
      href: "#theory",
    },
    {
      id: "practice",
      title: "Сделать руками",
      description: resources[0] ?? "Выполните короткое рабочее действие по теме модуля.",
      href: "#practice",
    },
    {
      id: "artifact",
      title: "Собрать артефакт",
      description: finalChallenge,
      href: "#artifact",
    },
  ];

  return (
    <section className={cn("surface-elevated overflow-hidden p-0", accentSoft)}>
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="kicker">Учебная сессия</p>
              <h2 className="section-heading mt-2">Пройдите модуль как один рабочий сценарий</h2>
              <p className="section-subtext mt-2">
                Цель не в том, чтобы прочитать всё подряд. Цель: понять основу, выполнить маленькое действие и сохранить результат, который можно показать.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:min-w-64">
              <div className="rounded-lg border border-border/50 bg-background/65 p-3">
                <TimerReset className={cn("h-4 w-4", accentText)} />
                <p className="mt-2 text-lg font-semibold text-foreground">{durationLabel}</p>
                <p className="text-xs text-muted-foreground">на сессию</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/65 p-3">
                <CheckCircle2 className={cn("h-4 w-4", accentText)} />
                <p className="mt-2 text-lg font-semibold text-foreground">{progressPercent}%</p>
                <p className="text-xs text-muted-foreground">готовность</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {actions.map((action, index) => (
              <a key={action.id} href={action.href} className="content-card group p-4 transition hover:border-primary/45">
                <div className="flex items-center justify-between gap-3">
                  <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg border bg-background/70 text-sm font-semibold", accentText)}>
                    {index + 1}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{action.title}</h3>
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-muted-foreground">{action.description}</p>
              </a>
            ))}
          </div>
        </div>

        <aside className="border-t border-border bg-background/50 p-5 sm:p-6 xl:border-l xl:border-t-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Сейчас лучше сделать</p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">{moduleTitle}</h3>
          <div className="mt-4 space-y-3">
            <a href="#theory" className="btn-primary inline-flex w-full justify-center gap-2">
              Начать с теории
              <BookOpenCheck className="h-4 w-4" />
            </a>
            <a href="#artifact" className="btn-secondary inline-flex w-full justify-center gap-2">
              К артефакту
              <ClipboardCheck className="h-4 w-4" />
            </a>
            {quizHref ? (
              <Link href={quizHref} className="btn-secondary inline-flex w-full justify-center gap-2">
                Quiz · {quizQuestionCount}
                <FileCheck2 className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
