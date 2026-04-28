"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock3, Lock, PlayCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { LearningPathState } from "@/lib/tracks/progression";

type OrchardModule = {
  id: string;
  order: number;
  title: string;
  shortDescription: string;
  state: LearningPathState;
  progressPercent: number;
  durationMinutes: number;
  lessonsCount: number;
  quizCount: number;
  href: string;
  unlockRequirement?: string | null;
};

type SkillOrchardProps = {
  modules: OrchardModule[];
  trackTitle: string;
  categoryLabel: string;
  progressPercent: number;
  accent: {
    progress: string;
    glow: string;
    badge: string;
  };
};

const TREE_NODE_LAYOUT = [
  { x: 22, y: 42 },
  { x: 38, y: 22 },
  { x: 62, y: 24 },
  { x: 78, y: 44 },
  { x: 51, y: 61 },
];

function ripenessLabel(percent: number, state: LearningPathState) {
  if (state === "locked") return "Почка";
  if (percent >= 100) return "Спелое";
  if (percent >= 75) return "Почти спелое";
  if (percent >= 45) return "Наливается";
  if (percent > 0) return "Завязь";
  return "Семя";
}

function fruitClass(percent: number, state: LearningPathState, isQuiz: boolean) {
  if (state === "locked") {
    return "border-border/50 bg-muted/30 text-muted-foreground shadow-none";
  }
  if (percent >= 100 && isQuiz) {
    return "border-amber-400/70 bg-amber-400 text-background shadow-[0_0_22px_rgba(251,191,36,0.35)]";
  }
  if (percent >= 100) {
    return "border-red-300/80 bg-red-500 text-white shadow-[0_0_22px_rgba(248,113,113,0.35)]";
  }
  if (percent >= 75) {
    return "border-orange-400/70 bg-orange-400 text-background shadow-[0_0_18px_rgba(251,146,60,0.24)]";
  }
  if (percent >= 45) {
    return "border-lime-400/70 bg-lime-400 text-background shadow-[0_0_16px_rgba(163,230,53,0.20)]";
  }
  if (percent > 0) {
    return "border-emerald-300/50 bg-emerald-500/70 text-white shadow-[0_0_14px_rgba(16,185,129,0.18)]";
  }
  return "border-emerald-500/35 bg-emerald-500/10 text-emerald-300";
}

function moduleFruitPercents(module: OrchardModule) {
  const fruitCount = Math.max(2, Math.min(5, module.lessonsCount + module.quizCount));
  return Array.from({ length: fruitCount }, (_, index) => {
    const threshold = ((index + 1) / fruitCount) * 100;
    if (module.progressPercent >= threshold) return 100;
    if (module.progressPercent <= (index / fruitCount) * 100) return 0;
    const localProgress = module.progressPercent - (index / fruitCount) * 100;
    return Math.round((localProgress / (100 / fruitCount)) * 100);
  });
}

function stateCopy(state: LearningPathState) {
  if (state === "completed") return "усвоено";
  if (state === "in_progress") return "растёт";
  if (state === "available") return "готово к старту";
  return "закрыто";
}

function stateClass(state: LearningPathState) {
  if (state === "completed") return "border-red-300/35 bg-red-500/10 text-red-200";
  if (state === "in_progress") return "border-emerald-500/35 bg-emerald-500/10 text-emerald-300";
  if (state === "available") return "border-emerald-300/35 bg-emerald-500/10 text-emerald-200";
  return "border-border/30 bg-muted/10 text-muted-foreground";
}

function treeFruitClass(moduleItem: OrchardModule, isNext: boolean) {
  if (moduleItem.state === "locked") {
    return "border-border/60 bg-muted/40 text-muted-foreground";
  }
  if (moduleItem.progressPercent >= 100) {
    return "border-red-400/70 bg-red-500 text-white shadow-[0_0_26px_rgba(248,113,113,0.28)]";
  }
  if (isNext) {
    return "border-emerald-300/80 bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.30)]";
  }
  if (moduleItem.progressPercent > 0) {
    return "border-orange-400/70 bg-orange-400 text-background shadow-[0_0_22px_rgba(251,146,60,0.22)]";
  }
  return "border-emerald-500/40 bg-emerald-500/12 text-emerald-300";
}

