"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, RefreshCw, Trophy, XCircle } from "lucide-react";

import { submitQuizAttempt } from "@/app/actions/quiz-actions";
import { AIQuizReview } from "@/components/quiz/ai-quiz-review";
import { Button } from "@/components/ui/button";
import { QuizQuestion, QuizResult, useQuizStore } from "@/store/learning/use-quiz-store";

type QuizPlayerProps = {
  trackSlug: string;
  moduleId: string;
  quizId: string;
  quizTitle: string;
  passingScore: number;
  questions: QuizQuestion[];
  lessonContext: string;
};

const containerMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: "easeOut" },
} as const;

export function QuizPlayer({
  trackSlug,
  moduleId,
  quizId,
  quizTitle,
  passingScore,
  questions,
  lessonContext,
}: QuizPlayerProps) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const quizState = useQuizStore();
  const {
    initialize,
    currentIndex,
    answers,
    goNext,
    goPrevious,
    selectOption,
    setResult,
    retry,
    result,
  } = quizState;

  useEffect(() => {
    initialize({ quizId, questions });
  }, [initialize, questions, quizId]);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const selectedAnswers = currentQuestion ? answers[currentQuestion.id] ?? [] : [];
  const progressPercent =
    totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;
  const canGoPrevious = currentIndex > 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const hasSelection = selectedAnswers.length > 0;

  useEffect(() => {
    if (result) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (!currentQuestion) return;
      // Ignore when user is typing in a textarea
      if (document.activeElement?.tagName === "TEXTAREA") return;

      // 1–9: select nth option
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= currentQuestion.options.length) {
        const option = currentQuestion.options[num - 1];
        if (option) {
          selectOption(
            currentQuestion.id,
            currentQuestion.type,
            option.id,
            !selectedAnswers.includes(option.id),
          );
        }
        return;
      }

      // ArrowRight or Enter → next / submit
      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (document.activeElement?.tagName === "INPUT") return;
        if (hasSelection && !isPending) {
          isLastQuestion ? void handleSubmitQuiz() : goNext();
        }
        return;
      }

      // ArrowLeft → previous
      if (e.key === "ArrowLeft") {
        if (document.activeElement?.tagName === "INPUT") return;
        if (canGoPrevious && !isPending) goPrevious();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    result,
    currentQuestion,
    selectedAnswers,
    isLastQuestion,
    hasSelection,
    canGoPrevious,
    isPending,
    goNext,
    goPrevious,
    selectOption,
  ]);

  const answerPayload = useMemo(() => {
    return Object.fromEntries(
      Object.entries(answers).map(([questionId, answerIds]) => [questionId, Array.from(new Set(answerIds))]),
    );
  }, [answers]);

  async function handleSubmitQuiz() {
    setSubmitError(null);

    startTransition(async () => {
      const submitResult: QuizResult = await submitQuizAttempt({
        trackSlug,
        moduleId,
        quizId,
        answers: answerPayload,
      });

      if (!submitResult.ok) {
        setSubmitError(submitResult.message ?? "Failed to submit the quiz.");
        return;
      }

      setResult(submitResult);
    });
  }

  if (totalQuestions === 0) {
    return (
      <div className="state-panel">
        <p className="text-sm text-muted-foreground">No questions found for this quiz.</p>
      </div>
    );
  }

  if (result) {
    return (
      <AnimatePresence mode="wait">
        <motion.section key="result-screen" className="space-y-6" {...containerMotion}>
          <div className="surface-subtle rounded-2xl p-4 text-foreground sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Quiz result</p>
                <h2 className="mt-2 break-words text-2xl font-semibold">{quizTitle}</h2>
              </div>
              <div
                className={`inline-flex self-start items-center gap-2 rounded-full px-3 py-1 text-sm font-medium sm:self-auto ${
                  result.passed ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                }`}
              >
                {result.passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {result.passed ? "Passed" : "Not passed"}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="surface-subtle rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-2xl font-semibold">{result.score}%</p>
              </div>
              <div className="surface-subtle rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Correct answers</p>
                <p className="text-2xl font-semibold">
                  {result.correctAnswers}/{result.totalQuestions}
                </p>
              </div>
              <div className="surface-subtle rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Passing score</p>
                <p className="text-2xl font-semibold">{result.passingScore}%</p>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm text-muted-foreground">
              {result.passed ? (
                <p>Your module progress has been updated.</p>
              ) : (
                <p>Retake the quiz to reach at least {passingScore}% and complete this module.</p>
              )}
              {result.trackCompleted && (
                <p className="inline-flex flex-wrap items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-amber-200">
                  <Trophy className="h-4 w-4" />
                  Track completed{result.certificateIssued ? ", certificate created." : ", certificate already exists."}
                </p>
              )}
            </div>

            {submitError && <p className="mt-3 text-sm text-rose-300">{submitError}</p>}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={retry}
                className="inline-flex w-full items-center gap-2 sm:w-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
              <Link
                href={`/tracks/${trackSlug}/modules/${moduleId}`}
                className="btn-secondary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                Back to module
              </Link>
            </div>
          </div>

          <AIQuizReview wrongAnswers={result.wrongAnswers} lessonContext={lessonContext} />
        </motion.section>
      </AnimatePresence>
    );
  }

  return (
    <section className="space-y-5">
      <div className="surface-subtle rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Quiz</p>
            <h2 className="mt-1 break-words text-xl font-semibold text-foreground">{quizTitle}</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {totalQuestions}
          </div>
        </div>

        <div className="progress-track mt-4 h-2">
          <motion.div
            className="h-full rounded-full bg-sky-400"
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground/60">
          Press <kbd className="rounded border border-border px-1 font-mono">1</kbd>–<kbd className="rounded border border-border px-1 font-mono">{Math.min(currentQuestion?.options.length ?? 4, 9)}</kbd> to select · <kbd className="rounded border border-border px-1 font-mono">→</kbd> next · <kbd className="rounded border border-border px-1 font-mono">←</kbd> back
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.article
          key={currentQuestion.id}
          className="content-card space-y-5 rounded-2xl p-4 text-foreground sm:p-6"
          {...containerMotion}
        >
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {currentQuestion.type === "SINGLE" ? "Single choice" : "Multiple choice"}
            </p>
            <h3 className="break-words text-lg font-semibold leading-snug sm:text-xl">{currentQuestion.text}</h3>
          </header>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const checked = selectedAnswers.includes(option.id);
              const inputType = currentQuestion.type === "SINGLE" ? "radio" : "checkbox";

              return (
                <motion.label
                  key={option.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.995 }}
                className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                  checked
                    ? "border-sky-400/70 bg-sky-400/10"
                    : "quiz-option-default"
                }`}
              >
                  <input
                    type={inputType}
                    name={currentQuestion.id}
                    checked={checked}
                    onChange={(event) =>
                      selectOption(currentQuestion.id, currentQuestion.type, option.id, event.target.checked)
                    }
                    className="mt-1 h-4 w-4 accent-sky-400"
                  />
                  <span className="break-words text-sm leading-6 text-foreground">{option.text}</span>
                </motion.label>
              );
            })}
          </div>
        </motion.article>
      </AnimatePresence>

      {submitError && (
        <p className="state-error">
          {submitError}
        </p>
      )}

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={goPrevious}
          disabled={!canGoPrevious || isPending}
          className="inline-flex w-full items-center gap-2 sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        {!isLastQuestion ? (
          <Button
            type="button"
            onClick={goNext}
            disabled={!hasSelection || isPending}
            className="inline-flex w-full items-center justify-center gap-2 bg-sky-500 text-sky-950 hover:bg-sky-400 sm:w-auto"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmitQuiz}
            disabled={!hasSelection || isPending}
            className="inline-flex w-full items-center justify-center gap-2 bg-emerald-500 text-emerald-950 hover:bg-emerald-400 sm:w-auto"
          >
            {isPending ? "Checking..." : "Finish quiz"}
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </section>
  );
}
