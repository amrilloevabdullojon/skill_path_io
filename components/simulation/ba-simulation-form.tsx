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
    <section className="surface-elevated border border-border/50 bg-card space-y-6 p-5 sm:p-7 relative isolate overflow-hidden rounded-2xl">
      <div className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none -z-10" />
      <header className="space-y-2">
        <p className="kicker text-indigo-400">Симуляция BA</p>
        <h1 className="page-title text-foreground">User Story + Acceptance Criteria</h1>
        <p className="text-sm text-foreground/70">
          Составьте реалистичную историю пользователя и получите ревью качества от ИИ.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <input value={actor} onChange={(event) => setActor(event.target.value)} className="input-base bg-card/60 backdrop-blur-sm border-border-subtle focus:border-indigo-500/50 focus:ring-indigo-500/20" placeholder="Как... (As a...)" />
        <input value={action} onChange={(event) => setAction(event.target.value)} className="input-base bg-card/60 backdrop-blur-sm border-border-subtle focus:border-indigo-500/50 focus:ring-indigo-500/20" placeholder="Я хочу... (I want to...)" />
        <input value={value} onChange={(event) => setValue(event.target.value)} className="input-base bg-card/60 backdrop-blur-sm border-border-subtle focus:border-indigo-500/50 focus:ring-indigo-500/20" placeholder="Чтобы... (So that...)" />
      </div>

      <textarea
        value={acceptanceCriteria}
        onChange={(event) => setAcceptanceCriteria(event.target.value)}
        className="textarea-base min-h-[160px] bg-card/60 backdrop-blur-sm border-border-subtle focus:border-indigo-500/50 focus:ring-indigo-500/20"
        placeholder="Критерии приемки (Given/When/Then)..."
      />

      <button
        type="button"
        onClick={submitStory}
        disabled={isLoading}
        className="btn-primary gap-2 disabled:opacity-60"
      >
        <ClipboardCheck className="h-5 w-5" />
        {isLoading ? "Анализирую..." : "Проверить User Story"}
      </button>

      {review && (
        <article className="surface-subtle border border-indigo-500/30 bg-card/50 backdrop-blur-md space-y-4 p-5 rounded-2xl relative isolate overflow-hidden mt-6">
          <div className="absolute top-[-50px] left-[-50px] w-[200px] h-[200px] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none -z-10" />
          <p className="text-lg font-bold text-foreground">Оценка качества: <span className="text-indigo-400">{review.score}/100</span></p>
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
              <p className="font-semibold uppercase tracking-wide text-rose-300">Пробелы / Ошибки</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-4">
                {review.gaps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md p-4 text-xs text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <p className="font-semibold uppercase tracking-wide text-indigo-300">Рекомендации</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-4">
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
