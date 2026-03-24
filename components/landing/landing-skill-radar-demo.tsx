"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type SkillKey = "Testing" | "SQL" | "Analytics" | "Communication" | "Automation";

const baseRadar: Record<SkillKey, number> = {
  Testing: 78,
  SQL: 64,
  Analytics: 71,
  Communication: 68,
  Automation: 56,
};

const growthRadar: Record<SkillKey, number> = {
  Testing: 84,
  SQL: 76,
  Analytics: 79,
  Communication: 74,
  Automation: 68,
};

const skillList: SkillKey[] = ["Testing", "SQL", "Analytics", "Communication", "Automation"];

export function LandingSkillRadarDemo() {
  const [activeSkill, setActiveSkill] = useState<SkillKey | null>(null);

  const chartData = useMemo(() => {
    return skillList.map((skill) => {
      const isActive = activeSkill === null || activeSkill === skill;
      return {
        skill,
        value: isActive ? baseRadar[skill] : Math.max(36, baseRadar[skill] - 16),
        projected: isActive ? growthRadar[skill] : Math.max(44, growthRadar[skill] - 14),
      };
    });
  }, [activeSkill]);

  const strongestSkill = useMemo(
    () => Object.entries(baseRadar).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Testing",
    [],
  );

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="surface-elevated min-w-0 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="kicker">Interactive demo</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-100">Skill growth radar</h3>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/35 bg-violet-500/15 px-2.5 py-1 text-[11px] text-violet-200">
            <Sparkles className="h-3.5 w-3.5" />
            Live preview
          </span>
        </div>

        <div className="mt-4 h-[20rem] min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 p-2 sm:p-3">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
            <RadarChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
              <PolarGrid stroke="#334155" strokeOpacity={0.7} />
              <PolarAngleAxis dataKey="skill" tick={{ fill: "#94A3B8", fontSize: 12 }} tickLine={false} axisLine={false} />
              <Radar dataKey="projected" stroke="#34d399" strokeDasharray="5 4" fill="#34d399" fillOpacity={0.05} />
              <Radar dataKey="value" stroke="#7dd3fc" strokeWidth={2} fill="#38bdf8" fillOpacity={0.26} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {skillList.map((skill) => (
            <button
              key={skill}
              type="button"
              onMouseEnter={() => setActiveSkill(skill)}
              onFocus={() => setActiveSkill(skill)}
              onMouseLeave={() => setActiveSkill(null)}
              onBlur={() => setActiveSkill(null)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                activeSkill === skill
                  ? "border-sky-400/35 bg-sky-500/15 text-sky-200"
                  : "border-slate-700 bg-slate-900/75 text-slate-300 hover:border-slate-600",
              )}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      <motion.aside
        className="space-y-3"
        initial={{ opacity: 0, x: 16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.42 }}
      >
        <article className="surface-elevated p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Strongest skill</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">{strongestSkill}</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Next focus</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">Automation</p>
          <p className="mt-1 text-xs text-slate-400">Boost interview readiness by adding one automation sprint.</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Projected growth</p>
          <p className="mt-1 text-lg font-semibold text-emerald-200">+12% in 6 weeks</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-sky-300">
            Open personalized roadmap
            <ArrowUpRight className="h-3.5 w-3.5" />
          </p>
        </article>
      </motion.aside>
    </section>
  );
}

