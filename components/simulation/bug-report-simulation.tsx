"use client";

import { useState } from "react";
import { AlertTriangle, Bug } from "lucide-react";

import { BugSeverity } from "@/features/simulations/bug-tracker";

type BugReviewResult = {
  qualityScore: number;
  strengths: string[];
  issues: string[];
  suggestions: string[];
};

const severityValues: BugSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function BugReportSimulation() {
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<BugSeverity>("MEDIUM");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [expectedResult, setExpectedResult] = useState("");
  const [actualResult, setActualResult] = useState("");
  const [review, setReview] = useState<BugReviewResult | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submitForReview() {
    setIsLoading(true);
    setErrorText(null);

    try {
      const response = await fetch("/api/simulation/bug-review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          severity,
          stepsToReproduce,
          expectedResult,
          actualResult,
        }),
      });
      const data = (await response.json()) as BugReviewResult & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Failed to review bug report");
      }
      setReview(data);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="surface-elevated border border-border/50 bg-card space-y-6 p-5 sm:p-7 relative isolate overflow-hidden rounded-2xl">
      <div className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none -z-10" />
      <header className="space-y-2">
        <p className="kicker">Симуляция QA</p>
        <h1 className="page-title text-foreground">Симулятор баг-трекера (Jira)</h1>
        <p className="text-sm text-foreground/70">
          Создайте баг-репорт в стиле Jira и получите автоматическую оценку качества от ИИ.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="input-base bg-card/60 backdrop-blur-sm border-border-subtle focus:border-emerald-500/50 focus:ring-emerald-500/20"
          placeholder="Краткое описание (Title)..."
        />
        <select value={severity} onChange={(event) => setSeverity(event.target.value as BugSeverity)} className="select-base bg-card/60 backdrop-blur-sm border-border-subtle focus:border-emerald-500/50 focus:ring-emerald-500/20">
          {severityValues.map((value) => (
            <option key={value} value={value}>
              Серьезность: {value}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={stepsToReproduce}
        onChange={(event) => setStepsToReproduce(event.target.value)}
        className="textarea-base min-h-[110px] bg-card/60 backdrop-blur-sm border-border-subtle focus:border-emerald-500/50 focus:ring-emerald-500/20"
        placeholder="Шаги для воспроизведения (Steps to reproduce)..."
      />
      <textarea
        value={expectedResult}
        onChange={(event) => setExpectedResult(event.target.value)}
        className="textarea-base min-h-[80px] bg-card/60 backdrop-blur-sm border-border-subtle focus:border-emerald-500/50 focus:ring-emerald-500/20"
        placeholder="Ожидаемый результат (Expected result)..."
      />
      <textarea
        value={actualResult}
        onChange={(event) => setActualResult(event.target.value)}
        className="textarea-base min-h-[80px] bg-card/60 backdrop-blur-sm border-border-subtle focus:border-emerald-500/50 focus:ring-emerald-500/20"
        placeholder="Фактический результат (Actual result)..."
      />

      <button
        type="button"
        onClick={submitForReview}
        disabled={isLoading}
        className="btn-primary gap-2 disabled:opacity-60"
      >
        <Bug className="h-5 w-5" />
        {isLoading ? "Анализирую..." : "Проверить баг-репорт с ИИ"}
      </button>

      {review && (
        <article className="surface-subtle border border-emerald-500/30 bg-card/50 backdrop-blur-md space-y-4 p-5 rounded-2xl relative isolate overflow-hidden mt-6">
          <div className="absolute top-[-50px] left-[-50px] w-[200px] h-[200px] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none -z-10" />
          <p className="text-lg font-bold text-foreground">Оценка качества: <span className="text-emerald-400">{review.qualityScore}/100</span></p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md p-4 text-xs text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <p className="font-semibold uppercase tracking-wide text-emerald-300">Сильные стороны</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-4">
                {review.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-md p-4 text-xs text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
              <p className="font-semibold uppercase tracking-wide text-rose-300">Ошибки / Замечания</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-4">
                {review.issues.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md p-4 text-xs text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <p className="font-semibold uppercase tracking-wide text-indigo-300">Рекомендации</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-4">
                {review.suggestions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
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
