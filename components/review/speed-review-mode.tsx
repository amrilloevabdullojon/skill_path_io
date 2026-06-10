"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Bookmark, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { ReviewCard } from "@/features/review/speed-review";

const typeLabels: Record<ReviewCard["type"], string> = {
  mistake: "Ошибка",
  question: "Вопрос",
  summary: "Концепция",
  bookmark: "Закладка",
};

export function SpeedReviewMode({ cards }: { cards: ReviewCard[] }) {
  const [index, setIndex] = useState(0);
  const [revealedIndex, setRevealedIndex] = useState<number | null>(null);

  const current = cards[index] ?? null;
  const isRevealed = revealedIndex === index;
  const mistakeCount = cards.filter((card) => card.type === "mistake").length;
  const progress = cards.length > 0 ? ((index + 1) / cards.length) * 100 : 0;

  if (!current) {
    return (
      <section className="surface-elevated border border-border/50 bg-card p-5 rounded-2xl">
        <p className="text-sm text-foreground/70">У вас пока нет сохраненных карточек для повторения.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="surface-elevated border border-border/50 bg-card space-y-5 p-5 sm:p-7 rounded-2xl">
        <div className="space-y-2">
          <p className="kicker text-indigo-400">Тренировка после ошибок</p>
          <h2 className="page-title tracking-tight text-foreground">Закрепить слабые места</h2>
          <p className="text-sm text-foreground/70 max-w-2xl">
            Сначала идут ошибки из квизов, затем быстрые вопросы, конспекты и закладки. Цель не просто вспомнить ответ, а понять, что исправить в следующей попытке.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/50 bg-background/40 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/45">Ошибок в фокусе</p>
            <p className="mt-1 text-lg font-bold text-foreground">{mistakeCount}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-background/40 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/45">Всего карточек</p>
            <p className="mt-1 text-lg font-bold text-foreground">{cards.length}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-background/40 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/45">Сейчас</p>
            <p className="mt-1 text-lg font-bold text-foreground">{typeLabels[current.type]}</p>
          </div>
        </div>
      </header>

      <div className="relative isolate min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.article
            key={index}
            initial={{ opacity: 0, x: 20, rotateY: 10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -20, rotateY: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="surface-elevated border border-indigo-500/20 bg-card shadow-[0_8px_30px_rgba(99,102,241,0.1)] space-y-6 p-6 sm:p-8 rounded-2xl"
          >
            <div className="space-y-3 border-b border-border-subtle pb-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground/80">Карточка <span className="text-indigo-400">{index + 1}</span> из {cards.length}</p>
                <span className="inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                  {typeLabels[current.type]}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-background/70">
                <div className="h-full rounded-full bg-indigo-400 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
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
                        <p className="text-center text-sm text-foreground/55">Сформулируйте ответ своими словами, затем сравните с эталоном.</p>
                        <button
                          onClick={() => setRevealedIndex(index)}
                          className="btn-secondary rounded-full inline-flex items-center gap-2 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20"
                        >
                          <Eye className="w-4 h-4" />
                          {current.type === "mistake" ? "Разобрать ошибку" : "Открыть ответ"}
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
                          <button onClick={() => setRevealedIndex(null)} className="text-foreground/40 hover:text-foreground/80 transition-colors">
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

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => {
                  setIndex((prev) => (prev + 1) % cards.length);
                  setRevealedIndex(null);
                }}
                className="btn-primary gap-2 rounded-full"
              >
                {index + 1 === cards.length ? "Завершить круг" : "Следующая карточка"}
                <ArrowRight className="h-5 w-5" />
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setIndex(0);
                  setRevealedIndex(null);
                }}
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
                К закладкам
              </Link>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </section>
  );
}
