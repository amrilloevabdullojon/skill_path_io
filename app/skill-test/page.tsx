"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Sparkles, Target, BarChart3, Bot, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { LandingSkillRadarDemo } from "@/components/landing/landing-skill-radar-demo";

type GoalKey = "qa" | "ba" | "da" | "explore";

type Scenario = {
  id: string;
  title: string;
  options: string[];
  correctIndex: number;
};

type GoalDef = {
  key: GoalKey;
  label: string;
  trackHref: string;
  trackLabel: string;
  scenarios: Scenario[];
};

const goalDefs: GoalDef[] = [
  {
    key: "qa",
    label: "Войти в IT как QA инженер",
    trackHref: "/tracks/qa-engineer",
    trackLabel: "Открыть трек QA Инженер",
    scenarios: [
      {
        id: "qa-bug-triage",
        title: "Пользователь жалуется, что приложение «иногда» вылетает после логина. Ваши первые действия?",
        options: [
          "Сразу назначу баг разработчику для фикса",
          "Запрошу информацию: ОС, версию приложения и точные шаги воспроизведения",
          "Закрою тикет со статусом «Не воспроизводится»",
          "Попробую воспроизвести через свой аккаунт без сбора данных",
        ],
        correctIndex: 1,
      },
      {
        id: "qa-priority-severity",
        title: "Баг ломает оплату для 0.5% пользователей. Какая связка severity/priority корректна?",
        options: [
          "Severity: Low, Priority: Low",
          "Severity: High, Priority: Low",
          "Severity: High, Priority: High",
          "Severity: Low, Priority: High",
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    key: "ba",
    label: "Стать Бизнес-аналитиком (BA)",
    trackHref: "/tracks/business-analyst",
    trackLabel: "Открыть трек Business Analyst",
    scenarios: [
      {
        id: "ba-discovery",
        title: "Стейкхолдер говорит: «Нужно сделать сортировку лучше». Ваш следующий шаг?",
        options: [
          "Сразу пишу user story «Как пользователь, я хочу сортировку…»",
          "Уточняю: какую проблему она решает и для какой роли пользователя",
          "Передаю задачу команде разработки в спринт",
          "Рисую прототип сортировки в Figma",
        ],
        correctIndex: 1,
      },
      {
        id: "ba-acceptance",
        title: "Какой критерий приёмки сформулирован корректно?",
        options: [
          "«Сортировка должна работать корректно»",
          "«Пользователь видит список товаров»",
          "«Дано: каталог из 100+ товаров. Когда пользователь выбирает «по цене ↑», тогда товары сортируются за < 500 мс»",
          "«Кнопка сортировки видна на странице»",
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    key: "da",
    label: "Прокачать навыки в Data Analytics (DA)",
    trackHref: "/tracks/data-analyst",
    trackLabel: "Открыть трек Data Analyst",
    scenarios: [
      {
        id: "da-sql-having",
        title: "Какой SQL-оператор фильтрует данные ПОСЛЕ группировки (GROUP BY)?",
        options: ["WHERE", "LIMIT", "HAVING", "ORDER BY"],
        correctIndex: 2,
      },
      {
        id: "da-retention-metric",
        title: "Команда хочет понять, насколько хорошо приложение удерживает новых пользователей. Какая метрика подходит лучше всего?",
        options: [
          "DAU (Daily Active Users)",
          "Day-7 retention rate по когорте",
          "Количество установок за месяц",
          "Средняя длительность сессии",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    key: "explore",
    label: "Я пока просто изучаю платформу",
    trackHref: "/tracks",
    trackLabel: "Смотреть все треки",
    scenarios: [],
  },
];

type AnswerRecord = { questionId: string; selectedIndex: number; correctIndex: number };

type Insight = {
  goalKey: GoalKey;
  headline: string;
  level: "exploring" | "novice" | "growing" | "ready";
  levelLabel: string;
  scorePercent: number;
  trackHref: string;
  trackLabel: string;
};

function buildInsight(goalKey: GoalKey, answers: AnswerRecord[]): Insight {
  const goal = goalDefs.find((g) => g.key === goalKey) ?? goalDefs[3];

  const scored = answers.filter((a) => a.questionId !== "goal");
  const correct = scored.filter((a) => a.selectedIndex === a.correctIndex).length;
  const total = scored.length;
  const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0;

  if (goalKey === "explore") {
    return {
      goalKey,
      headline: "Вы только знакомитесь с платформой — это нормально. Загляните в один из треков, чтобы понять рабочий темп.",
      level: "exploring",
      levelLabel: "Знакомство",
      scorePercent: 0,
      trackHref: goal.trackHref,
      trackLabel: goal.trackLabel,
    };
  }

  let level: Insight["level"];
  let levelLabel: string;
  let headline: string;

  if (scorePercent === 100) {
    level = "ready";
    levelLabel = "Готов к практике";
    headline = "Сильный старт: базовые принципы уже понятны. Переходите сразу к практическим миссиям трека.";
  } else if (scorePercent >= 50) {
    level = "growing";
    levelLabel = "На полпути";
    headline = "База есть, но рабочие нюансы стоит закрепить. Сфокусируйтесь на модулях практики и приёмки.";
  } else {
    level = "novice";
    levelLabel = "Старт с фундамента";
    headline = "Начните с фундаментальных модулей трека: разберёте принципы, на которых строится всё остальное.";
  }

  return {
    goalKey,
    headline,
    level,
    levelLabel,
    scorePercent,
    trackHref: goal.trackHref,
    trackLabel: goal.trackLabel,
  };
}

const RESULT_STORAGE_KEY = "levio:skill-test:result";

function resultActions(insight: Insight) {
  if (insight.goalKey === "explore") {
    return [
      "Откройте каталог треков и сравните QA, BA и Data по первым модулям.",
      "Выберите один трек как временную гипотезу на неделю.",
      "Вернитесь к аудиту после первого модуля, когда появится больше контекста.",
    ];
  }

  if (insight.level === "ready") {
    return [
      "Откройте рекомендованный трек и переходите к практическим миссиям.",
      "Соберите первый артефакт для портфолио: баг-репорт, user story или аналитический вывод.",
      "Проверьте пробелы через квиз перед следующей симуляцией.",
    ];
  }

  if (insight.level === "growing") {
    return [
      "Начните с базового модуля, но не задерживайтесь на длинной теории.",
      "После урока сразу сделайте короткое рабочее задание.",
      "Используйте личный план, чтобы платформа подсветила слабые места.",
    ];
  }

  return [
    "Сначала соберите личный план: он уберёт лишние темы и задаст спокойный темп.",
    "Пройдите вводный модуль выбранного трека и зафиксируйте основные термины.",
    "После первого результата переходите к практике, даже если теория ещё не идеальна.",
  ];
}

export default function SkillTestPage() {
  // Step: -1 = welcome, 0 = goal, 1..N = scenarios, "loading", "results"
  const [step, setStep] = useState<number | "loading" | "results">(-1);
  const [goalKey, setGoalKey] = useState<GoalKey | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  const activeScenarios = useMemo(
    () => (goalKey ? goalDefs.find((g) => g.key === goalKey)?.scenarios ?? [] : []),
    [goalKey],
  );
  const totalQuestions = 1 + activeScenarios.length;

  const insight = useMemo(() => buildInsight(goalKey ?? "explore", answers), [goalKey, answers]);

  // Loading transition
  useEffect(() => {
    if (step === "loading") {
      const timer = setTimeout(() => setStep("results"), 900);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Persist insight to sessionStorage for downstream funnels (/login, /onboarding)
  useEffect(() => {
    if (step === "results" && typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(
          RESULT_STORAGE_KEY,
          JSON.stringify({
            goalKey,
            scorePercent: insight.scorePercent,
            level: insight.level,
            answers,
            takenAt: new Date().toISOString(),
          }),
        );
      } catch {
        // ignore storage errors
      }
    }
  }, [step, goalKey, insight, answers]);

  function handleGoalSelect(index: number) {
    const goal = goalDefs[index];
    setGoalKey(goal.key);
    setAnswers([{ questionId: "goal", selectedIndex: index, correctIndex: -1 }]);

    // Explore: skip scenarios entirely
    if (goal.scenarios.length === 0) {
      setStep("loading");
    } else {
      setStep(1);
    }
  }

  function handleScenarioAnswer(scenarioIndex: number, optionIndex: number) {
    const scenario = activeScenarios[scenarioIndex];
    const next: AnswerRecord = {
      questionId: scenario.id,
      selectedIndex: optionIndex,
      correctIndex: scenario.correctIndex,
    };
    const updated = [...answers, next];
    setAnswers(updated);

    if (scenarioIndex + 1 < activeScenarios.length) {
      setStep(scenarioIndex + 2); // step is 1-indexed for scenarios (step 1 = first scenario)
    } else {
      setStep("loading");
    }
  }

  function restart() {
    setStep(-1);
    setGoalKey(null);
    setAnswers([]);
  }

  function goBack() {
    if (typeof step !== "number") return;
    if (step === 0) {
      setStep(-1);
      return;
    }
    if (step === 1) {
      // Going back from first scenario → back to goal selection
      setGoalKey(null);
      setAnswers([]);
      setStep(0);
      return;
    }
    // Going back one scenario
    setAnswers((prev) => prev.slice(0, -1));
    setStep((s) => (typeof s === "number" ? s - 1 : s));
  }

  // Build the current question
  const isWelcome = step === -1;
  const isGoal = step === 0;
  const scenarioIndex = typeof step === "number" && step >= 1 ? step - 1 : -1;
  const isScenario = scenarioIndex >= 0 && scenarioIndex < activeScenarios.length;
  const currentQuestionNumber = typeof step === "number" && step >= 0 ? step + 1 : 0;
  const isLoading = step === "loading";
  const isResults = step === "results";

  const currentScenario = isScenario ? activeScenarios[scenarioIndex] : null;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.22)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.18)_1px,transparent_1px)] bg-[size:44px_44px]"
        aria-hidden
      />

      <Link
        href="/"
        className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 font-semibold text-foreground z-10"
        aria-label="На главную"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-500/15 text-sky-200">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        Levio
      </Link>

      <div className="w-full max-w-2xl relative z-10">
        <AnimatePresence mode="wait">
          {/* WELCOME */}
          {isWelcome && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="surface-elevated border border-border/50 bg-card p-8 sm:p-12 rounded-2xl text-center space-y-6"
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-sky-500/10 border border-sky-400/20 text-sky-400 mb-2">
                <Target className="h-8 w-8" aria-hidden />
              </div>
              <h1 className="text-3xl sm:page-title tracking-tight text-foreground text-balance">
                Найдём ваши точки роста
                <br className="max-sm:hidden" /> за 2 минуты
              </h1>
              <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                Выберите цель и ответьте на 2 рабочих сценария. Регистрация не нужна — результат сохраним локально.
              </p>
              <button
                onClick={() => setStep(0)}
                className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Начать аудит навыков
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </button>
            </motion.div>
          )}

          {/* GOAL QUESTION */}
          {isGoal && (
            <motion.div
              key="question-goal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-8">
                <button
                  type="button"
                  onClick={goBack}
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Назад
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">Вопрос 1</span> из {goalKey ? totalQuestions : "3"}
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-foreground leading-snug">
                Какая у вас основная карьерная цель?
              </h2>

              <div className="grid gap-3 pt-4">
                {goalDefs.map((goal, index) => (
                  <button
                    key={goal.key}
                    type="button"
                    onClick={() => handleGoalSelect(index)}
                    className="group relative p-4 sm:p-5 flex items-center justify-between text-left rounded-xl border border-border/50 bg-card/40 hover:bg-sky-500/10 hover:border-sky-500/30 backdrop-blur-md transition-all shadow-sm hover:shadow-[0_4px_20px_rgba(14,165,233,0.15)] outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <span className="text-foreground font-medium group-hover:text-sky-100 transition-colors">{goal.label}</span>
                    <div className="h-4 w-4 rounded-full border border-border/70 shrink-0 ml-4 group-hover:border-sky-400 group-hover:bg-sky-400/20 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* SCENARIO QUESTIONS */}
          {isScenario && currentScenario && (
            <motion.div
              key={`scenario-${currentScenario.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-8">
                <button
                  type="button"
                  onClick={goBack}
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Назад
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">Вопрос {currentQuestionNumber}</span> из {totalQuestions}
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-foreground leading-snug">
                {currentScenario.title}
              </h2>

              <div className="grid gap-3 pt-4">
                {currentScenario.options.map((opt, optIdx) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleScenarioAnswer(scenarioIndex, optIdx)}
                    className="group relative p-4 sm:p-5 flex items-center justify-between text-left rounded-xl border border-border/50 bg-card/40 hover:bg-sky-500/10 hover:border-sky-500/30 backdrop-blur-md transition-all shadow-sm hover:shadow-[0_4px_20px_rgba(14,165,233,0.15)] outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <span className="text-foreground font-medium group-hover:text-sky-100 transition-colors">{opt}</span>
                    <div className="h-4 w-4 rounded-full border border-border/70 shrink-0 ml-4 group-hover:border-sky-400 group-hover:bg-sky-400/20 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* LOADING */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center p-12 text-center space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-sky-500/20 animate-ping" />
                <div className="h-16 w-16 relative surface-elevated border border-border/50 bg-card rounded-full flex items-center justify-center">
                  <Bot className="h-8 w-8 text-sky-400" aria-hidden />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Считаем ваш результат…</h3>
                <p className="text-sm text-muted-foreground">Сопоставляем ответы с базовыми бенчмарками трека.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RESULTS (Full width outside max-w-2xl) */}
      <AnimatePresence>
        {isResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl relative z-10 mt-16"
          >
            <div className="text-center space-y-3 mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <BarChart3 className="h-4 w-4" aria-hidden /> Аудит завершён
              </div>
              <h2 className="text-3xl sm:page-title text-foreground">Ваш радар навыков</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                {insight.headline}
              </p>
            </div>

            <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
              <LandingSkillRadarDemo />

              <div className="surface-elevated border border-border/50 bg-card p-6 sm:p-8 rounded-2xl space-y-6 sticky top-6">
                {/* Score summary (skip for explore goal) */}
                {goalKey !== "explore" && goalKey !== null && (
                  <div className="rounded-xl border border-border-subtle bg-card/60 p-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Уровень</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{insight.levelLabel}</p>
                      </div>
                      <p className="metric-value tabular-nums">
                        {insight.scorePercent}<span className="text-base font-normal text-muted-foreground">%</span>
                      </p>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      {answers
                        .filter((a) => a.questionId !== "goal")
                        .map((a) => {
                          const isCorrect = a.selectedIndex === a.correctIndex;
                          return (
                            <div key={a.questionId} className="flex items-center gap-2 text-xs text-muted-foreground">
                              {isCorrect ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
                              ) : (
                                <X className="h-3.5 w-3.5 text-rose-400" aria-hidden />
                              )}
                              <span>{isCorrect ? "Верный ответ" : "Не угадали — этот блок стоит подтянуть"}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-foreground">Соберите личный план</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Результат уже сохранён в этом браузере. Следующий экран перенесёт направление, уровень и первый шаг в ваш учебный профиль.
                  </p>
                </div>

                <div className="rounded-lg border border-border-subtle bg-card/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Что делать дальше</p>
                  <div className="mt-3 space-y-3">
                    {resultActions(insight).map((action, index) => (
                      <div key={action} className="flex gap-3 text-sm text-muted-foreground">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/10 text-[10px] font-semibold text-sky-300">
                          {index + 1}
                        </span>
                        <span className="leading-relaxed">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-border-subtle">
                  <Link href="/onboarding" className="btn-primary w-full py-3.5 hover:bg-sky-400 transition-colors text-center">
                    Собрать личный план
                  </Link>
                  <Link href={insight.trackHref} className="btn-secondary w-full py-3.5 inline-flex items-center justify-center gap-2">
                    {insight.trackLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <button
                    type="button"
                    onClick={restart}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full pt-2"
                  >
                    Пройти аудит заново
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
