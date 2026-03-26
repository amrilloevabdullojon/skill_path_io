"use client";

import { useState } from "react";
import { AlertTriangle, ClipboardCheck } from "lucide-react";

type BaReviewResult = {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
};

export function BaSimulationForm() {
  const [actor, setActor] = useState("");
  const [action, setAction] = useState("");
  const [value, setValue] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [review, setReview] = useState<BaReviewResult | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submitStory() {
    setIsLoading(true);
    setErrorText(null);

    try {
      const response = await fetch("/api/simulation/ba-review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          actor,
          action,
          value,
          acceptanceCriteria,
        }),
      });
      const data = (await response.json()) as BaReviewResult & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Failed to review user story");
      }
      setReview(data);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Unknown review error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="surface-elevated space-y-5 p-5 sm:p-6">
      <header className="space-y-2">
        <p className="kicker">BA Simulation</p>
        <h1 className="text-2xl font-semibold text-foreground">User Story + Acceptance Criteria</h1>
        <p className="text-sm text-muted-foreground">
          Build a realistic story and get AI review on quality and completeness.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <input value={actor} onChange={(event) => setActor(event.target.value)} className="input-base" placeholder="As a..." />
        <input value={action} onChange={(event) => setAction(event.target.value)} className="input-base" placeholder="I want to..." />
        <input value={value} onChange={(event) => setValue(event.target.value)} className="input-base" placeholder="So that..." />
      </div>

      <textarea
        value={acceptanceCriteria}
        onChange={(event) => setAcceptanceCriteria(event.target.value)}
        className="textarea-base min-h-[160px]"
        placeholder="Acceptance criteria (Given/When/Then)..."
      />

      <button
        type="button"
        onClick={submitStory}
        disabled={isLoading}
        className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
      >
        <ClipboardCheck className="h-4 w-4" />
        {isLoading ? "Reviewing..." : "Review story"}
      </button>

      {review && (
        <article className="surface-subtle space-y-3 p-4">
          <p className="text-sm font-semibold text-foreground">Score: {review.score}/100</p>
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
              <p className="font-semibold uppercase tracking-wide text-rose-200">Gaps</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {review.gaps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-sky-100">
              <p className="font-semibold uppercase tracking-wide text-sky-200">Recommendations</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {review.recommendations.map((item) => (
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