export function SkillOrchard({
  modules,
  trackTitle,
  categoryLabel,
  progressPercent,
  accent,
}: SkillOrchardProps) {
  const nextModule = modules.find((moduleItem) => moduleItem.state === "in_progress" || moduleItem.state === "available");
  const ripeModules = modules.filter((moduleItem) => moduleItem.progressPercent >= 100).length;
  const activeModules = modules.filter((moduleItem) => moduleItem.state !== "locked").length;

  return (
    <section className="surface-elevated relative isolate overflow-hidden border border-border/60 bg-card/60 p-5 backdrop-blur-md sm:p-6">
      <div className={cn("pointer-events-none absolute left-[-160px] top-[-160px] h-[360px] w-[360px] rounded-full blur-[120px] opacity-[0.08] -z-10", accent.glow)} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-emerald-950/12 to-transparent -z-10" />

      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide", accent.badge)}>
              Древо жизни
            </span>
            <span className="rounded-full border border-border/50 bg-card/50 px-2.5 py-1 text-xs text-muted-foreground">
              {categoryLabel} • {activeModules}/{modules.length} живых ветвей
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {trackTitle}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Корни дают базу, ствол ведёт через рабочие ситуации, ветви раскрывают решения, а плодом становится готовый артефакт.
          </p>
        </div>

        <div className="w-full max-w-[260px] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Жизненная сила</span>
            <span className="font-semibold tabular-nums text-foreground">{progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted/40">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className={cn("h-full rounded-full", accent.progress)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {ripeModules} зрелых ветвей
          </p>
        </div>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-[28px] border border-emerald-500/20 bg-background/35 px-4 py-5 sm:px-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-center">
          <div className="relative min-h-[360px] sm:min-h-[420px]">
            <svg
              viewBox="0 0 900 520"
              role="img"
              aria-label="Визуальная карта древа жизни"
              className="absolute inset-0 h-full w-full text-emerald-500/50"
              preserveAspectRatio="xMidYMid meet"
            >
              <path d="M450 446 C448 392 438 328 452 268 C462 224 462 176 450 122" fill="none" stroke="currentColor" strokeWidth="28" strokeLinecap="round" />
              <path d="M450 256 C358 222 284 190 198 118" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" />
              <path d="M455 224 C514 166 568 120 668 88" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" />
              <path d="M456 302 C558 286 656 272 758 218" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
              <path d="M448 350 C390 384 330 412 244 420" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
              <path d="M449 445 C396 462 342 482 292 504" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              <path d="M454 446 C512 462 572 480 624 504" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              <path d="M450 448 C452 474 450 494 450 512" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              <path d="M164 126 C245 42 384 24 486 62 C558 10 704 30 775 118 C844 203 814 322 724 366 C704 456 596 500 496 466 C420 516 280 486 240 392 C132 360 94 222 164 126Z" fill="currentColor" className="opacity-[0.08]" />
              <path d="M158 390 C252 448 352 474 456 472 C562 470 664 440 746 384" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 14" className="opacity-50" />
            </svg>

            {modules.slice(0, TREE_NODE_LAYOUT.length).map((moduleItem, index) => {
              const position = TREE_NODE_LAYOUT[index];
              const isLocked = moduleItem.state === "locked";
              const isNext = nextModule?.id === moduleItem.id;

              const fruit = (
                <motion.div
                  initial={{ opacity: 0, scale: 0.72, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  whileHover={!isLocked ? { scale: 1.08, y: -4 } : undefined}
                  transition={{ delay: index * 0.08, duration: 0.36, ease: "easeOut" }}
                  className={cn(
                    "group absolute flex h-[82px] w-[82px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 text-center transition-all sm:h-[96px] sm:w-[96px]",
                    treeFruitClass(moduleItem, isNext),
                    isNext && "ring-4 ring-emerald-500/15",
                  )}
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Ветвь</span>
                  <span className="text-lg font-bold tabular-nums sm:text-xl">{moduleItem.order}</span>
                  <span className="mt-0.5 text-[10px] font-semibold tabular-nums opacity-80">{moduleItem.progressPercent}%</span>
                  {moduleItem.progressPercent >= 100 ? (
                    <span className="absolute -right-1 top-2 h-3 w-5 rotate-[-25deg] rounded-full bg-emerald-300/85" />
                  ) : null}
                </motion.div>
              );

              if (isLocked) {
                return (
                  <div key={moduleItem.id} title={moduleItem.unlockRequirement ?? moduleItem.title}>
                    {fruit}
                  </div>
                );
              }

              return (
                <Link key={moduleItem.id} href={moduleItem.href} title={moduleItem.title}>
                  {fruit}
                </Link>
              );
            })}

            <div className="pointer-events-none absolute bottom-2 left-1/2 w-[min(460px,82%)] -translate-x-1/2 border-t border-emerald-500/25 pt-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">корневая система</p>
              <p className="mt-1 text-xs text-muted-foreground">понятия, практика, проверка, итоговый артефакт</p>
            </div>
          </div>

          <div className="space-y-4 xl:border-l xl:border-border/50 xl:pl-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Сейчас растёт</p>
              <p className="mt-2 text-lg font-semibold leading-snug text-foreground">
                {nextModule?.title ?? "Все ветви созрели"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {nextModule?.shortDescription ?? "Древо уже собрало все доступные плоды трека."}
              </p>
            </div>
            {nextModule ? (
              <Link href={nextModule.href} className="btn-primary inline-flex w-full items-center justify-center gap-2">
                Растить ветвь
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border/40 py-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> корни: открыто</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-400" /> ветвь: закрепляется</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> плод: усвоено</span>
        <span className="inline-flex items-center gap-1.5"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-background">Q</span> кольцо проверки</span>
      </div>

      <div className="mt-5 grid gap-4">
        {modules.map((moduleItem, index) => {
          const fruits = moduleFruitPercents(moduleItem);
          const isLocked = moduleItem.state === "locked";
          const isNext = nextModule?.id === moduleItem.id;

          return (
            <motion.article
              key={moduleItem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-4 transition-all sm:p-5",
                isLocked
                  ? "border-border/40 bg-muted/20 opacity-75"
                  : "border-emerald-500/20 bg-background/30 hover:border-emerald-500/40 hover:bg-card/70",
                isNext && "ring-1 ring-emerald-300/25",
              )}
            >
              {isNext && <div className="absolute inset-y-0 left-0 w-1 bg-emerald-400" />}

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Живая ветвь {moduleItem.order}
                    </span>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", stateClass(moduleItem.state))}>
                      {stateCopy(moduleItem.state)}
                    </span>
                    {isNext && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                        <PlayCircle className="h-3 w-3" />
                        растить сейчас
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-semibold leading-snug text-foreground">
                      {moduleItem.title}
                    </h3>
                    <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {moduleItem.shortDescription}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" />
                      {moduleItem.durationMinutes} мин
                    </span>
                    <span>{moduleItem.lessonsCount} корня</span>
                    <span>{moduleItem.quizCount} проверка</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {fruits.map((fruitPercent, fruitIndex) => {
                      const isQuiz = fruitIndex === fruits.length - 1 && moduleItem.quizCount > 0;

                      return (
                        <motion.span
                          key={`${moduleItem.id}-${fruitIndex}`}
                          initial={{ scale: 0.75, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.05 + fruitIndex * 0.04 + 0.1, duration: 0.22 }}
                          title={`${isQuiz ? "Кольцо проверки" : "Корень"}: ${ripenessLabel(fruitPercent, moduleItem.state)}`}
                          className={cn(
                            "relative flex h-10 w-10 items-center justify-center rounded-full border text-[10px] font-bold transition-transform group-hover:-translate-y-0.5",
                            fruitClass(fruitPercent, moduleItem.state, isQuiz),
                            fruitPercent >= 100 && "after:absolute after:-right-0.5 after:-top-1 after:h-2 after:w-3 after:rotate-[-25deg] after:rounded-full after:bg-emerald-300/80",
                          )}
                        >
                          {isLocked ? <Lock className="h-3.5 w-3.5" /> : isQuiz ? "Q" : fruitIndex + 1}
                        </motion.span>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted/30">
                        <div
                          className={cn("h-full rounded-full", moduleItem.progressPercent >= 100 ? "bg-red-400" : accent.progress)}
                          style={{ width: `${moduleItem.progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-9 text-right text-xs font-semibold tabular-nums text-muted-foreground">
                      {moduleItem.progressPercent}%
                    </span>
                  </div>

                  {isLocked ? (
                    <span className="inline-flex text-xs text-muted-foreground/70">
                      {moduleItem.unlockRequirement ?? "Закрыто"}
                    </span>
                  ) : (
                    <Link href={moduleItem.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300 transition-colors hover:text-foreground">
                      {moduleItem.state === "completed" ? "Повторить" : "Растить ветвь"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {!nextModule && (
        <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-200">
            <CheckCircle2 className="h-4 w-4" />
            Древо созрело
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Все доступные ветви дали результат.</p>
        </div>
      )}
    </section>
  );
}
