"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Lightbulb, Loader2 } from "lucide-react";

import { QuizWrongAnswer } from "@/store/learning/use-quiz-store";

type ReviewResponse = {
  explanation: string;
  tips: string[];
  recommendations: string[];
};

type AIQuizReviewProps = {
  wrongAnswers: QuizWrongAnswer[];
  lessonContext: string;
};

export function AIQuizReview({ wrongAnswers, lessonContext }: AIQuizReviewProps) {
  const [isLoadingId, setIsLoadingId] = useState<string | null>(null);
  const [reviewsByQuestionId, setReviewsByQuestionId] = useState<Record<string, ReviewResponse>>({});
  const [errorText, setErrorText] = useState<string | null>(null);

  async function handleGenerateReview(item: QuizWrongAnswer) {
    setIsLoadingId(item.questionId);
    setErrorText(null);

    try {
      const response = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reviewType: "QUIZ",
          payload: {
            question: item.question,
            options: item.options.map((option) => option.text),
            userAnswers: item.userAnswers,
            correctAnswers: item.correctAnswers,
            lessonContext,
          },
        }),
      });

      const data = (await response.json()) as
        | { source: "quiz" | "exercise"; result: ReviewResponse; error?: string }
        | { error?: string };
      if (!response.ok) {
        throw new Error("error" in data ? data.error || "AI review failed" : "AI review failed");
      }

      setReviewsByQuestionId((prev) => ({
        ...prev,
        [item.questionId]: {
          explanation: "result" in data ? data.result.explanation : "",
          tips: "result" in data ? data.result.tips : [],
          recommendations: "result" in data ? data.result.recommendations : [],
        },
      }));
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Could not build AI review.");
    } finally {
      setIsLoadingId(null);
    }
  }

  if (wrongAnswers.length === 0) {
    return (
      <section className="surface-subtle p-4">
        <p className="text-sm text-emerald-300">Perfect run. No incorrect answers for AI review.</p>
      </section>
    );
  }

  return (
    <section className="surface-subtle space-y-4 p-4 sm:p-5">
      <header className="space-y-1">
        <p className="kicker">AI Error Review</p>
        <h3 className="section-heading">Understand mistakes and fix gaps</h3>
        <p className="text-sm text-muted-foreground">AI explains why the answer is wrong and what to do next.</p>
      </header>

      <div className="space-y-3">
        {wrongAnswers.map((item, index) => {
          const review = reviewsByQuestionId[item.questionId];
          const isLoading = isLoadingId === item.questionId;

          return (
            <article key={item.questionId} className="rounded-xl border border-rose-400/30 bg-rose-500/5 p-4">
              <p className="text-sm font-semibold text-foreground">
                Q{index + 1}. {item.question}
              </p>
              <div className="mt-2 space-y-1 text-xs">
                <p className="inline-flex items-center gap-2 text-rose-200">
                  <AlertCircle className="h-4 w-4" />
                  Your answer: {item.userAnswers.join(", ") || "No answer"}
                </p>
                <p className="inline-flex items-center gap-2 text-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                  Correct answer: {item.correctAnswers.join(", ")}
                </p>
              </div>

              {!review && (
                <button
                  type="button"
                  onClick={() => handleGenerateReview(item)}
                  disabled={Boolean(isLoadingId)}
                  className="btn-secondary mt-3 inline-flex items-center gap-2 px-3 py-2 disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                  {isLoading ? "Analyzing..." : "Generate AI explanation"}
                </button>
              )}

              {review && (
                <div className="content-card mt-3 space-y-2 rounded-xl p-3 text-sm text-muted-foreground">
                  <p>{review.explanation}</p>
                  <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                    {review.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-sky-200">
                    Recommendation: {review.recommendations.join(" ")}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {errorText && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          {errorText}
        </p>
      )}
    </section>
  );
}
