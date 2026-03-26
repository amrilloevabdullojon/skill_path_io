"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Compass, ShieldCheck, Sparkles, Target, UserRound } from "lucide-react";

import { LocalLoginPanel } from "@/components/auth/local-login-panel";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EntryExperienceProps = {
  mode: "guest" | "member";
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
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function EntryExperience({ mode, member }: EntryExperienceProps) {
  return (
    <section className="surface-elevated relative overflow-hidden rounded-[28px] p-4 sm:p-6 lg:p-8">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-24 top-[-120px] h-72 w-72 rounded-full bg-sky-500/12 blur-3xl"
          animate={{ x: [0, 12, 0], y: [0, 16, 0] }}
          transition={{ duration: 16, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[-100px] bottom-[-140px] h-72 w-72 rounded-full bg-violet-500/12 blur-3xl"
          animate={{ x: [0, -14, 0], y: [0, -12, 0] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
      </div>

      <div className="relative">
        {mode === "member" && member ? (
          <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <MotionCard>
              <article className="surface-elevated space-y-5 p-5 sm:p-6">
                <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Welcome back
                </p>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Continue your learning command center
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                    {member.name}, your {member.role === "ADMIN" ? "admin" : "student"} workspace is ready.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="surface-subtle p-3">
                    <p className="text-xs text-muted-foreground">Total XP</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{member.totalXp}</p>
                  </div>
                  <div className="surface-subtle p-3">
                    <p className="text-xs text-muted-foreground">Track progress</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{member.overallProgress}%</p>
                  </div>
                  <div className="surface-subtle p-3">
                    <p className="text-xs text-muted-foreground">Current track</p>
                    <p className="mt-1 truncate text-lg font-semibold text-foreground">{member.primaryTrackTitle}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <Link href={member.continueHref} className={cn(buttonVariants({ size: "sm" }), "h-10 px-4")}>
                    Continue learning
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                  <Link href={member.roadmapHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-10 border-border px-4")}>
                    Open roadmap
                  </Link>
                  <Link href={member.mentorHref} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-10 px-3")}>
                    Ask AI mentor
                  </Link>
                </div>
              </article>
            </MotionCard>

            <div className="space-y-3">
              <MotionCard delay={0.06}>
                <article className="surface-elevated p-4">
                  <p className="module-order-label">Next mission</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{member.nextMissionTitle ?? "Choose a new mission"}</p>
                </article>
              </MotionCard>
              <MotionCard delay={0.12}>
                <article className="surface-elevated p-4">
                  <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Bot className="h-3.5 w-3.5 text-violet-300" />
                    AI support
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Use mentor chat for module guidance and recovery plan suggestions.</p>
                </article>
              </MotionCard>
            </div>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
            <div className="space-y-5">
              <MotionCard>
                <article className="surface-elevated space-y-4 p-6 sm:p-7">
                  <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-200">
                    <Sparkles className="h-3.5 w-3.5" />
                    SkillPath Academy
                  </p>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Learn faster. Practice smarter. Get job ready.
                  </h1>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    Local demo access for role-based learning flows with premium UI, AI guidance, and mission-based progression.
                  </p>
                </article>
              </MotionCard>
              <div className="grid gap-3 sm:grid-cols-3">
                <MotionCard delay={0.04}>
                  <article className="surface-subtle p-4">
                    <Target className="h-5 w-5 text-sky-300" />
                    <p className="mt-2 text-sm font-semibold text-foreground">Track progression</p>
                    <p className="mt-1 text-xs text-muted-foreground">Modules, quizzes, unlock logic, and XP-based growth.</p>
                  </article>
                </MotionCard>
                <MotionCard delay={0.08}>
                  <article className="surface-subtle p-4">
                    <Compass className="h-5 w-5 text-emerald-300" />
                    <p className="mt-2 text-sm font-semibold text-foreground">Real missions</p>
                    <p className="mt-1 text-xs text-muted-foreground">Apply skills in practical scenarios for QA, BA, and DA roles.</p>
                  </article>
                </MotionCard>
                <MotionCard delay={0.12}>
                  <article className="surface-subtle p-4">
                    <Bot className="h-5 w-5 text-violet-300" />
                    <p className="mt-2 text-sm font-semibold text-foreground">AI mentor</p>
                    <p className="mt-1 text-xs text-muted-foreground">Get guidance, feedback, and personalized next actions.</p>
                  </article>
                </MotionCard>
              </div>
            </div>

            <MotionCard delay={0.1}>
              <div className="space-y-3">
                <div className="surface-subtle flex items-center justify-between p-3 text-xs">
                  <p className="inline-flex items-center gap-1 text-muted-foreground">
                    <UserRound className="h-3.5 w-3.5 text-emerald-300" />
                    Student access
                  </p>
                  <p className="inline-flex items-center gap-1 text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-orange-300" />
                    Admin access
                  </p>
                </div>
                <LocalLoginPanel />
              </div>
            </MotionCard>
          </div>
        )}
      </div>
    </section>
  );
}

