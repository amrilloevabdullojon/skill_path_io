"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Zap,
  HelpCircle,
  Activity,
  Flag,
  Lock,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";

type LearningPathState = "locked" | "available" | "in_progress" | "completed";

type TimelineNode = {
  id: string;
  title: string;
  description: string;
  kind: "lesson" | "mini_challenge" | "quiz" | "simulation" | "final_challenge";
  state: LearningPathState;
  href?: string;
};

const KIND_ICON = {
  lesson: BookOpen,
  mini_challenge: Zap,
  quiz: HelpCircle,
  simulation: Activity,
  final_challenge: Flag,
};

const STATE_CONFIG = {
  locked: {
    iconBg: "bg-muted/10 border-border/40 backdrop-blur-sm",
    iconColor: "text-muted-foreground/50",
    cardBg: "bg-muted/10 border-border/30 opacity-60 backdrop-blur-sm",
    titleColor: "text-muted-foreground/60",
    lineColor: "bg-border/25",
    overlay: true,
  },
  available: {
    iconBg: "bg-card/40 border-border/50 backdrop-blur-md shadow-sm",
    iconColor: "text-muted-foreground",
    cardBg: "bg-card/40 backdrop-blur-md border border-border/50 hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:shadow-[0_4px_20px_-8px_rgba(99,102,241,0.2)] transition-all",
    titleColor: "text-foreground",
    lineColor: "bg-border/40",
    overlay: false,
  },
  in_progress: {
    iconBg: "bg-indigo-500/15 border border-indigo-400/50 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.3)]",
    iconColor: "text-indigo-400",
    cardBg: "bg-indigo-500/15 border border-indigo-400/30 border-l-2 border-l-indigo-400 ring-1 ring-indigo-400/25 shadow-[0_0_24px_-4px_rgba(99,102,241,0.25)] backdrop-blur-md",
    titleColor: "text-indigo-400 font-bold",
    lineColor: "bg-gradient-to-b from-indigo-400/60 to-border/30",
    overlay: false,
  },
  completed: {
    iconBg: "bg-emerald-500/15 border border-emerald-400/40 backdrop-blur-md",
    iconColor: "text-emerald-500",
    cardBg: "bg-emerald-500/10 border border-emerald-400/30 opacity-90 backdrop-blur-md",
    titleColor: "text-emerald-500",
    lineColor: "bg-emerald-400/50",
    overlay: false,
  },
};

function kindLabel(kind: TimelineNode["kind"]): string {
  if (kind === "lesson") return "Урок";
  if (kind === "mini_challenge") return "Мини-задание";
  if (kind === "quiz") return "Тест";
  if (kind === "simulation") return "Симуляция";
  return "Финальное задание";
}

export function LearningFlowTree({ nodes }: { nodes: TimelineNode[] }) {
  return (
    <div className="relative py-2">
      {nodes.map((node, index) => {
        const baseConfig = STATE_CONFIG[node.state];
        const Icon = KIND_ICON[node.kind];
        const isLast = index === nodes.length - 1;

        const isClickable = Boolean(node.href) && node.state !== "locked";

        // Golden overrides for final_challenge when not locked
        const isFinalChallenge =
          node.kind === "final_challenge" && node.state !== "locked";

        const config = isFinalChallenge
          ? {
              ...baseConfig,
              cardBg: "border border-amber-400/40 bg-amber-500/10 backdrop-blur-md",
              titleColor: "text-amber-500",
              iconBg: "bg-amber-500/15 border border-amber-400/60 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]",
              iconColor: "text-amber-500",
            }
          : baseConfig;

        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: index * 0.07,
              duration: 0.4,
              ease: "easeOut",
            }}
            className="relative flex gap-4"
          >
            {/* Icon column + connector line */}
            <div className="flex flex-col items-center">
              {/* Node icon circle */}
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 ${config.iconBg} transition-all duration-300`}
              >
                {node.state === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : node.state === "locked" ? (
                  <Lock className="h-4 w-4 text-muted-foreground/50" />
                ) : node.state === "in_progress" ? (
                  <>
                    <Icon className={`h-4 w-4 ${config.iconColor}`} />
                    <span className="absolute inset-[-3px] animate-ping rounded-xl bg-indigo-300/30" />
                  </>
                ) : (
                  <Icon
                    className={`h-4 w-4 ${isFinalChallenge ? "text-amber-600" : config.iconColor}`}
                  />
                )}
              </div>

              {/* Connector line between nodes */}
              {!isLast && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: index * 0.07 + 0.2, duration: 0.3 }}
                  className={`w-0.5 flex-1 origin-top ${config.lineColor} min-h-[24px] ${
                    node.state === "in_progress" ? "animate-pulse" : ""
                  }`}
                  style={{ marginTop: "2px", marginBottom: "2px" }}
                />
              )}
            </div>

            {/* Node card */}
            <div className="mb-3 flex-1">
              {isClickable ? (
                <motion.div whileHover={{ scale: 1.015, y: -1 }}>
                  <Link
                    href={node.href!}
                    className={`block rounded-xl border px-4 py-3 transition-all duration-200 ${config.cardBg} cursor-pointer`}
                  >
                    <NodeCardContent node={node} config={config} isFinalChallenge={isFinalChallenge} />
                  </Link>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.005 }}>
                  <div
                    className={`block rounded-xl border px-4 py-3 transition-all duration-200 ${config.cardBg} cursor-default`}
                  >
                    <NodeCardContent node={node} config={config} isFinalChallenge={isFinalChallenge} />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

type NodeConfig = {
  iconBg: string;
  iconColor: string;
  cardBg: string;
  titleColor: string;
  lineColor: string;
  overlay: boolean;
};

function NodeCardContent({
  node,
  config,
  isFinalChallenge,
}: {
  node: TimelineNode;
  config: NodeConfig;
  isFinalChallenge: boolean;
}) {
  return (
    <>
      {/* Kind label + state badge */}
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className={`text-[10px] font-semibold uppercase tracking-widest ${
            node.state === "completed"
              ? "text-emerald-600"
              : node.state === "in_progress"
                ? "text-indigo-600"
                : isFinalChallenge
                  ? "text-amber-500/80"
                  : "text-slate-400"
          }`}
        >
          {kindLabel(node.kind)}
        </span>

        {node.state === "in_progress" && (
          <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-300">
            В процессе
          </span>
        )}
        {node.state === "completed" && (
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-300">
            ✓ Выполнено
          </span>
        )}
      </div>

      {/* Title */}
      <p className={`text-[14px] font-semibold leading-snug ${config.titleColor}`}>
        {node.title}
      </p>

      {/* Description */}
      {node.description && (
        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground/70">
          {node.description}
        </p>
      )}

      {/* CTA for available / in_progress */}
      {node.href && (node.state === "available" || node.state === "in_progress") && (
        <div
          className={`mt-2.5 flex items-center gap-1 text-[12px] font-medium ${
            node.state === "in_progress"
              ? "text-indigo-600"
              : isFinalChallenge
                ? "text-amber-600"
                : "text-slate-500"
          }`}
        >
          <PlayCircle className="h-3.5 w-3.5" />
          {node.state === "in_progress" ? "Продолжить" : "Начать"}
        </div>
      )}
    </>
  );
}
