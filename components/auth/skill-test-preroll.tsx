"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

import { useBrowserStorageItem } from "@/hooks/use-browser-storage";

const STORAGE_KEY = "levio:skill-test:result";

type SkillTestResult = {
  goalKey: "qa" | "ba" | "da" | "explore" | null;
  scorePercent: number;
  level: "exploring" | "novice" | "growing" | "ready";
  takenAt: string;
};

const goalLabels: Record<NonNullable<SkillTestResult["goalKey"]>, string> = {
  qa: "QA Engineer",
  ba: "Business Analyst",
  da: "Data Analyst",
  explore: "Изучение",
};

const levelLabels: Record<SkillTestResult["level"], string> = {
  exploring: "Знакомство",
  novice: "Старт с фундамента",
  growing: "На полпути",
  ready: "Готов к практике",
};

export function SkillTestPreroll() {
  const rawResult = useBrowserStorageItem("session", STORAGE_KEY);
  const [dismissed, setDismissed] = useState(false);

  const result = useMemo(() => {
    if (!rawResult) return null;
    try {
      const parsed = JSON.parse(rawResult) as SkillTestResult;
      if (parsed && typeof parsed.scorePercent === "number" && parsed.goalKey) {
        return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  }, [rawResult]);

  if (!result || dismissed || !result.goalKey) {
    return null;
  }

  const goalLabel = goalLabels[result.goalKey] ?? "Аудит навыков";
  const showScore = result.goalKey !== "explore";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/8 px-4 py-3"
      role="status"
    >
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
          Аудит готов
        </span>
        <span className="text-foreground">
          Цель: <strong>{goalLabel}</strong>
          {showScore ? (
            <>
              {" · "}
              Результат: <strong>{result.scorePercent}%</strong>
              {" · "}
              <span className="text-muted-foreground">{levelLabels[result.level]}</span>
            </>
          ) : null}
        </span>
        <span className="text-xs text-muted-foreground">
          Перенесём в новый аккаунт автоматически после регистрации.
        </span>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Скрыть"
        className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </motion.div>
  );
}
