import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, HelpCircle, RotateCcw, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";

type ModuleQuizReadinessProps = {
  quizTitle: string;
  quizHref: string;
  questionCount: number;
  passingScore: number;
  previousScore: number | null;
  isCompleted: boolean;
  attempts: Array<{
    id: string;
    score: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
    wrongCount: number;
    submittedAt: Date;
  }>;
};

function scoreTone(score: number | null, passingScore: number, isCompleted: boolean) {
  if (isCompleted || (score !== null && score >= passingScore)) {
    return {
      label: "Тест закрыт",
      description: "Можно повторить вопросы для закрепления или перейти к следующему модулю.",
      className: "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      icon: Trophy,
    };
  }

  if (score !== null) {
    return {
      label: "Нужно добрать баллы",
      description: "Повторите быстрые вопросы ниже и пересдайте тест, когда ответы станут уверенными.",
      className: "border-amber-400/35 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      icon: RotateCcw,
    };
  }

  return {
    label: "Готовность к тесту",
    description: "Сначала пройдите мини-практику в модуле, затем открывайте полный тест.",
    className: "border-sky-400/35 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    icon: ClipboardList,
  };
}

export function ModuleQuizReadiness({
  quizTitle,
  quizHref,
  questionCount,
  passingScore,
  previousScore,
  isCompleted,
  attempts,
}: ModuleQuizReadinessProps) {
  const tone = scoreTone(previousScore, passingScore, isCompleted);
  const ToneIcon = tone.icon;
  const scoreValue = Math.min(Math.max(previousScore ?? 0, 0), 100);

  return (
    <section id="module-quiz" className="rounded-4xl border border-border bg-background/75 p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold", tone.className)}>
                <ToneIcon className="h-3.5 w-3.5" />
                {tone.label}
              </span>
              <h2 className="mt-3 text-xl font-black text-foreground">{quizTitle}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{tone.description}</p>
            </div>
            <Link
              href={quizHref}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 text-sm font-black text-slate-950 transition hover:bg-amber-300"
            >
              {previousScore === null ? "Открыть тест" : "Пересдать тест"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/50 bg-card/65 p-4">
              <HelpCircle className="h-4 w-4 text-sky-500" />
              <p className="mt-2 text-2xl font-black text-foreground">{questionCount}</p>
              <p className="text-xs text-muted-foreground">вопросов</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/65 p-4">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="mt-2 text-2xl font-black text-foreground">{passingScore}%</p>
              <p className="text-xs text-muted-foreground">проходной балл</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/65 p-4">
              <Trophy className="h-4 w-4 text-amber-500" />
              <p className="mt-2 text-2xl font-black text-foreground">{previousScore === null ? "-" : `${scoreValue}%`}</p>
              <p className="text-xs text-muted-foreground">последний результат</p>
            </div>
          </div>
        </div>

        <aside className="rounded-3xl border border-border/50 bg-card/70 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Порог уверенности</p>
          <div className="mt-4 h-3 rounded-full bg-muted/50">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                previousScore !== null && previousScore >= passingScore ? "bg-emerald-500" : "bg-amber-400",
              )}
              style={{ width: `${Math.max(previousScore === null ? 12 : scoreValue, 8)}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>{passingScore}% порог</span>
            <span>100%</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {previousScore === null
              ? "Результат появится здесь после первой попытки."
              : previousScore >= passingScore
                ? "Хороший сигнал: модуль уже засчитан."
                : "До проходного балла осталось немного. Начните с быстрых вопросов ниже."}
          </p>
        </aside>
      </div>

      {attempts.length > 0 ? (
        <div className="mt-4 rounded-3xl border border-border/50 bg-card/60 p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-black text-foreground">История попыток</p>
            <p className="text-xs text-muted-foreground">Последние {attempts.length}</p>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {attempts.map((attempt, index) => (
              <article key={attempt.id} className="rounded-2xl border border-border/50 bg-background/55 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Попытка {attempts.length - index}</p>
                    <p className="mt-1 text-xl font-black text-foreground">{attempt.score}%</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-1 text-[11px] font-bold",
                      attempt.passed
                        ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-amber-400/35 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                    )}
                  >
                    {attempt.passed ? "Сдан" : "Повторить"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {attempt.correctAnswers}/{attempt.totalQuestions} верно · ошибок: {attempt.wrongCount}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">
                  {new Intl.DateTimeFormat("ru-RU", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(attempt.submittedAt)}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
