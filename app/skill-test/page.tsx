"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Sparkles, Target, BarChart3, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { LandingSkillRadarDemo } from "@/components/landing/landing-skill-radar-demo";

const questions = [
  {
    id: "goal",
    title: "Какая у вас основная карьерная цель?",
    options: [
      "Войти в IT как QA инженер",
      "Стать Бизнес-аналитиком (BA)",
      "Прокачать навыки в Data Analytics (DA)",
      "Я пока просто изучаю платформу",
    ],
  },
  {
    id: "scenario_1",
    title: "Сценарий: Пользователь жалуется, что приложение «иногда» вылетает после логина. Ваши первые действия?",
    options: [
      "Сразу назначу баг разработчику для фикса.",
      "Запрошу информацию: ОС, девайс и точные шаги воспроизведения.",
      "Проверю серверные логи на наличие всплеска 500-х ошибок.",
      "Закрою тикет со статусом 'Не воспроизводится'.",
    ],
  },
  {
    id: "scenario_2",
    title: "Вы пишете SQL-запрос для подсчета активных юзеров. Какой оператор фильтрует данные ПОСЛЕ группировки (GROUP BY)?",
    options: [
      "WHERE",
      "LIMIT",
      "HAVING",
      "ORDER BY",
    ],
  },
];

export default function SkillTestPage() {
  const [step, setStep] = useState(-1); // -1 = Welcome, 0-2 = Questions, 3 = Loading, 4 = Results
  const [, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => setStep(4), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  function handleOptionSelect(questionId: string, option: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    if (step < questions.length - 1) {
      setStep((s) => s + 1);
    } else {
      setStep(3); // Go to loading
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[50%] rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      <Link href="/" className="absolute top-6 flex items-center justify-center font-semibold text-foreground z-10 w-full ml-6 left-0">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-500/15 text-sky-200 mr-2">
          <Sparkles className="h-4 w-4" />
        </span>
        Levio
      </Link>

      <div className="w-full max-w-2xl relative z-10">
        <AnimatePresence mode="wait">
          
          {/* WELCOME */}
          {step === -1 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-xl p-8 sm:p-12 rounded-[24px] text-center space-y-6"
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-sky-500/10 border border-sky-400/20 text-sky-400 mb-2">
                <Target className="h-8 w-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
                Найдем ваши точки роста
                <br className="max-sm:hidden" /> за 2 минуты
              </h1>
              <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                Пройдите наш ИИ-тест, чтобы узнать сильные стороны и получить персональную дорожную карту. Регистрация не требуется.
              </p>
              <button
                onClick={() => setStep(0)}
                className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base mt-4 shadow-[0_4px_24px_rgba(56,189,248,0.25)] hover:scale-105 active:scale-95 transition-all"
              >
                Начать аудит навыков <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </motion.div>
          )}

          {/* QUESTIONS */}
          {step >= 0 && step < questions.length && (
            <motion.div
              key={`question-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-8">
                <button 
                  onClick={() => setStep(s => s - 1)} 
                  className="hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Назад
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">Вопрос {step + 1}</span> из {questions.length}
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-foreground leading-snug">
                {questions[step].title}
              </h2>

              <div className="grid gap-3 pt-4">
                {questions[step].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(questions[step].id, opt)}
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
          {step === 3 && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center p-12 text-center space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-sky-500/20 animate-ping" />
                <div className="h-16 w-16 relative surface-elevated border border-border/50 bg-card/40 backdrop-blur-xl rounded-full flex items-center justify-center">
                  <Bot className="h-8 w-8 text-sky-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">ИИ анализирует ваш профиль...</h3>
                <p className="text-sm text-muted-foreground">Сопоставляем ответы с рыночными бенчмарками.</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* RESULTS (Full width outside max-w-2xl) */}
      <AnimatePresence>
        {step === 4 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl relative z-10 mt-16"
          >
            <div className="text-center space-y-3 mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <BarChart3 className="h-4 w-4" /> Аудит завершен
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Ваш Радар Навыков</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                На основе ваших ответов мы составили профиль компетенций. У вас сильное логическое мышление, но стоит сфокусироваться на технической автоматизации.
              </p>
            </div>

            <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
              <LandingSkillRadarDemo />

              <div className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-xl p-6 sm:p-8 rounded-[24px] space-y-6 sticky top-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Откройте личный план</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Создайте бесплатный аккаунт, чтобы сохранить этот профиль. Наш ИИ-ментор сгенерирует пошаговый план, чтобы закрыть пробелы и подготовить вас к офферу.
                  </p>
                </div>
                <div className="space-y-3 pt-2 border-t border-border/40">
                  <Link href="/login" className="btn-primary w-full py-3.5 shadow-[0_4px_24px_rgba(56,189,248,0.25)] hover:bg-sky-400 transition-colors">
                    Создать аккаунт
                  </Link>
                  <button onClick={() => setStep(-1)} className="btn-secondary w-full py-3.5 bg-transparent border-transparent hover:bg-muted/50">
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
