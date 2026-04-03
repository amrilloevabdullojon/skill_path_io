"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Lock,
  PlayCircle,
  Timer,
  Zap,
} from "lucide-react";
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
  lessonsCount?: number;
  quizCount?: number;
  difficulty?: string;
};

type TrackModuleTreeProps = {
  nodes: TrackModuleNode[];
  accentProgress: string;
};

const STATE_CIRCLE: Record<LearningPathState, string> = {
  completed: "bg-emerald-500/20 border-emerald-400",
  in_progress: "bg-sky-500/20 border-sky-400",
  available: "bg-card border-border",
  locked: "bg-muted/20 border-border/30",
};

const STATE_CARD: Record<LearningPathState, string> = {
  completed: "bg-emerald-500/8 border-emerald-400/20 opacity-80",
  in_progress:
    "bg-sky-500/10 border border-sky-400/30 border-l-2 border-l-sky-400 ring-1 ring-sky-400/15 shadow-[0_0_24px_-8px_rgba(56,189,248,0.18)]",
  available:
    "bg-card border-border hover:border-sky-400/40 hover:bg-sky-500/5 transition-colors",
  locked: "bg-muted/8 border-border/30",
};

const STATE_LINE: Record<LearningPathState, string> = {
  completed: "bg-emerald-400/35",
  in_progress: "bg-gradient-to-b from-sky-400/50 to-border/20",
  available: "bg-border/25",
  locked: "bg-border/12",
};

function difficultyLabel(d: string): string {
  if (d === "Beginner") return "Начальный";
  if (d === "Intermediate") return "Средний";
  if (d === "Advanced") return "Продвинутый";
  return d;
}

function difficultyClass(d: string): string {
  if (d === "Beginner") return "border-emerald-400/30 bg-emerald-500/8 text-emerald-500/80";
  if (d === "Intermediate") return "border-amber-400/30 bg-amber-500/8 text-amber-500/80";
  if (d === "Advanced") return "border-rose-400/30 bg-rose-500/8 text-rose-500/80";
  return "border-border/30 bg-muted/10 text-muted-foreground/60";
}

const STATE_BADGE: Record<LearningPathState, string> = {
  completed: "border-emerald-400/30 bg-emerald-500/10 text-emerald-400",
  in_progress: "border-sky-400/40 bg-sky-500/10 text-sky-400",
  available: "border-amber-400/40 bg-amber-500/10 text-amber-400",
  locked: "border-border/30 bg-muted/15 text-muted-foreground/50",
};

function NumberCircle({
  order,
  state,
}: {
  order: number;
  state: LearningPathState;
}) {
  return (
    <div
      className={cn(
        "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
        STATE_CIRCLE[state],
        state === "locked" && "opacity-40",
      )}
    >
      {state === "completed" ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      ) : state === "locked" ? (
        <Lock className="h-4 w-4 text-muted-foreground/50" />
      ) : state === "in_progress" ? (
        <>
          <span className="text-sm font-bold text-sky-400">{order}</span>
          <span className="absolute inset-[-5px] animate-ping rounded-full bg-sky-400/20" />
        </>
      ) : (
        <span className="text-sm font-bold text-foreground/60">{order}</span>
      )}
    </div>
  );
}

function ActionButton({
  state,
  href,
}: {
  state: LearningPathState;
  href: string;
}) {
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
      ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
      : state === "in_progress"
        ? "border-sky-400/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20"
        : "border-border bg-card text-foreground hover:bg-sky-500/10 hover:border-sky-400/40 hover:text-sky-400";

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

/** Compact card for locked modules — minimal footprint */
function LockedModuleCard({ node }: { node: TrackModuleNode }) {
  return (
    <div className="rounded-xl border border-border/25 bg-muted/8 px-4 py-3 opacity-45">
      <div className="flex items-center gap-3">
        <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-muted-foreground/70">
            {node.title}
          </p>
          {node.unlockRequirement && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground/45">
              {node.unlockRequirement}
            </p>
          )}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground/35">
          {node.durationMinutes} мин
        </span>
      </div>
    </div>
  );
}

export function TrackModuleTree({
  nodes,
  accentProgress,
}: TrackModuleTreeProps) {
  return (
    <div className="relative py-2">
      {nodes.map((node, index) => {
        const isLast = index === nodes.length - 1;

        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07, duration: 0.35, ease: "easeOut" }}
            className="relative flex gap-4"
          >
            {/* Left: circle + connector */}
            <div className="flex flex-col items-center">
              <NumberCircle order={node.order} state={node.state} />
              {!isLast && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: index * 0.07 + 0.18, duration: 0.28 }}
                  className={cn(
                    "w-0.5 flex-1 origin-top",
                    STATE_LINE[node.state],
                    node.state === "in_progress" && "animate-pulse",
                  )}
                  style={{ marginTop: "2px", marginBottom: "2px", minHeight: "16px" }}
                />
              )}
            </div>

            {/* Right: card */}
            <div className="mb-3 flex-1 min-w-0">
              {node.state === "locked" ? (
                <LockedModuleCard node={node} />
              ) : (
                <motion.div whileHover={{ scale: 1.005, y: -1 }}>
                  <article
                    className={cn(
                      "rounded-xl border p-4 transition-all duration-200",
                      STATE_CARD[node.state],
                    )}
                  >
                    <ModuleCardBody node={node} accentProgress={accentProgress} />
                  </article>
                </motion.div>
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
  const isCompleted = node.state === "completed";

  return (
    <>
      {/* Header: title + state badge */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-0.5">
          <p
            className={cn(
              "text-sm font-bold leading-snug sm:text-base",
              isCompleted ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {node.title}
          </p>
          <p className="line-clamp-2 text-xs text-muted-foreground/70">
            {node.shortDescription}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
            STATE_BADGE[node.state],
          )}
        >
          {node.stateLabel}
        </span>
      </div>

      {/* Pills row */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-md border border-border/25 bg-card/40 px-2 py-0.5 text-xs text-muted-foreground">
          <Timer className="h-3 w-3" />
          {node.durationMinutes} мин
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-border/25 bg-card/40 px-2 py-0.5 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          +{node.xpReward} XP
        </span>
        {(node.lessonsCount ?? 0) > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md border border-border/25 bg-card/40 px-2 py-0.5 text-xs text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            {node.lessonsCount} {node.lessonsCount === 1 ? "урок" : "урока"}
          </span>
        )}
        {(node.quizCount ?? 0) > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md border border-border/25 bg-card/40 px-2 py-0.5 text-xs text-muted-foreground">
            <HelpCircle className="h-3 w-3" />
            {node.quizCount} {node.quizCount === 1 ? "квиз" : "квиза"}
          </span>
        )}
        {node.difficulty && (
          <span
            className={cn(
              "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium",
              difficultyClass(node.difficulty),
            )}
          >
            {difficultyLabel(node.difficulty)}
          </span>
        )}
      </div>

      {/* Progress bar (only when > 0) */}
      {node.progressPercent > 0 && (
        <div className="mt-3 space-y-1">
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted/35">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                accentProgress,
              )}
              style={{ width: `${node.progressPercent}%` }}
            />
          </div>
          <p className="text-right text-[10px] text-muted-foreground/50">
            {node.progressPercent}%
          </p>
        </div>
      )}

      {/* Action button */}
      <div className="mt-3 flex justify-end">
        <ActionButton state={node.state} href={node.href} />
      </div>
    </>
  );
}
