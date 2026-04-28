"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Bookmark, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { ReviewCard } from "@/features/review/speed-review";

export function SpeedReviewMode({ cards }: { cards: ReviewCard[] }) {
  const [index, setIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const current = cards[index] ?? null;

  // Сброс состояния при смене карточки
  useEffect(() => {
    setIsRevealed(false);
  }, [index]);

  if (!current) {
    return (
      <section className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md p-5 rounded-2xl">
        <p className="text-sm text-foreground/70">У вас пока нет сохраненных карточек для повторения.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md space-y-2 p-5 sm:p-7 rounded-[24px]">
        <p className="kicker text-indigo-400">Быстрое повторение</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Режим проверки знаний</h1>
        <p className="text-sm text-foreground/70 max-w-xl">
          Ключевые идеи, частые ошибки, быстрые вопросы и ваши закладки в одном месте.
        </p>
      </header>

      <div className="relative isolate min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.article
            key={index}
            initial={{ opacity: 0, x: 20, rotateY: 10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -20, rotateY: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="surface-elevated border border-indigo-500/20 bg-card/60 backdrop-blur-xl shadow-[0_8px_30px_rgba(99,102,241,0.1)] space-y-6 p-6 sm:p-8 rounded-[24px]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-4">
              <p className="text-sm font-semibold text-foreground/80">Карточка <span className="text-indigo-400">{index + 1}</span> из {cards.length}</p>
              <span className="inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                {current.type === "question" ? "Вопрос" : current.type === "summary" ? "Концепция" : current.type}
              </span>
            </div>

            <div className="space-y-4 min-h-[160px] pb-4">
              <p className="text-xl font-bold text-foreground leading-tight">{current.title}</p>
              
              <div className="space-y-4">
                <div className="rounded-xl bg-card/40 p-4 border border-border/30">
                  <p className="text-sm font-semibold text-indigo-400 mb-1 uppercase tracking-wide">Вопрос / Контекст</p>
                  <p className="text-base text-foreground/90 leading-relaxed">{current.detail}</p>
                </div>

                {current.answer && (
                  <div className="relative overflow-hidden rounded-xl bg-indigo-950/20 border border-indigo-500/20 p-4 transition-all">
                    {!isRevealed ? (
                      <div className="flex flex-col items-center justify-center p-4 gap-3">
                        <p className="text-sm text-foreground/50">Ответ скрыт для проверки знаний</p>
                        <button
                          onClick={() => setIsRevealed(true)}
                          className="btn-secondary rounded-full inline-flex items-center gap-2 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20"
                        >
                          <Eye className="w-4 h-4" />
                          Посмотреть ответ
                        </button>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-emerald-400 mb-1 uppercase tracking-wide">Правильный ответ</p>
                          <button onClick={() => setIsRevealed(false)} className="text-foreground/40 hover:text-foreground/80 transition-colors">
                            <EyeOff className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-base text-foreground/90 leading-relaxed">{current.answer}</p>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/40">
              <button
                type="button"
                onClick={() => setIndex((prev) => (prev + 1) % cards.length)}
                className="btn-primary inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] border-indigo-400 font-bold px-6 py-2.5 rounded-full"
              >
                Следующая карточка
                <ArrowRight className="h-5 w-5" />
              </button>
              <button 
                type="button" 
                onClick={() => setIndex(0)} 
                className="btn-secondary inline-flex items-center justify-center gap-2 rounded-full px-5 hover:bg-card/80 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Начать заново
              </button>
              <Link 
                href="/bookmarks" 
                className="btn-secondary inline-flex items-center justify-center gap-2 rounded-full px-5 hover:bg-card/80 transition-colors ml-auto"
              >
                <Bookmark className="h-4 w-4" />
                Закладки
              </Link>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </section>
  );
}
