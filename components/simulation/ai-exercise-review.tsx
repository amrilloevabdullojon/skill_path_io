"use client";

import { useState } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";

import { ExerciseType } from "@/features/ai/exercise-review";

type ExerciseReviewResult = {
  score: number;
  accuracy: number;
  completeness: number;
  logic: number;
  feedback: string[];
  nextSteps: string[];
};

type AIExerciseReviewProps = {
  moduleTitle: string;
  trackTitle: string;
};

const exerciseOptions: Array<{ label: string; value: ExerciseType }> = [
  { label: "Баг-репорт", value: "BUG_REPORT" },
  { label: "Пользовательская история", value: "USER_STORY" },
  { label: "SQL-анализ", value: "SQL_ANALYSIS" },
  { label: "Аналитическое задание", value: "ANALYTICS_TASK" },
];

export function AIExerciseReview({ moduleTitle, trackTitle }: AIExerciseReviewProps) {
  const [exerciseType, setExerciseType] = useState<ExerciseType>("BUG_REPORT");
  const [submission, setSubmission] = useState("");
  const [result, setResult] = useState<ExerciseReviewResult | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function runReview() {
    setIsLoading(true);
    setErrorText(null);

    try {
      const response = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reviewType: "EXERCISE",
          payload: {
            exerciseType,
            submission,
            context: `${trackTitle} | ${moduleTitle}`,
          },
        }),
      });

      const data = (await response.json()) as
        | { source: "quiz" | "exercise"; result: ExerciseReviewResult; error?: string }
        | { error?: string };
      if (!response.ok) {
        throw new Error("error" in data ? data.error || "Exercise review failed." : "Exercise review failed.");
      }
      setResult("result" in data ? data.result : null);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Unknown review error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md space-y-5 p-5 sm:p-7 relative isolate overflow-hidden rounded-[24px]">
      <div className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] rounded-full bg-violet-500/10 blur-[100px] pointer-events-none -z-10" />
      <header className="space-y-2">
        <p className="kicker text-violet-400">ИИ-проверка</p>
        <h3 className="text-xl font-bold text-foreground">Отправить практическую работу на ревью</h3>
        <p className="text-sm text-foreground/70">
          Вставьте ваш ответ на задание и ИИ проверит его на соответствие требованиям.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
        <select
          value={exerciseType}
          onChange={(event) => setExerciseType(event.target.value as ExerciseType)}
          className="select-base bg-card/60 backdrop-blur-sm border-border/40 focus:border-violet-500/50 focus:ring-violet-500/20"
        >
          {exerciseOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={runReview}
          disabled={isLoading || submission.trim().length < 20}
          className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-60 bg-violet-500 hover:bg-violet-400 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border-violet-400 font-semibold"
        >
          <Sparkles className="h-5 w-5" />
          {isLoading ? "Оцениваю..." : "Получить подробную оценку"}
        </button>
      </div>

      <textarea
        value={submission}
        onChange={(event) => setSubmission(event.target.value)}
        className="textarea-base min-h-[140px] bg-card/60 backdrop-blur-sm border-border/40 focus:border-violet-500/50 focus:ring-violet-500/20"
        placeholder="Вставьте вашу практическую работу сюда (отформатируйте текст для лучшего понимания)..."
      />

      {result && (
        <article className="surface-subtle border border-violet-500/30 bg-card/50 backdrop-blur-md space-y-4 p-5 rounded-2xl relative isolate overflow-hidden mt-6">
          <div className="absolute top-[-50px] left-[-50px] w-[200px] h-[200px] rounded-full bg-violet-500/10 blur-[80px] pointer-events-none -z-10" />
          <p className="text-lg font-bold text-foreground">Общая оценка: <span className="text-violet-400">{result.score}/100</span></p>
          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md p-3 text-center shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <p className="text-indigo-300 uppercase tracking-widest font-semibold mb-1">Точность</p>
              <p className="text-xl font-bold text-indigo-100">{result.accuracy}%</p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md p-3 text-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <p className="text-emerald-300 uppercase tracking-widest font-semibold mb-1">Полнота</p>
              <p className="text-xl font-bold text-emerald-100">{result.completeness}%</p>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-md p-3 text-center shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <p className="text-amber-300 uppercase tracking-widest font-semibold mb-1">Логика</p>
              <p className="text-xl font-bold text-amber-100">{result.logic}%</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border/30">
            <p className="text-sm font-semibold text-violet-300 mb-2">Обратная связь</p>
            <ul className="list-disc space-y-1.5 pl-4 text-sm text-foreground/80">
              {result.feedback.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          
          <div className="mt-4 rounded-xl border border-violet-500/30 bg-violet-500/10 backdrop-blur-md p-4 text-sm text-violet-200">
            <p className="font-semibold uppercase tracking-wide text-violet-400 mb-1">Следующие шаги</p>
            <p>{result.nextSteps.join(" ")}</p>
          </div>
        </article>
      )}

      {errorText && (
        <p className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4" />
          {errorText}
        </p>
      )}
    </section>
  );
}
