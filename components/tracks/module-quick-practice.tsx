"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, HelpCircle, RotateCcw, Target, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type PracticeQuestion = {
  id: string;
  text: string;
  type: string;
  options: Array<{ id: string; text: string }>;
  correctAnswer: string[];
};

type ModuleQuickPracticeProps = {
  moduleTitle: string;
  questions: PracticeQuestion[];
  quizHref: string;
};

function normalizeAnswers(value: string[]) {
  return Array.from(new Set(value.map((item) => item.trim()).filter(Boolean))).sort();
}

function sameAnswers(left: string[], right: string[]) {
  const a = normalizeAnswers(left);
  const b = normalizeAnswers(right);
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

function isMulti(type: string) {
  return type === "MULTI" || type === "MULTIPLE_CHOICE";
}

export function ModuleQuickPractice({ moduleTitle, questions, quizHref }: ModuleQuickPracticeProps) {
  const practiceQuestions = useMemo(() => questions.slice(0, 3), [questions]);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (practiceQuestions.length === 0) {
    return null;
  }

  const answeredCount = practiceQuestions.filter((question) => checked[question.id] !== undefined).length;
  const correctCount = practiceQuestions.filter((question) => checked[question.id] === true).length;
  const isComplete = answeredCount === practiceQuestions.length;
  const readinessPercent = Math.round((correctCount / practiceQuestions.length) * 100);
  const isReadyForQuiz = isComplete && readinessPercent >= 70;

  function toggle(question: PracticeQuestion, optionId: string) {
    if (checked[question.id] !== undefined) return;
    setAnswers((previous) => {
      const current = previous[question.id] ?? [];
      const next = isMulti(question.type)
        ? current.includes(optionId)
          ? current.filter((item) => item !== optionId)
          : [...current, optionId]
        : [optionId];
      return { ...previous, [question.id]: next };
    });
  }

  function check(question: PracticeQuestion) {
    const selected = answers[question.id] ?? [];
    if (selected.length === 0) return;
    setChecked((previous) => ({
      ...previous,
      [question.id]: sameAnswers(selected, question.correctAnswer),
    }));
  }

  function reset() {
    setAnswers({});
    setChecked({});
  }

  return (
    <section id="module-practice" className="rounded-4xl border border-sky-400/25 bg-sky-500/8 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/35 bg-background/50 px-3 py-1 text-xs font-bold text-sky-600 dark:text-sky-300">
            <HelpCircle className="h-3.5 w-3.5" />
            Быстрая практика
          </div>
          <h2 className="mt-3 text-xl font-black text-foreground">{moduleTitle}: закрепление</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Несколько вопросов из теста прямо внутри урока. Это помогает понять, готовы ли вы идти дальше.
          </p>
        </div>
        <div className="rounded-2xl bg-background/65 p-3 text-sm font-bold text-foreground">
          {correctCount}/{practiceQuestions.length} верно
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {practiceQuestions.map((question, index) => {
          const selected = answers[question.id] ?? [];
          const result = checked[question.id];

          return (
            <article key={question.id} className="rounded-3xl border border-border/50 bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Вопрос {index + 1}</p>
                  <h3 className="mt-1 text-base font-black text-foreground">{question.text}</h3>
                </div>
                {result !== undefined ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold",
                      result
                        ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                        : "border-rose-400/35 bg-rose-500/10 text-rose-600 dark:text-rose-300",
                    )}
                  >
                    {result ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {result ? "Верно" : "Проверьте"}
                  </span>
                ) : null}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => {
                  const isSelected = selected.includes(option.id);
                  const isCorrect = question.correctAnswer.includes(option.id);

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggle(question, option.id)}
                      className={cn(
                        "min-h-12 rounded-2xl border bg-background px-4 py-3 text-left text-sm font-semibold text-foreground transition hover:border-sky-300",
                        isSelected && "border-sky-400 bg-sky-500/10",
                        result !== undefined && isCorrect && "border-emerald-400 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
                        result === false && isSelected && !isCorrect && "border-rose-400 bg-rose-500/10 text-rose-700 dark:text-rose-200",
                      )}
                    >
                      {option.text}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {isMulti(question.type) ? "Можно выбрать несколько вариантов." : "Выберите один вариант."}
                </p>
                <button
                  type="button"
                  onClick={() => check(question)}
                  disabled={(answers[question.id] ?? []).length === 0 || result !== undefined}
                  className="inline-flex h-10 items-center justify-center rounded-2xl bg-sky-500 px-4 text-sm font-bold text-primary-foreground transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Проверить
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {answeredCount > 0 ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
          <article
            className={cn(
              "rounded-3xl border p-4",
              isReadyForQuiz
                ? "border-emerald-400/30 bg-emerald-500/10"
                : "border-amber-400/30 bg-amber-500/10",
            )}
          >
            <p
              className={cn(
                "inline-flex items-center gap-2 text-sm font-black",
                isReadyForQuiz ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300",
              )}
            >
              <Target className="h-4 w-4" />
              {isReadyForQuiz ? "Можно идти к тесту" : "Лучше ещё раз закрепить"}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isComplete
                ? `Готовность по быстрой практике: ${readinessPercent}%.`
                : `Проверьте все ${practiceQuestions.length} вопроса, чтобы увидеть готовность к тесту.`}
            </p>
          </article>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Link href={quizHref} className="btn-primary inline-flex items-center justify-center gap-2">
              Перейти к тесту
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border bg-background px-4 py-2 text-sm font-bold text-foreground transition hover:border-sky-400"
            >
              <RotateCcw className="h-4 w-4" />
              Сбросить
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
