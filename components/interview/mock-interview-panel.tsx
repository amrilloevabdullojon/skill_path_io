"use client";

import { useMemo, useState } from "react";
import { TrackCategory } from "@prisma/client";
import { ArrowRight, Loader2, RefreshCw } from "lucide-react";

import { interviewNextSteps, interviewTrackLabel } from "@/features/interview/trainer";

type InterviewQuestion = {
  id: string;
  text: string;
  expectedFocus: string;
};

type InterviewEvaluation = {
  score: number;
  level: "Junior" | "Junior+" | "Middle";
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  summary: string;
};

export function MockInterviewPanel() {
  const [track, setTrack] = useState<TrackCategory>(TrackCategory.QA);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex] ?? null;
  const answerForCurrent = currentQuestion ? answers[currentQuestion.id] ?? "" : "";
  const canGoNext = answerForCurrent.trim().length >= 10;
  const isLast = currentIndex === questions.length - 1;

  const payloadAnswers = useMemo(
    () =>
      questions.map((question) => ({
        questionId: question.id,
        answer: answers[question.id] ?? "",
      })),
    [answers, questions],
  );

  async function startInterview(selectedTrack: TrackCategory) {
    setTrack(selectedTrack);
    setIsLoading(true);
    setErrorText(null);
    setEvaluation(null);

    try {
      const response = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "start",
          track: selectedTrack,
        }),
      });
      const data = (await response.json()) as { questions?: InterviewQuestion[]; error?: string };
      if (!response.ok || !Array.isArray(data.questions)) {
        throw new Error(data.error || "Could not start interview");
      }

      setQuestions(data.questions);
      setAnswers({});
      setCurrentIndex(0);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Unknown interview error.");
    } finally {
      setIsLoading(false);
    }
  }

  async function finishInterview() {
    setIsLoading(true);
    setErrorText(null);

    try {
      const response = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          track,
          answers: payloadAnswers,
        }),
      });
      const data = (await response.json()) as { evaluation?: InterviewEvaluation; error?: string };
      if (!response.ok || !data.evaluation) {
        throw new Error(data.error || "Could not finish interview");
      }

      setEvaluation(data.evaluation);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Interview evaluation failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="surface-elevated space-y-5 p-5 sm:p-6">
      <header className="space-y-2">
        <p className="kicker">AI Mock Interview</p>
        <h1 className="text-2xl font-semibold text-foreground">Practice real interview flow</h1>
        <p className="text-sm text-muted-foreground">
          AI asks questions by track and gives detailed feedback after completion.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {[TrackCategory.QA, TrackCategory.BA, TrackCategory.DA].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => startInterview(item)}
            disabled={isLoading}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
              track === item
                ? "border-sky-400/45 bg-sky-500/12 text-sky-200"
                : "border-border bg-card/85 text-muted-foreground hover:border-border/70"
            }`}
          >
            {interviewTrackLabel(item)}
          </button>
        ))}
      </div>

      {questions.length === 0 && (
        <div className="surface-subtle p-4 text-sm text-muted-foreground">
          Click a track to start mock interview.
        </div>
      )}

      {questions.length > 0 && !evaluation && currentQuestion && (
        <div className="space-y-4">
          <div className="surface-subtle p-4">
            <p className="text-xs text-muted-foreground">
              Question {currentIndex + 1}/{questions.length}
            </p>
            <p className="mt-2 text-base font-semibold text-foreground">{currentQuestion.text}</p>
            <p className="mt-1 text-xs text-muted-foreground">Expected focus: {currentQuestion.expectedFocus}</p>
          </div>

          <textarea
            value={answerForCurrent}
            onChange={(event) =>
              setAnswers((prev) => ({
                ...prev,
                [currentQuestion.id]: event.target.value,
              }))
            }
            className="textarea-base min-h-[140px]"
            placeholder="Write your interview answer here..."
          />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0 || isLoading}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>

            {!isLast ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                disabled={!canGoNext || isLoading}
                className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finishInterview}
                disabled={!canGoNext || isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/45 bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-[0_10px_24px_rgba(52,211,153,0.28)] disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Finish Interview
              </button>
            )}
          </div>
        </div>
      )}

      {evaluation && (
        <article className="surface-subtle space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-foreground">Interview Result</h2>
            <div className="chip-neutral inline-flex items-center gap-2 px-3 py-1 text-sm">
              Score: {evaluation.score} | Level: {evaluation.level}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{evaluation.summary}</p>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="text-xs uppercase tracking-wide text-emerald-200">Strengths</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-emerald-100">
                {evaluation.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
              <p className="text-xs uppercase tracking-wide text-rose-200">Weaknesses</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-rose-100">
                {evaluation.weaknesses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3">
              <p className="text-xs uppercase tracking-wide text-sky-200">Recommendations</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-sky-100">
                {evaluation.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-3">
            <p className="text-xs uppercase tracking-wide text-violet-200">Recommended next lessons/modules</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-violet-100">
              {interviewNextSteps(evaluation.score, track).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => startInterview(track)}
            disabled={isLoading}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Interview
          </button>
        </article>
      )}

      {errorText && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          {errorText}
        </p>
      )}
    </section>
  );
}
