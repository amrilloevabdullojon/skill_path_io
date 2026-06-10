"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Compass, ShieldCheck, Sparkles, Target, UserRound, Zap } from "lucide-react";

import { LocalLoginPanel } from "@/components/auth/local-login-panel";
import { SkillTestPreroll } from "@/components/auth/skill-test-preroll";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EntryExperienceProps = {
  mode: "guest" | "member";
  enableDemoAccess?: boolean;
  member?: {
    name: string;
    role: "ADMIN" | "STUDENT";
    totalXp: number;
    overallProgress: number;
    primaryTrackTitle: string;
    nextMissionTitle: string | null;
    continueHref: string;
    roadmapHref: string;
    mentorHref: string;
  };
};

function MotionCard({
  children,
  delay = 0,
  className
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function EntryExperience({ mode, enableDemoAccess = false, member }: EntryExperienceProps) {
  return (
    <section className="relative overflow-hidden rounded-4xl p-4 sm:p-6 lg:p-10 border border-border-subtle shadow-[0_8px_40px_rgba(0,0,0,0.06)] bg-card/40 backdrop-blur-3xl min-h-[500px] flex flex-col justify-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -left-32 top-[-150px] h-[400px] w-[500px] rounded-full bg-indigo-500/15 blur-[120px]"
          animate={{ x: [0, 20, 0], y: [0, 25, 0] }}
          transition={{ duration: 14, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[-100px] bottom-[-150px] h-[450px] w-[450px] rounded-full bg-violet-500/15 blur-[120px]"
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[1200px] mx-auto">
        {mode === "member" && member ? (
          <div className="grid items-stretch gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <MotionCard className="flex flex-col h-full">
              <article className="h-full flex flex-col justify-between surface-elevated border border-border/50 bg-card rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_8px_30px_rgba(99,102,241,0.06)]">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/5 blur-[80px] pointer-events-none rounded-full" />
                <div className="space-y-6 relative z-10">
                  <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                    <Sparkles className="h-4 w-4" />
                    С возвращением
                  </div>
                  <div>
                    <h1 className="hero-title text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70">
                      Ваш командный центр обучения
                    </h1>
                    <p className="mt-3 text-base text-foreground/60 max-w-[500px]">
                      {member.name}, рабочее пространство {member.role === "ADMIN" ? "администратора" : "студента"} готово к новым свершениями.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3 pt-4">
                    <div className="surface-subtle p-4 rounded-2xl border border-border-subtle hover:bg-background/60 transition-colors">
                      <p className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest">
                        <Zap className="h-3.5 w-3.5" />
                        Опыт
                      </p>
                      <p className="mt-1.5 text-2xl font-black text-foreground drop-shadow-sm">{member.totalXp} <span className="text-sm font-semibold text-foreground/40">XP</span></p>
                    </div>
                    <div className="surface-subtle p-4 rounded-2xl border border-border-subtle hover:bg-background/60 transition-colors">
                      <p className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                        <Target className="h-3.5 w-3.5" />
                        Прогресс
                      </p>
                      <p className="mt-1.5 text-2xl font-black text-foreground drop-shadow-sm">{member.overallProgress}%</p>
                    </div>
                    <div className="surface-subtle p-4 rounded-2xl border border-border-subtle hover:bg-background/60 transition-colors">
                      <p className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-400 uppercase tracking-widest">
                        <Compass className="h-3.5 w-3.5" />
                        Трек
                      </p>
                      <p className="mt-1.5 truncate text-lg font-black text-foreground drop-shadow-sm">{member.primaryTrackTitle}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-8 relative z-10 w-full mt-auto">
                  <Link href={member.continueHref} className="flex-1 sm:flex-none inline-flex items-center justify-center h-12 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-500 hover:from-indigo-400 hover:to-indigo-400 text-primary-foreground font-bold tracking-wide shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:-translate-y-0.5">
                    Продолжить
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link href={member.roadmapHref} className={cn(buttonVariants({ variant: "outline" }), "flex-1 sm:flex-none h-12 px-6 rounded-xl border-border/50 bg-background/50 backdrop-blur-md hover:bg-background font-bold tracking-wide")}>
                    План обучения
                  </Link>
                  <Link href={member.mentorHref} className={cn(buttonVariants({ variant: "secondary" }), "flex-1 sm:flex-none h-12 px-5 rounded-xl font-bold tracking-wide bg-violet-500/10 text-violet-400 hover:bg-violet-500/20")}>
                    <Bot className="h-4 w-4 mr-2" />
                    AI Ментор
                  </Link>
                </div>
              </article>
            </MotionCard>

            <div className="space-y-6 flex flex-col h-full">
              <MotionCard delay={0.15} className="flex-1">
                <Link href="/missions" className="block h-full group">
                  <article className="h-full surface-elevated border border-border/50 bg-card rounded-3xl p-6 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300 relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-violet-500/10 blur-[40px] pointer-events-none group-hover:bg-violet-500/20 transition-colors" />
                    <p className="text-xs font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5 mb-2 relative z-10">
                      <Target className="h-3.5 w-3.5" />
                      Следующая миссия
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground leading-tight relative z-10 group-hover:text-violet-300 transition-colors">
                      {member.nextMissionTitle ?? "Выберите новую миссию"}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-violet-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all z-10 relative">
                      К миссии <ArrowRight className="h-4 w-4" />
                    </div>
                  </article>
                </Link>
              </MotionCard>
              <MotionCard delay={0.25} className="flex-1">
                <article className="h-full surface-elevated border border-border/50 bg-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-center">
                   <div className="absolute top-0 right-0 h-full w-full bg-gradient-to-br from-transparent to-indigo-500/5 pointer-events-none" />
                  <p className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 relative z-10">
                    <Bot className="h-4 w-4" />
                    AI Поддержка
                  </p>
                  <p className="text-base text-foreground/70 leading-relaxed relative z-10 font-medium">
                    Используйте чат с ментором для получения подсказок по модулям и персональных планов восстановления при ошибках.
                  </p>
                </article>
              </MotionCard>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <SkillTestPreroll />
            <div className="grid items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
            <div className="space-y-6 flex flex-col justify-center">
              <MotionCard>
                <article className="surface-elevated border border-border/50 bg-card rounded-3xl space-y-6 p-6 sm:p-8 relative overflow-hidden">
                   <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-indigo-500/10 blur-[60px] pointer-events-none rounded-full" />
                  <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)] relative z-10">
                    <Sparkles className="h-3.5 w-3.5" />
                    Levio
                  </div>
                  <h1 className="page-title tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70 sm:text-5xl leading-[1.1] relative z-10">
                    Анализируйте. Практикуйте. Становитесь профи.
                  </h1>
                  <p className="text-base text-foreground/60 max-w-[450px] relative z-10 font-medium">
                    Локальная демонстрационная версия для отработки ролевых сценариев с премиум UI, менторством ИИ и миссиями.
                  </p>
                </article>
              </MotionCard>
              <div className="grid gap-4 sm:grid-cols-3">
                <MotionCard delay={0.1}>
                  <article className="surface-subtle border border-border-subtle bg-card/30 backdrop-blur-sm p-5 rounded-xl transition-all hover:bg-card/60">
                    <Target className="h-6 w-6 text-indigo-400 mb-3" />
                    <p className="text-sm font-bold text-foreground">Прогресс</p>
                    <p className="mt-1.5 text-xs font-medium text-foreground/50 leading-relaxed">Модули, квизы, система достижения и рост на базе XP.</p>
                  </article>
                </MotionCard>
                <MotionCard delay={0.2}>
                  <article className="surface-subtle border border-border-subtle bg-card/30 backdrop-blur-sm p-5 rounded-xl transition-all hover:bg-card/60">
                    <Compass className="h-6 w-6 text-emerald-400 mb-3" />
                    <p className="text-sm font-bold text-foreground">Миссии</p>
                    <p className="mt-1.5 text-xs font-medium text-foreground/50 leading-relaxed">Применяйте навыки в реальных задачах для QA, BA и DA.</p>
                  </article>
                </MotionCard>
                <MotionCard delay={0.3}>
                  <article className="surface-subtle border border-border-subtle bg-card/30 backdrop-blur-sm p-5 rounded-xl transition-all hover:bg-card/60">
                    <Bot className="h-6 w-6 text-violet-400 mb-3" />
                    <p className="text-sm font-bold text-foreground">AI Ментор</p>
                    <p className="mt-1.5 text-xs font-medium text-foreground/50 leading-relaxed">Персональное сопровождение и подробный фидбек.</p>
                  </article>
                </MotionCard>
              </div>
            </div>

            <MotionCard delay={0.25} className="flex flex-col justify-center h-full">
              <div className="space-y-4 surface-elevated border border-border/50 bg-card rounded-3xl p-6 sm:p-8 h-full flex flex-col relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-gradient-to-tr from-indigo-500/10 to-transparent blur-[50px] pointer-events-none rounded-full" />
                <div className="flex items-center justify-between p-3 surface-subtle border border-border-subtle rounded-xl mb-4 relative z-10">
                  {enableDemoAccess ? (
                    <>
                      <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400">
                        <UserRound className="h-3.5 w-3.5" />
                        Доступ студента
                      </p>
                      <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Доступ админа
                      </p>
                    </>
                  ) : (
                    <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Demo access disabled
                    </p>
                  )}
                </div>
                <div className="flex-1 relative z-10">
                  {enableDemoAccess ? (
                    <LocalLoginPanel />
                  ) : (
                    <div className="rounded-2xl border border-border/50 bg-background/40 p-5 text-sm text-muted-foreground">
                      Demo sign-in is disabled for this environment.
                    </div>
                  )}
                </div>
              </div>
            </MotionCard>
          </div>
          </div>
        )}
      </div>
    </section>
  );
}
