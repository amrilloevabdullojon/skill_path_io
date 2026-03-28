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
    iconBg: "bg-slate-100 border-slate-200",
    iconColor: "text-slate-400",
    cardBg: "bg-slate-50 border-slate-200",
    titleColor: "text-slate-500",
    lineColor: "bg-slate-200/60",
    overlay: true,
  },
  available: {
    iconBg: "bg-white border-slate-300 shadow-sm shadow-slate-200",
    iconColor: "text-slate-500",
    cardBg: "bg-white border-slate-200 hover:border-sky-300 hover:shadow-md",
    titleColor: "text-foreground",
    lineColor: "bg-slate-200",
    overlay: false,
  },
  in_progress: {
    iconBg: "bg-sky-100 border-sky-400",
    iconColor: "text-sky-600",
    cardBg: "bg-sky-50 border-sky-200 ring-1 ring-sky-100",
    titleColor: "text-sky-700",
    lineColor: "bg-gradient-to-b from-sky-400/50 to-slate-200",
    overlay: false,
  },
  completed: {
    iconBg: "bg-emerald-100 border-emerald-400",
    iconColor: "text-emerald-600",
    cardBg: "bg-emerald-50 border-emerald-200",
    titleColor: "text-emerald-700",
    lineColor: "bg-emerald-300/50",
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
              cardBg: "border-amber-400/40 bg-amber-50",
              titleColor: "text-amber-700",
              iconBg: "bg-amber-100 border-amber-400",
              iconColor: "text-amber-600",
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
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : node.state === "locked" ? (
                  <Lock className="h-4 w-4 text-slate-400" />
                ) : node.state === "in_progress" ? (
                  <>
                    <Icon className={`h-4 w-4 ${config.iconColor}`} />
                    <span className="absolute inset-[-3px] animate-ping rounded-xl bg-sky-300/30" />
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
                ? "text-sky-600"
                : isFinalChallenge
                  ? "text-amber-500/80"
                  : "text-slate-400"
          }`}
        >
          {kindLabel(node.kind)}
        </span>

        {node.state === "in_progress" && (
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">
            В процессе
          </span>
        )}
        {node.state === "completed" && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
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
              ? "text-sky-600"
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
