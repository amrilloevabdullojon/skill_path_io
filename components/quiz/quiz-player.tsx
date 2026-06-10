"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  ListChecks,
  RefreshCw,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";

import { submitQuizAttempt } from "@/app/actions/quiz-actions";
import { AIQuizReview } from "@/components/quiz/ai-quiz-review";
import { Button } from "@/components/ui/button";
import { QuizQuestion, QuizResult, useQuizStore } from "@/store/learning/use-quiz-store";

type QuizPlayerProps = {
  trackSlug: string;
  moduleId: string;
  quizId: string;
  canonicalQuizId?: string;
  quizTitle: string;
  passingScore: number;
  questions: QuizQuestion[];
  generatedByAi?: boolean;
  fallbackMessage?: string | null;
  lessonContext: string;
  moduleHref: string;
  trackHref: string;
  nextModuleHref?: string | null;
  nextModuleTitle?: string | null;
  reviewHref?: string;
  attemptSummaries?: Array<{
    id: string;
    score: number;
    passed: boolean;
    wrongCount: number;
    submittedAt: string;
  }>;
};

const containerMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: "easeOut" },
} as const;

function optionLabels(
  options: Array<{ id: string; text: string }>,
  answerIds: string[],
) {
  const optionById = new Map(options.map((option) => [option.id, option.text]));
  return answerIds.map((id) => optionById.get(id) ?? id);
}

function resultDiagnosis(result: QuizResult) {
  if (result.passed) {
    return {
      label: "Готов к следующему шагу",
      description: "Базовые понятия модуля подтверждены. Закрепите результат практикой или переходите дальше.",
      tone: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    };
  }

  if (result.score >= Math.max(45, result.passingScore - 20)) {
    return {
      label: "Нужно точечно повторить",
      description: "Вы близко к проходному баллу. Разберите ошибки и пересдайте тест после короткого повторения.",
      tone: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    };
  }

  return {
    label: "Вернуться к базе",
    description: "Пробелы пока системные. Лучше перечитать ключевые блоки модуля, затем вернуться к тесту.",
    tone: "border-rose-400/30 bg-rose-500/10 text-rose-200",
  };
}

