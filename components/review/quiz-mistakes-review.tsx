import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  RotateCcw,
  Target,
  XCircle,
} from "lucide-react";

export type QuizMistakeItem = {
  id: string;
  question: string;
  selectedAnswers: string[];
  correctAnswers: string[];
  trackTitle: string;
  trackSlug: string;
  moduleId: string;
  moduleTitle: string;
  quizTitle: string;
  submittedAt: Date;
};

type QuizMistakesReviewProps = {
  mistakes: QuizMistakeItem[];
};

function formatSubmittedAt(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function QuizMistakesReview({ mistakes }: QuizMistakesReviewProps) {
  const uniqueModuleCount = new Set(mistakes.map((item) => item.moduleId)).size;
  const primaryMistake = mistakes[0] ?? null;

  return (
    <section className="space-y-4">
      <header className="rounded-4xl border border-amber-400/25 bg-amber-500/10 p-5 text-foreground">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-background/50 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5" />
              Ошибки из тестов
            </p>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-foreground">Повторение слабых вопросов</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Здесь собираются вопросы, где последняя попытка всё ещё неправильная. Разберите вопрос, затем вернитесь в модуль и пересдайте тест.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:min-w-72">
            <div className="rounded-2xl border border-border/50 bg-background/55 p-3">
              <p className="text-2xl font-black text-foreground">{mistakes.length}</p>
              <p className="text-xs text-muted-foreground">ошибок</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-background/55 p-3">
              <p className="text-2xl font-black text-foreground">{uniqueModuleCount}</p>
              <p className="text-xs text-muted-foreground">модулей</p>
            </div>
          </div>
        </div>
      </header>

      {mistakes.length === 0 ? (
        <article className="rounded-4xl border border-emerald-400/25 bg-emerald-500/10 p-5">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            Ошибок пока нет
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            После неправильной попытки в тесте вопрос появится здесь. После успешной пересдачи он уйдет из активных ошибок.
          </p>
        </article>
      ) : (
        <>
          {primaryMistake ? (
            <article className="overflow-hidden rounded-4xl border border-amber-400/25 bg-background/75 shadow-sm">
              <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_19rem]">
                <div className="space-y-4 p-5">
                  <div>
                    <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                      <Target className="h-3.5 w-3.5" />
                      Главная ошибка сейчас
                    </p>
                    <h2 className="mt-3 text-xl font-black leading-7 text-foreground">{primaryMistake.question}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Начните с этого вопроса: разберите разницу между вашим ответом и правильным, затем вернитесь в модуль и пересдайте квиз.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-rose-400/25 bg-rose-500/5 p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300">Ваш ответ</p>
                      <p className="mt-2 text-sm leading-6 text-foreground">
                        {primaryMistake.selectedAnswers.length > 0 ? primaryMistake.selectedAnswers.join(", ") : "Нет ответа"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/5 p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Верный ответ</p>
                      <p className="mt-2 text-sm leading-6 text-foreground">{primaryMistake.correctAnswers.join(", ")}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card/65 p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Источник</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{primaryMistake.moduleTitle}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatSubmittedAt(primaryMistake.submittedAt)}</p>
                    </div>
                  </div>
                </div>

                <aside className="border-t border-border bg-card/65 p-5 xl:border-l xl:border-t-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">План восстановления</p>
                  <div className="mt-3 space-y-3">
                    {[
                      { icon: ClipboardList, text: "Сравните свой ответ с верным и сформулируйте правило своими словами." },
                      { icon: BookOpenCheck, text: "Откройте модуль и повторите связанный блок теории или практики." },
                      { icon: RotateCcw, text: "Пересдайте квиз после короткого повторения, не сразу." },
                    ].map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <div key={step.text} className="flex gap-3 rounded-2xl border border-border bg-background/55 p-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-slate-950">
                            {index + 1}
                          </span>
                          <div>
                            <Icon className="h-4 w-4 text-amber-500" />
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 grid gap-2">
                    <Link
                      href={`/tracks/${primaryMistake.trackSlug}/modules/${primaryMistake.moduleId}`}
                      className="btn-secondary inline-flex w-full items-center justify-center gap-2"
                    >
                      Вернуться в модуль
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/tracks/${primaryMistake.trackSlug}/modules/${primaryMistake.moduleId}/quiz`}
                      className="btn-primary inline-flex w-full items-center justify-center gap-2"
                    >
                      Пересдать квиз
                      <RotateCcw className="h-4 w-4" />
                    </Link>
                  </div>
                </aside>
              </div>
            </article>
          ) : null}

          <div className="grid gap-3">
            {mistakes.map((item, index) => (
              <article key={item.id} className="rounded-3xl border border-border bg-card/70 p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {item.trackTitle} · {item.moduleTitle}
                  </p>
                  <h2 className="mt-1 text-base font-black leading-6 text-foreground">
                    {index + 1}. {item.question}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.quizTitle} · {formatSubmittedAt(item.submittedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link
                    href={`/tracks/${item.trackSlug}/modules/${item.moduleId}`}
                    className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-xs"
                  >
                    К модулю
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/tracks/${item.trackSlug}/modules/${item.moduleId}/quiz`}
                    className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-xs"
                  >
                    Повторить тест
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-2">
                <div className="rounded-2xl border border-rose-400/25 bg-rose-500/5 p-3">
                  <p className="inline-flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300">
                    <XCircle className="h-3.5 w-3.5" />
                    Ваш ответ
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {item.selectedAnswers.length > 0 ? item.selectedAnswers.join(", ") : "Нет ответа"}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/5 p-3">
                  <p className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Правильный ответ
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{item.correctAnswers.join(", ")}</p>
                </div>
              </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
