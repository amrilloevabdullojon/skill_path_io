import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDot, FileCheck2, HelpCircle, Lock, Route, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type ModuleStepState = "locked" | "available" | "in_progress" | "completed";

type ModuleStep = {
  id: string;
  title: string;
  description: string;
  state: ModuleStepState;
  href: string;
  metric: string;
};

type ModuleProgressChecklistProps = {
  moduleTitle: string;
  progressPercent: number;
  steps: readonly ModuleStep[];
  primaryHref: string;
  primaryLabel: string;
};

const stateView: Record<ModuleStepState, { label: string; icon: typeof CircleDot; className: string; rail: string }> = {
  locked: {
    label: "Закрыто",
    icon: Lock,
    className: "border-border/50 bg-muted/20 text-muted-foreground",
    rail: "bg-muted",
  },
  available: {
    label: "Доступно",
    icon: CircleDot,
    className: "border-amber-400/35 bg-amber-400/10 text-amber-700 dark:text-amber-300",
    rail: "bg-amber-400",
  },
  in_progress: {
    label: "В работе",
    icon: Route,
    className: "border-sky-400/35 bg-sky-400/10 text-sky-700 dark:text-sky-300",
    rail: "bg-sky-400",
  },
  completed: {
    label: "Готово",
    icon: CheckCircle2,
    className: "border-emerald-400/35 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300",
    rail: "bg-emerald-400",
  },
};

function stepIcon(step: ModuleStep) {
  if (step.id === "lessons") return Sparkles;
  if (step.id === "practice") return HelpCircle;
  if (step.id === "quiz") return CircleDot;
  return FileCheck2;
}

export function ModuleProgressChecklist({
  moduleTitle,
  progressPercent,
  steps,
  primaryHref,
  primaryLabel,
}: ModuleProgressChecklistProps) {
  const completedCount = steps.filter((step) => step.state === "completed").length;
  const nextStep =
    steps.find((step) => step.state === "in_progress") ??
    steps.find((step) => step.state === "available") ??
    steps[steps.length - 1] ??
    null;

  return (
    <section className="overflow-hidden rounded-4xl border border-border bg-background/80 shadow-sm backdrop-blur">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                <Route className="h-3.5 w-3.5" />
                План прохождения
              </p>
              <h3 className="mt-3 break-words text-2xl font-black tracking-tight text-foreground">{moduleTitle}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Проходите модуль как цепочку действий: уроки, практика, тест, артефакт и завершение. Здесь видно, что уже сделано и куда идти дальше.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:min-w-72">
              <div className="rounded-2xl border border-border/50 bg-card/65 p-3">
                <p className="text-2xl font-black text-foreground">{completedCount}/{steps.length}</p>
                <p className="text-xs text-muted-foreground">этапов готово</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card/65 p-3">
                <p className="text-2xl font-black text-foreground">{progressPercent}%</p>
                <p className="text-xs text-muted-foreground">прогресс модуля</p>
              </div>
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${Math.max(progressPercent, 8)}%` }} />
          </div>

          <div className="mt-5 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {steps.map((step, index) => {
              const view = stateView[step.state];
              const Icon = stepIcon(step);
              const StateIcon = view.icon;
              const locked = step.state === "locked";
              const card = (
                <article
                  className={cn(
                    "relative h-full rounded-3xl border bg-card/70 p-4 transition",
                    !locked && "hover:-translate-y-0.5 hover:border-amber-400/60 hover:shadow-md",
                    step.state === "in_progress" && "ring-2 ring-sky-400/15",
                    locked && "opacity-60",
                  )}
                >
                  <div className={cn("absolute left-4 top-0 h-1 w-10 rounded-b-full", view.rail)} />
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/50 text-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold", view.className)}>
                      <StateIcon className="h-3.5 w-3.5" />
                      {view.label}
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">Шаг {index + 1}</p>
                  <h3 className="mt-1 line-clamp-2 text-base font-black text-foreground">{step.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{step.description}</p>
                  <p className="mt-4 rounded-2xl bg-background/60 px-3 py-2 text-xs font-semibold text-muted-foreground">{step.metric}</p>
                </article>
              );

              return locked ? (
                <div key={step.id}>{card}</div>
              ) : step.href.startsWith("#") ? (
                <a key={step.id} href={step.href}>
                  {card}
                </a>
              ) : (
                <Link key={step.id} href={step.href}>
                  {card}
                </Link>
              );
            })}
          </div>
        </div>

        <aside className="border-t border-border bg-card/65 p-4 sm:p-5 xl:border-l xl:border-t-0">
          <p className="text-xs font-bold uppercase tracking-kicker text-muted-foreground">Сейчас</p>
          <h3 className="mt-2 break-words text-xl font-black text-foreground">{nextStep?.title ?? "Модуль завершён"}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {nextStep?.description ?? "Можно переходить к следующему модулю или повторить сложные места."}
          </p>
          {nextStep ? (
            nextStep.href.startsWith("#") ? (
              <a href={nextStep.href} className="btn-primary mt-5 inline-flex w-full items-center justify-center gap-2">
                К текущему этапу
                <ArrowRight className="h-4 w-4" />
              </a>
            ) : (
              <Link href={nextStep.href} className="btn-primary mt-5 inline-flex w-full items-center justify-center gap-2">
                К текущему этапу
                <ArrowRight className="h-4 w-4" />
              </Link>
            )
          ) : (
            <Link href={primaryHref} className="btn-primary mt-5 inline-flex w-full items-center justify-center gap-2">
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </aside>
      </div>
    </section>
  );
}
