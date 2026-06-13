"use client";

import { motion } from "framer-motion";
import { Flame, Shield, Snowflake, Zap, Target } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

type DailyChallengePreview = {
  challengeType: string;
  title: string;
  goal: number;
  progress: number;
  isCompleted: boolean;
  xpReward: number;
};

type StreakPreview = {
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  isActiveToday: boolean;
};

export function DashboardFlameStreak({
  streak,
  challenge,
}: {
  streak: StreakPreview;
  challenge: DailyChallengePreview | null;
}) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (challenge) {
      const targetPercent = challenge.goal > 0 ? (challenge.progress / challenge.goal) * 100 : 0;
      const timeout = setTimeout(() => {
        setAnimatedProgress(Math.min(targetPercent, 100));
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [challenge]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* THE FLAME (Streak Counter) */}
      <motion.div
        whileHover={{ y: -2 }}
        className="relative col-span-1 border border-orange-500/30 bg-card p-8 rounded-4xl flex flex-col items-center justify-center text-center shadow-[0_15px_40px_rgba(249,115,22,0.1)] overflow-hidden"
      >
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full blur-[80px] pointer-events-none transition-all duration-700 ${
          streak.isActiveToday ? "bg-orange-500/40" : "bg-slate-500/20"
        }`} />

        <div className="relative z-10">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`inline-flex items-center justify-center h-28 w-28 rounded-full border-[4px] shadow-[0_0_40px_rgba(249,115,22,0.3)] ${
              streak.isActiveToday 
                ? "bg-gradient-to-br from-orange-400 to-rose-500 border-orange-500/50 text-primary-foreground" 
                : "bg-slate-800/80 border-slate-700 text-slate-500"
            }`}
          >
            <Flame className={`h-14 w-14 ${streak.isActiveToday ? "drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" : ""}`} />
          </motion.div>
          
          {streak.streakFreezes > 0 && (
            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-indigo-400 shadow-xl" title={`Заморозок стрейка: ${streak.streakFreezes}`}>
              <Snowflake className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="mt-6 space-y-1 relative z-10">
          <h2 className="page-title text-foreground tracking-tight drop-shadow-sm">
            {streak.currentStreak} {" "}
            <span className="text-lg font-bold text-foreground/50 uppercase tracking-widest ml-1">Дней</span>
          </h2>
          <p className={`text-sm mt-2 ${streak.isActiveToday ? "text-orange-400 font-bold tracking-wide" : "text-foreground/60 font-medium"}`}>
            {streak.isActiveToday ? "Вы в огне! 🔥" : "Пройдите урок, чтобы сохранить стрик"}
          </p>
        </div>
      </motion.div>

      {/* DAILY CHALLENGE */}
      <div className="surface-elevated border border-indigo-500/20 bg-card rounded-4xl p-6 sm:p-8 lg:col-span-2 flex flex-col justify-between relative overflow-hidden shadow-[0_8px_30px_rgba(99,102,241,0.08)]">
        <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none z-0" />
        
        <div className="flex flex-col sm:flex-row gap-6 items-start justify-between relative z-10">
          <div className="space-y-4 flex-1 w-full">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <Target className="h-5 w-5" />
              </span>
              <p className="kicker text-indigo-400 font-bold tracking-widest uppercase">Ежедневная цель</p>
            </div>
            
            <div>
              <h3 className="section-title text-foreground leading-tight">
                {challenge ? challenge.title : "Нет активного вызова"}
              </h3>
              <p className="text-sm text-foreground/70 mt-1.5 leading-relaxed">
                {challenge?.isCompleted 
                  ? "Потрясающая работа! Вы выполнили сегодняшнюю цель." 
                  : "Завершите миссию сегодня, чтобы получить бонусный XP и подняться в рейтинге."}
              </p>
            </div>

            {challenge && (
              <div className="pt-3">
                <div className="flex justify-between text-sm mb-2 font-bold">
                  <span className="text-foreground/70 uppercase tracking-wider text-[11px]">Прогресс</span>
                  <span className={challenge.isCompleted ? "text-emerald-400" : "text-indigo-400"}>
                    {challenge.progress} / {challenge.goal}
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${animatedProgress}%` }}
                    className={`h-full rounded-full transition-all duration-1000 ${
                      challenge.isCompleted 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                        : "bg-gradient-to-r from-indigo-400 to-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center sm:items-end gap-3 shrink-0 sm:min-w-[140px] w-full sm:w-auto mt-4 sm:mt-0">
            {challenge && (
              <div className="flex items-center gap-2 text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-5 py-2.5 rounded-xl w-full sm:w-auto justify-center">
                <Zap className="h-5 w-5" />
                <span>+{challenge.xpReward} XP</span>
              </div>
            )}
            
            {challenge?.isCompleted ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-5 py-2.5 rounded-xl w-full sm:w-auto justify-center">
                <Shield className="h-5 w-5" />
                <span>Завершено</span>
              </div>
            ) : (
              <Link href="/tracks" className="btn-primary w-full sm:w-auto">
                Начать обучение
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
