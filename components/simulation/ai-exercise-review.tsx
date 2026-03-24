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
  { label: "Bug report", value: "BUG_REPORT" },
  { label: "User story", value: "USER_STORY" },
  { label: "SQL analysis", value: "SQL_ANALYSIS" },
  { label: "Analytics task", value: "ANALYTICS_TASK" },
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
    <section className="surface-subtle space-y-4 p-4 sm:p-5">
      <header className="space-y-1">
        <p className="kicker">AI Exercise Review</p>
        <h3 className="text-lg font-semibold text-slate-100">Check practical task quality</h3>
      </header>

      <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
        <select
          value={exerciseType}
          onChange={(event) => setExerciseType(event.target.value as ExerciseType)}
          className="select-base"
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
          className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" />
          {isLoading ? "Checking..." : "Review with AI"}
        </button>
      </div>

      <textarea
        value={submission}
        onChange={(event) => setSubmission(event.target.value)}
        className="textarea-base min-h-[140px]"
        placeholder="Paste your practical work here..."
      />

      {result && (
        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-sm font-semibold text-slate-100">Score: {result.score}/100</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3 text-xs">
            <p className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-slate-300">
              Accuracy: {result.accuracy}%
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-slate-300">
              Completeness: {result.completeness}%
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-slate-300">
              Logic: {result.logic}%
            </p>
          </div>
          <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-slate-300">
            {result.feedback.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-sky-200">{result.nextSteps.join(" ")}</p>
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
