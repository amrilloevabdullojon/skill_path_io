"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BarChart3, CheckCircle2, Radar, Target } from "lucide-react";

export function LandingHeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-xl"
    >
      <div className="surface-elevated relative overflow-hidden p-4 sm:p-5">
        <div className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-sky-500/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-20 h-48 w-48 rounded-full bg-violet-500/12 blur-3xl" />

        <div className="relative space-y-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/65 p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Skill radar</p>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {[72, 64, 78, 58, 66].map((value, index) => (
                <div key={value + index} className="h-10 rounded-lg border border-slate-800/90 bg-slate-900/70 p-1">
                  <div className="h-full rounded-md bg-gradient-to-t from-sky-500/45 to-violet-500/35" style={{ opacity: value / 100 }} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/65 p-3">
              <p className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Target className="h-3.5 w-3.5 text-emerald-300" />
                Active tracks
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-100">QA Engineer</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-[62%] rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/65 p-3">
              <p className="inline-flex items-center gap-1 text-xs text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-sky-300" />
                Mission preview
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-100">API Bug Investigation</p>
              <p className="mt-1 text-[11px] text-slate-400">+140 XP · In progress</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/65 p-3">
            <div className="flex items-center justify-between">
              <p className="inline-flex items-center gap-1 text-xs text-slate-400">
                <BarChart3 className="h-3.5 w-3.5 text-sky-300" />
                Progress stats
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-sky-300">
                Open dashboard
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-900/65 p-2">
                <p className="text-slate-500">XP</p>
                <p className="mt-1 text-slate-100">1840</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/65 p-2">
                <p className="text-slate-500">Track</p>
                <p className="mt-1 text-slate-100">62%</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/65 p-2">
                <p className="text-slate-500">Missions</p>
                <p className="mt-1 text-slate-100">5</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute -left-10 bottom-10 hidden rounded-xl border border-slate-700/90 bg-slate-950/85 p-3 shadow-xl sm:block"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="inline-flex items-center gap-1 text-xs text-slate-300">
          <Radar className="h-3.5 w-3.5 text-violet-300" />
          AI mentor active
        </p>
      </motion.div>
    </motion.div>
  );
}

