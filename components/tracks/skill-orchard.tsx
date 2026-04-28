"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Lock, PlayCircle, Sparkles } from "lucide-react";

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
    return "border-slate-600/40 bg-slate-700/30 text-slate-400 shadow-none";
  }
  if (percent >= 100 && isQuiz) {
    return "border-amber-300/70 bg-amber-300 text-slate-950 shadow-[0_0_22px_rgba(251,191,36,0.45)]";
  }
  if (percent >= 100) {
    return "border-red-300/80 bg-red-500 text-white shadow-[0_0_22px_rgba(248,113,113,0.35)]";
  }
  if (percent >= 75) {
    return "border-orange-300/70 bg-orange-400 text-slate-950 shadow-[0_0_18px_rgba(251,146,60,0.28)]";
  }
  if (percent >= 45) {
    return "border-lime-300/70 bg-lime-400 text-slate-950 shadow-[0_0_16px_rgba(163,230,53,0.22)]";
  }
  if (percent > 0) {
    return "border-emerald-300/50 bg-emerald-500/70 text-white shadow-[0_0_14px_rgba(16,185,129,0.18)]";
  }
  return "border-emerald-500/30 bg-emerald-950 text-emerald-200";
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
    <section className="surface-elevated relative isolate overflow-hidden border border-border/50 bg-card/40 p-5 backdrop-blur-md sm:p-6">
      <div className={cn("pointer-events-none absolute left-[-140px] top-[-120px] h-[360px] w-[360px] rounded-full blur-[110px] opacity-[0.10] -z-10", accent.glow)} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-emerald-950/18 to-transparent -z-10" />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide", accent.badge)}>
              Skill Orchard
            </span>
            <span className="rounded-full border border-border/50 bg-card/50 px-2.5 py-1 text-xs text-muted-foreground">
              {categoryLabel} • {activeModules}/{modules.length} ветвей открыто
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            Дерево навыков: {trackTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Яблоки созревают по мере усвоения: чтение даёт рост, практика усиливает цвет, а квиз превращает плод в спелый результат.
          </p>
        </div>

        <div className="min-w-[150px] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Спелость сада</span>
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

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_260px]">
        <div className="relative min-h-[430px] overflow-hidden rounded-2xl border border-emerald-500/15 bg-slate-950/35 px-4 py-6 sm:px-6">
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 900 460" preserveAspectRatio="none" aria-hidden="true">
            <path d="M450 430 C445 335 455 250 450 150" stroke="rgba(120,113,108,0.65)" strokeWidth="18" strokeLinecap="round" fill="none" />
            <path d="M450 330 C315 290 220 230 115 120" stroke="rgba(34,197,94,0.28)" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M450 290 C585 255 690 190 800 90" stroke="rgba(34,197,94,0.28)" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M450 230 C330 210 245 175 155 245" stroke="rgba(34,197,94,0.20)" strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M450 205 C575 205 665 245 770 315" stroke="rgba(34,197,94,0.20)" strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M450 160 C390 125 340 95 285 55" stroke="rgba(34,197,94,0.16)" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M450 150 C515 115 575 82 650 50" stroke="rgba(34,197,94,0.16)" strokeWidth="6" strokeLinecap="round" fill="none" />
          </svg>

          <div className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {modules.map((moduleItem, index) => {
              const fruits = moduleFruitPercents(moduleItem);
              const isLocked = moduleItem.state === "locked";
              return (
                <motion.div
                  key={moduleItem.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.35 }}
                  className={cn(
                    "group relative min-h-[168px] rounded-2xl border p-4 transition-all",
                    isLocked
                      ? "border-border/25 bg-slate-900/35 opacity-70"
                      : "border-emerald-400/20 bg-slate-900/55 hover:border-emerald-300/45 hover:bg-slate-900/75",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Ветвь {moduleItem.order}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                        {moduleItem.title}
                      </h3>
                    </div>
                    <span className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                      moduleItem.state === "completed" && "border-red-300/40 bg-red-500/10 text-red-200",
                      moduleItem.state === "in_progress" && "border-lime-300/40 bg-lime-500/10 text-lime-200",
                      moduleItem.state === "available" && "border-emerald-300/40 bg-emerald-500/10 text-emerald-200",
                      moduleItem.state === "locked" && "border-border/30 bg-muted/10 text-muted-foreground",
                    )}>
                      {stateCopy(moduleItem.state)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {fruits.map((fruitPercent, fruitIndex) => {
                      const isQuiz = fruitIndex === fruits.length - 1 && moduleItem.quizCount > 0;
                      return (
                        <motion.span
                          key={`${moduleItem.id}-${fruitIndex}`}
                          initial={{ scale: 0.75, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.06 + fruitIndex * 0.05 + 0.12, duration: 0.25 }}
                          title={`${isQuiz ? "Квиз" : "Урок"}: ${ripenessLabel(fruitPercent, moduleItem.state)}`}
                          className={cn(
                            "relative flex h-9 w-9 items-center justify-center rounded-full border text-[10px] font-bold transition-transform group-hover:-translate-y-0.5",
                            fruitClass(fruitPercent, moduleItem.state, isQuiz),
                            fruitPercent >= 100 && "after:absolute after:-right-0.5 after:-top-1 after:h-2 after:w-3 after:rotate-[-25deg] after:rounded-full after:bg-emerald-300/80",
                          )}
                        >
                          {isLocked ? <Lock className="h-3.5 w-3.5" /> : isQuiz ? "Q" : fruitIndex + 1}
                        </motion.span>
                      );
                    })}
                  </div>

                  <p className="mt-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {moduleItem.shortDescription}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted/30">
                        <div
                          className={cn("h-full rounded-full", moduleItem.progressPercent >= 100 ? "bg-red-400" : accent.progress)}
                          style={{ width: `${moduleItem.progressPercent}%` }}
                        />
                      </div>
                    </div>
                    {isLocked ? (
                      <span className="text-[11px] text-muted-foreground/60">
                        {moduleItem.unlockRequirement ?? "Закрыто"}
                      </span>
                    ) : (
                      <Link href={moduleItem.href} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-300 transition-colors hover:text-emerald-100">
                        {moduleItem.state === "completed" ? "Повторить" : "Открыть"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-3 rounded-2xl border border-border/50 bg-card/35 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <p className="text-sm font-semibold text-foreground">Как читать сад</p>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p><span className="text-emerald-300">Зелёное</span> — тема открыта или начата.</p>
            <p><span className="text-orange-300">Оранжевое</span> — практика почти закреплена.</p>
            <p><span className="text-red-300">Красное</span> — тема усвоена.</p>
            <p><span className="text-amber-300">Золотое Q</span> — квиз закрыт уверенно.</p>
          </div>

          {nextModule ? (
            <Link
              href={nextModule.href}
              className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3 transition-colors hover:bg-emerald-500/15"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
                {nextModule.state === "in_progress" ? <PlayCircle className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] uppercase tracking-wider text-emerald-300/80">Следующее яблоко</span>
                <span className="mt-0.5 line-clamp-2 block text-sm font-semibold text-foreground">{nextModule.title}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-emerald-200" />
            </Link>
          ) : (
            <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-500/10 p-3">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-200">
                <CheckCircle2 className="h-4 w-4" />
                Сад созрел
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Все доступные ветви закрыты.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
