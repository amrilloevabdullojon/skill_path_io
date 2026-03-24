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
    <section className="surface-elevated space-y-5 p-5 sm:p-6">
      <header className="space-y-2">
        <p className="kicker">QA Simulation</p>
        <h1 className="text-2xl font-semibold text-slate-100">Bug Tracker Simulation</h1>
        <p className="text-sm text-slate-400">
          Create a Jira-style bug report and receive AI quality review.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="input-base"
          placeholder="Bug title"
        />
        <select value={severity} onChange={(event) => setSeverity(event.target.value as BugSeverity)} className="select-base">
          {severityValues.map((value) => (
            <option key={value} value={value}>
              Severity: {value}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={stepsToReproduce}
        onChange={(event) => setStepsToReproduce(event.target.value)}
        className="textarea-base min-h-[110px]"
        placeholder="Steps to reproduce..."
      />
      <textarea
        value={expectedResult}
        onChange={(event) => setExpectedResult(event.target.value)}
        className="textarea-base min-h-[80px]"
        placeholder="Expected result..."
      />
      <textarea
        value={actualResult}
        onChange={(event) => setActualResult(event.target.value)}
        className="textarea-base min-h-[80px]"
        placeholder="Actual result..."
      />

      <button
        type="button"
        onClick={submitForReview}
        disabled={isLoading}
        className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
      >
        <Bug className="h-4 w-4" />
        {isLoading ? "Reviewing..." : "Review bug report"}
      </button>

      {review && (
        <article className="surface-subtle space-y-3 p-4">
          <p className="text-sm font-semibold text-slate-100">Quality score: {review.qualityScore}/100</p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-100">
              <p className="font-semibold uppercase tracking-wide text-emerald-200">Strengths</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {review.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-100">
              <p className="font-semibold uppercase tracking-wide text-rose-200">Issues</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {review.issues.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-sky-100">
              <p className="font-semibold uppercase tracking-wide text-sky-200">Suggestions</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
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
