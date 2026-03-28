"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Lock, PlayCircle, Clock3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type LearningPathState = "locked" | "available" | "in_progress" | "completed";

type TrackModuleNode = {
  id: string;
  order: number;
  title: string;
  shortDescription: string;
  state: LearningPathState;
  stateLabel: string;
  progressPercent: number;
  durationMinutes: number;
  xpReward: number;
  href: string;
  unlockRequirement?: string | null;
};

type TrackModuleTreeProps = {
  nodes: TrackModuleNode[];
  accentProgress: string; // Tailwind class e.g. "bg-emerald-400"
};

const STATE_CIRCLE: Record<LearningPathState, string> = {
  completed: "bg-emerald-100 border-emerald-400",
  in_progress: "bg-sky-100 border-sky-400",
  available: "bg-white border-slate-300 shadow-sm",
  locked: "bg-slate-100 border-slate-200",
};

const STATE_CARD: Record<LearningPathState, string> = {
  completed: "bg-emerald-50 border-emerald-200",
  in_progress: "bg-sky-50 border-sky-200 ring-1 ring-sky-100",
  available: "bg-white border-slate-200 hover:border-sky-300 hover:shadow-md",
  locked: "bg-slate-50 border-slate-200 opacity-70",
};

const STATE_LINE: Record<LearningPathState, string> = {
  completed: "bg-emerald-300/60",
  in_progress: "bg-gradient-to-b from-sky-400/60 to-slate-200",
  available: "bg-slate-200",
  locked: "bg-slate-200/60",
};

const STATE_BADGE: Record<LearningPathState, string> = {
  completed: "border-emerald-400/50 bg-emerald-100 text-emerald-700",
  in_progress: "border-sky-400/50 bg-sky-100 text-sky-700",
  available: "border-amber-400/50 bg-amber-100 text-amber-700",
  locked: "border-slate-200 bg-slate-100 text-slate-500",
};

function NumberCircle({ order, state }: { order: number; state: LearningPathState }) {
  return (
    <div
      className={cn(
        "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
        STATE_CIRCLE[state],
      )}
    >
      {state === "completed" ? (
        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
      ) : state === "locked" ? (
        <Lock className="h-5 w-5 text-slate-400" />
      ) : state === "in_progress" ? (
        <>
          <span className="text-base font-bold text-sky-600">{order}</span>
          <span className="absolute inset-[-4px] animate-ping rounded-full bg-sky-300/30" />
        </>
      ) : (
        <span className="text-base font-bold text-slate-600">{order}</span>
      )}
    </div>
  );
}

function ActionButton({ state, href }: { state: LearningPathState; href: string }) {
  if (state === "locked") {
    return (
      <button
        disabled
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-400 cursor-not-allowed"
      >
        <Lock className="h-3.5 w-3.5" />
        Заблокировано
      </button>
    );
  }

  const label =
    state === "completed"
      ? "Повторить"
      : state === "in_progress"
        ? "Продолжить"
        : "Начать";

  const Icon =
    state === "completed"
      ? CheckCircle2
      : state === "in_progress"
        ? ArrowRight
        : PlayCircle;

  const btnClass =
    state === "completed"
      ? "border-emerald-400/50 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
      : state === "in_progress"
        ? "border-sky-400/50 bg-sky-50 text-sky-600 hover:bg-sky-100"
        : "border-slate-300 bg-white text-slate-600 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200",
        btnClass,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}

export function TrackModuleTree({ nodes, accentProgress }: TrackModuleTreeProps) {
  return (
    <div className="relative py-2">
      {nodes.map((node, index) => {
        const isLast = index === nodes.length - 1;
        const isClickable = node.state !== "locked";

        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: index * 0.08,
              duration: 0.4,
              ease: "easeOut",
            }}
            className="relative flex gap-4"
          >
            {/* Left column: number circle + connector line */}
            <div className="flex flex-col items-center">
              <NumberCircle order={node.order} state={node.state} />

              {!isLast && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: index * 0.08 + 0.2, duration: 0.3 }}
                  className={cn(
                    "w-0.5 flex-1 origin-top min-h-[28px]",
                    STATE_LINE[node.state],
                    node.state === "in_progress" && "animate-pulse",
                  )}
                  style={{ marginTop: "2px", marginBottom: "2px" }}
                />
              )}
            </div>

            {/* Right card */}
            <div className="mb-4 flex-1">
              {isClickable ? (
                <motion.div whileHover={{ scale: 1.01, y: -1 }}>
                  <article
                    className={cn(
                      "rounded-xl border p-4 transition-all duration-200",
                      STATE_CARD[node.state],
                    )}
                  >
                    <ModuleCardBody node={node} accentProgress={accentProgress} />
                  </article>
                </motion.div>
              ) : (
                <article
                  className={cn(
                    "rounded-xl border p-4 transition-all duration-200",
                    STATE_CARD[node.state],
                  )}
                >
                  <ModuleCardBody node={node} accentProgress={accentProgress} />
                </article>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function ModuleCardBody({
  node,
  accentProgress,
}: {
  node: TrackModuleNode;
  accentProgress: string;
}) {
  return (
    <>
      {/* Header row: title + state badge */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-base font-bold text-foreground sm:text-lg leading-snug">
            {node.title}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2">{node.shortDescription}</p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold",
            STATE_BADGE[node.state],
          )}
        >
          {node.stateLabel}
        </span>
      </div>

      {/* Pills row: duration + XP */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-card/50 px-2 py-1 text-xs text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5" />
          {node.durationMinutes} мин
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-card/50 px-2 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          +{node.xpReward} XP
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn("h-full rounded-full transition-all duration-500", accentProgress)}
          style={{ width: `${node.progressPercent}%` }}
        />
      </div>

      {/* Unlock requirement notice */}
      {node.unlockRequirement ? (
        <p className="mt-2 text-xs text-amber-300/80">{node.unlockRequirement}</p>
      ) : null}

      {/* Action button */}
      <div className="mt-3 flex justify-end">
        <ActionButton state={node.state} href={node.href} />
      </div>
    </>
  );
}