export function QuizPlayer({
  trackSlug,
  moduleId,
  quizId,
  canonicalQuizId,
  quizTitle,
  passingScore,
  questions,
  generatedByAi = false,
  fallbackMessage = null,
  lessonContext,
  moduleHref,
  trackHref,
  nextModuleHref = null,
  nextModuleTitle = null,
  reviewHref = "/review",
  attemptSummaries = [],
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
  const answeredCount = questions.filter((question) => (answers[question.id] ?? []).length > 0).length;
  const remainingCount = Math.max(totalQuestions - answeredCount, 0);
  const quizReadinessPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const nextQuizAction = hasSelection
    ? isLastQuestion
      ? "Можно завершать попытку"
      : "Переходите к следующему вопросу"
    : "Выберите ответ на текущий вопрос";

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
          if (isLastQuestion) { void handleSubmitQuiz(); } else { goNext(); }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        quizId: canonicalQuizId ?? quizId,
        aiGeneratedQuestions: generatedByAi ? questions : undefined,
        answers: answerPayload,
      });

      if (!submitResult.ok) {
        setSubmitError(submitResult.message ?? "Не удалось отправить тест.");
        return;
      }

      setResult(submitResult);
    });
  }

  if (totalQuestions === 0) {
    return (
      <div className="state-panel flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Вопросы для этого теста не найдены.</p>
        <Link
          href={`/tracks/${trackSlug}/modules/${moduleId}`}
          className="btn-secondary px-4 py-2 text-xs"
        >
          Вернуться к модулю
        </Link>
      </div>
    );
  }

  if (result) {
    const wrongAnswerCount = result.wrongAnswers.length;
    const scoreGap = Math.max(result.passingScore - result.score, 0);
    const diagnosis = resultDiagnosis(result);
    const recoverySteps = result.passed
      ? [
          "Сохраните уверенность: выполните одну практическую задачу по модулю.",
          "Если были ошибки, всё равно прочитайте их разбор перед следующим модулем.",
          "Переходите дальше, когда можете объяснить ответы без подсказок.",
        ]
      : [
          "Откройте разбор ошибок ниже и выпишите, почему верный ответ лучше вашего.",
          "Вернитесь к теории модуля на 10-15 минут по темам, где ошиблись.",
          "Пересдайте тест: цель не угадать, а исправить конкретные пробелы.",
        ];
    const primaryNextHref = result.passed ? nextModuleHref ?? trackHref : reviewHref;
    const primaryNextLabel = result.passed
      ? nextModuleHref
        ? "Следующий модуль"
        : "К треку"
      : "Разобрать ошибки";
    const primaryNextDescription = result.passed
      ? nextModuleTitle
        ? `Продолжайте путь: ${nextModuleTitle}`
        : "Модуль закрыт. Можно вернуться к карте трека и выбрать следующий шаг."
      : wrongAnswerCount > 0
        ? "Сначала посмотрите активные ошибки, затем вернитесь и пересдайте тест."
        : "Попробуйте пройти тест ещё раз, чтобы закрепить материал.";
    return (
      <AnimatePresence mode="wait">
        <motion.section key="result-screen" className="space-y-6" {...containerMotion}>
          <div className="overflow-hidden rounded-2xl border border-border bg-background/75 text-foreground shadow-sm backdrop-blur" aria-live="polite" aria-atomic="true">
            <div className={result.passed ? "h-1.5 bg-emerald-500" : "h-1.5 bg-amber-400"} />
            <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-kicker text-muted-foreground">Результат теста</p>
                <h2 className="mt-2 break-words text-2xl font-semibold">{quizTitle}</h2>
              </div>
              <div
                className={`inline-flex self-start items-center gap-2 rounded-full px-3 py-1 text-sm font-medium sm:self-auto ${
                  result.passed ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                }`}
              >
                {result.passed ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <XCircle className="h-4 w-4" aria-hidden="true" />}
                {result.passed ? "Сдан" : "Не сдан"}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border/50 bg-card/65 p-4">
                <p className="text-xs text-muted-foreground">Результат</p>
                <p className="text-2xl font-semibold">{result.score}%</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-card/65 p-4">
                <p className="text-xs text-muted-foreground">Правильных ответов</p>
                <p className="text-2xl font-semibold">
                  {result.correctAnswers}/{result.totalQuestions}
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-card/65 p-4">
                <p className="text-xs text-muted-foreground">Ошибок</p>
                <p className="text-2xl font-semibold">{wrongAnswerCount}</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-card/65 p-4">
                <p className="text-xs text-muted-foreground">Проходной балл</p>
                <p className="text-2xl font-semibold">{result.passingScore}%</p>
              </div>
            </div>

            <div className={`mt-5 rounded-lg border p-4 ${diagnosis.tone}`}>
              <div className="flex items-start gap-3">
                <ClipboardList className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{diagnosis.label}</p>
                  <p className="mt-1 text-sm leading-relaxed opacity-85">{diagnosis.description}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-border/50 bg-card/55 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ListChecks className="h-4 w-4 text-amber-500" />
                  Разбор попытки
                </p>
                <span className="rounded-full border border-border/50 px-2.5 py-1 text-xs text-muted-foreground">
                  {result.correctAnswers} из {result.totalQuestions}
                </span>
              </div>
              {wrongAnswerCount > 0 ? (
                <div className="mt-3 grid gap-2">
                  {result.wrongAnswers.map((item, index) => (
                    <article key={item.questionId} className="rounded-lg border border-rose-400/25 bg-rose-500/5 p-3">
                      <p className="text-sm font-semibold text-foreground">
                        {index + 1}. {item.question}
                      </p>
                      <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                        <p className="rounded-lg bg-background/55 px-3 py-2 text-rose-700 dark:text-rose-300">
                          Ваш ответ: {optionLabels(item.options, item.userAnswers).join(", ") || "Нет ответа"}
                        </p>
                        <p className="rounded-lg bg-background/55 px-3 py-2 text-emerald-700 dark:text-emerald-300">
                          Верно: {optionLabels(item.options, item.correctAnswers).join(", ")}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
                  Все ответы верные. Хороший момент закрепить модуль и двигаться дальше.
                </p>
              )}
            </div>

            <div className="mt-5 space-y-2 text-sm text-muted-foreground">
              {result.passed ? (
                <p>Прогресс по модулю обновлён.</p>
              ) : (
                <p>Пересдайте тест, чтобы набрать не менее {passingScore}% и завершить модуль.</p>
              )}
              {result.trackCompleted && (
                <p className="inline-flex flex-wrap items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-amber-500 dark:text-amber-200">
                  <Trophy className="h-4 w-4" />
                  Трек завершён{result.certificateIssued ? ", сертификат выдан." : ", сертификат уже существует."}
                </p>
              )}
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
              <article className="rounded-lg border border-amber-400/25 bg-amber-400/10 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
                    {result.passed ? <BookOpenCheck className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-kicker text-amber-700 dark:text-amber-300">
                      Следующий шаг
                    </p>
                    <h3 className="mt-1 break-words text-lg font-black text-foreground">{primaryNextLabel}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{primaryNextDescription}</p>
                  </div>
                </div>
                {!result.passed ? (
                  <div className="mt-4 rounded-lg border border-border/50 bg-background/55 p-3">
                    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>До проходного балла</span>
                      <span className="font-bold text-foreground">{scoreGap}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${Math.min(Math.max(result.score, 8), 100)}%` }}
                      />
                    </div>
                  </div>
                ) : null}
              </article>

              <article className="rounded-lg border border-border/50 bg-card/55 p-4">
                <p className="text-xs font-bold uppercase tracking-kicker text-muted-foreground">План повторения</p>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {recoverySteps.map((step) => (
                    <p key={step} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {step}
                    </p>
                  ))}
                </div>
              </article>
            </div>

            {attemptSummaries.length > 0 ? (
              <div className="mt-5 rounded-lg border border-border/50 bg-card/55 p-4">
                <p className="text-xs font-bold uppercase tracking-kicker text-muted-foreground">История попыток</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {attemptSummaries.map((attempt) => (
                    <div key={attempt.id} className="rounded-lg border border-border bg-background/60 px-3 py-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-foreground">{attempt.score}%</span>
                        <span className={attempt.passed ? "text-emerald-300" : "text-amber-300"}>
                          {attempt.passed ? "сдан" : `${attempt.wrongCount} ошибок`}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(attempt.submittedAt).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {submitError && <p className="mt-3 text-sm text-rose-300">{submitError}</p>}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={primaryNextHref}
                className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                {primaryNextLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Button
                type="button"
                variant="outline"
                onClick={retry}
                className="inline-flex w-full items-center gap-2 sm:w-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Попробовать снова
              </Button>
              <Link
                href={moduleHref}
                className="btn-secondary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                К модулю
              </Link>
            </div>
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
            <p className="text-xs uppercase tracking-kicker text-muted-foreground">Тест</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 className="break-words text-xl font-semibold text-foreground">{quizTitle}</h2>
              {generatedByAi ? (
                <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                  AI-квиз
                </span>
              ) : fallbackMessage ? (
                <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  Базовый квиз
                </span>
              ) : null}
            </div>
            {fallbackMessage ? (
              <p className="mt-2 max-w-2xl text-xs leading-5 text-muted-foreground">{fallbackMessage}</p>
            ) : null}
          </div>
          <div className="text-sm text-muted-foreground">
            Вопрос {currentIndex + 1} из {totalQuestions}
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-background/65">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_15rem]">
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Фокус попытки</p>
              <h3 className="mt-1 text-base font-semibold text-foreground">{nextQuizAction}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Квиз проверяет ключевые понятия модуля. После отправки вы получите разбор ошибок и понятный следующий шаг.
              </p>
            </div>
            <div className="border-t border-border bg-card/55 p-4 lg:border-l lg:border-t-0">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Отвечено</span>
                <span className="font-semibold text-foreground">{answeredCount}/{totalQuestions}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-indigo-400 transition-all" style={{ width: `${quizReadinessPercent}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {remainingCount > 0 ? `Осталось: ${remainingCount}` : "Все вопросы отмечены"}
              </p>
            </div>
          </div>
        </div>

        <div
          className="progress-track mt-4 h-2"
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalQuestions}
          aria-label={`Вопрос ${currentIndex + 1} из ${totalQuestions}`}
        >
          <motion.div
            className="h-full rounded-full bg-indigo-400"
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/55 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <ListChecks className="h-4 w-4 text-amber-500" />
            Карта вопросов
          </p>
          <div className="flex flex-wrap gap-2">
            {questions.map((question, index) => {
              const answered = (answers[question.id] ?? []).length > 0;
              const active = index === currentIndex;

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => {
                    if (index > currentIndex && !hasSelection) return;
                    while (index > useQuizStore.getState().currentIndex) {
                      useQuizStore.getState().goNext();
                    }
                    while (index < useQuizStore.getState().currentIndex) {
                      useQuizStore.getState().goPrevious();
                    }
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition ${
                    active
                      ? "border-amber-400 bg-amber-400 text-slate-950"
                      : answered
                        ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-border bg-background text-muted-foreground"
                  }`}
                  aria-label={`Перейти к вопросу ${index + 1}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
        {!hasSelection ? (
          <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5" />
            Выберите ответ, чтобы продолжить.
          </p>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        <motion.article
          key={currentQuestion.id}
          className="content-card space-y-5 rounded-2xl p-4 text-foreground sm:p-6"
          {...containerMotion}
        >
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-kicker text-muted-foreground">
              {currentQuestion.type === "SINGLE" ? "Один вариант" : "Несколько вариантов"}
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
                    ? "border-indigo-400/70 bg-indigo-400/10"
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
                    className="mt-1 h-4 w-4 accent-indigo-400"
                  />
                  <span className="break-words text-sm leading-6 text-foreground">{option.text}</span>
                </motion.label>
              );
            })}
          </div>
        </motion.article>
      </AnimatePresence>

      {submitError && (
        <p role="alert" className="state-error">
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
          Назад
        </Button>

        {!isLastQuestion ? (
          <Button
            type="button"
            onClick={goNext}
            disabled={!hasSelection || isPending}
            className="inline-flex w-full items-center justify-center gap-2 bg-indigo-500 text-indigo-950 hover:bg-indigo-400 sm:w-auto"
          >
            Далее
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmitQuiz}
            disabled={!hasSelection || isPending}
            className="inline-flex w-full items-center justify-center gap-2 bg-emerald-500 text-emerald-950 hover:bg-emerald-400 sm:w-auto"
          >
            {isPending ? "Проверяю..." : "Завершить тест"}
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </section>
  );
}
