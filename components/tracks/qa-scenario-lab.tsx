"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, SearchCheck, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";

type ScenarioChoice = {
  id: string;
  label: string;
  feedback: string;
  correct?: boolean;
};

type ScenarioStep = {
  id: string;
  title: string;
  prompt: string;
  choices: ScenarioChoice[];
};

type QaScenarioLabProps = {
  moduleTitle: string;
  quizHref: string | null;
};

const SCENARIO_STEPS: ScenarioStep[] = [
  {
    id: "triage",
    title: "1. Первичная проверка",
    prompt: "Команда выкатила форму регистрации. Пользователь пишет: «Не могу создать аккаунт». Что проверите первым?",
    choices: [
      {
        id: "clear-cache",
        label: "Попросить очистить кеш и закрыть задачу",
        feedback: "Слишком рано. Кеш может быть причиной, но сначала нужно воспроизвести и понять условия ошибки.",
      },
      {
        id: "reproduce",
        label: "Повторить сценарий с теми же данными и окружением",
        feedback: "Верно. QA сначала фиксирует воспроизводимость: шаги, данные, браузер, ожидаемый и фактический результат.",
        correct: true,
      },
      {
        id: "rewrite",
        label: "Сразу предложить переписать форму",
        feedback: "Это решение без диагностики. Сначала нужны факты: где ломается сценарий и какой риск для пользователя.",
      },
    ],
  },
  {
    id: "severity",
    title: "2. Оценка риска",
    prompt: "Вы воспроизвели баг: кнопка Submit ничего не делает при валидных данных. Как оценить severity?",
    choices: [
      {
        id: "critical",
        label: "Высокая: пользователь не может завершить ключевой сценарий",
        feedback: "Да. Регистрация - ключевой путь. Если он заблокирован, это высокий продуктовый риск.",
        correct: true,
      },
      {
        id: "low",
        label: "Низкая: интерфейс просто не отвечает",
        feedback: "Низкая severity подходит для косметики. Здесь пользователь полностью заблокирован.",
      },
      {
        id: "none",
        label: "Не баг, потому что нет ошибки на экране",
        feedback: "Отсутствие сообщения об ошибке не отменяет дефект. Это может быть ещё и UX-проблемой.",
      },
    ],
  },
  {
    id: "report",
    title: "3. Баг-репорт",
    prompt: "Какой заголовок будет полезнее для разработчика?",
    choices: [
      {
        id: "bad-title",
        label: "Регистрация не работает",
        feedback: "Понятно, но слишком широко. Разработчику придётся уточнять условия.",
      },
      {
        id: "good-title",
        label: "Submit не создаёт аккаунт при валидных данных в Chrome",
        feedback: "Лучше: есть действие, результат, данные и окружение. Такой заголовок быстрее ведёт к исправлению.",
        correct: true,
      },
      {
        id: "emotional",
        label: "Срочно всё сломалось",
        feedback: "Эмоции не помогают triage. Нужны факты и воспроизводимые шаги.",
      },
    ],
  },
];

export function QaScenarioLab({ moduleTitle, quizHref }: QaScenarioLabProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const score = useMemo(() => {
    return SCENARIO_STEPS.reduce((total, step) => {
      const selected = step.choices.find((choice) => choice.id === answers[step.id]);
      return total + (selected?.correct ? 1 : 0);
    }, 0);
  }, [answers]);

  const completed = Object.keys(answers).length === SCENARIO_STEPS.length;

  return (
    <section id="scenario-lab" className="surface-elevated overflow-hidden border border-emerald-400/25 bg-card/40 backdrop-blur-md">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5 p-5 sm:p-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
              <SearchCheck className="h-4 w-4" />
              QA симулятор
            </span>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Первое расследование бага</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {moduleTitle}: вместо длинной теории пройдите короткий рабочий сценарий и соберите основу первого баг-репорта.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {SCENARIO_STEPS.map((step) => {
              const selectedId = answers[step.id];
              const selected = step.choices.find((choice) => choice.id === selectedId);

              return (
                <article key={step.id} className="rounded-2xl border border-border/50 bg-slate-950/25 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.prompt}</p>
                    </div>
                    {selected?.correct ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" /> : null}
                  </div>

                  <div className="mt-4 grid gap-2">
                    {step.choices.map((choice) => {
                      const isSelected = selectedId === choice.id;

                      return (
                        <button
                          key={choice.id}
                          type="button"
                          onClick={() => setAnswers((current) => ({ ...current, [step.id]: choice.id }))}
                          className={cn(
                            "rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                            isSelected && choice.correct && "border-emerald-300/45 bg-emerald-400/10 text-emerald-100",
                            isSelected && !choice.correct && "border-amber-300/35 bg-amber-400/10 text-amber-100",
                            !isSelected && "border-border/50 bg-card/35 text-muted-foreground hover:border-emerald-300/30 hover:text-foreground",
                          )}
                        >
                          {choice.label}
                        </button>
                      );
                    })}
                  </div>

                  {selected ? (
                    <p className="mt-3 rounded-xl border border-border/50 bg-background/35 px-3 py-2 text-sm leading-relaxed text-muted-foreground">
                      {selected.feedback}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>

        <aside className="border-t border-border/50 bg-slate-950/25 p-5 lg:border-l lg:border-t-0">
          <div className="sticky top-24 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Результат</p>
              <p className="mt-2 text-4xl font-semibold text-foreground">{score}/{SCENARIO_STEPS.length}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {completed ? "Сценарий завершён. Теперь закрепите результат в задании или тесте." : "Ответьте на три рабочих вопроса."}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-100">
                <ClipboardCheck className="h-4 w-4" />
                Артефакт
              </p>
              <ul className="mt-3 space-y-2 text-sm text-emerald-100/75">
                <li>Шаги воспроизведения</li>
                <li>Severity и продуктовый риск</li>
                <li>Заголовок баг-репорта</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/35 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldAlert className="h-4 w-4 text-amber-300" />
                Правило QA
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Хороший тестировщик не просто находит ошибку. Он снижает неопределённость для команды.
              </p>
            </div>

            {quizHref ? (
              <Link href={quizHref} className="btn-primary inline-flex w-full items-center justify-center gap-2">
                Закрепить в квизе
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
