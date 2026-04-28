"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type SkillKey = "Тестирование" | "SQL Базы" | "Аналитика" | "Стейкхолдеры" | "Автоматизация";

const baseRadar: Record<SkillKey, number> = {
  "Тестирование": 78,
  "SQL Базы": 64,
  "Аналитика": 71,
  "Стейкхолдеры": 68,
  "Автоматизация": 56,
};

const growthRadar: Record<SkillKey, number> = {
  "Тестирование": 84,
  "SQL Базы": 76,
  "Аналитика": 79,
  "Стейкхолдеры": 74,
  "Автоматизация": 68,
};

const skillList: SkillKey[] = ["Тестирование", "SQL Базы", "Аналитика", "Стейкхолдеры", "Автоматизация"];

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
    () => Object.entries(baseRadar).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Тестирование",
    [],
  );

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="surface-elevated min-w-0 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="kicker">Интерактивный радар</p>
            <h3 className="mt-1 text-xl font-semibold text-foreground">Динамика навыков</h3>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/35 bg-violet-500/15 px-2.5 py-1 text-[11px] text-violet-200">
            <Sparkles className="h-3.5 w-3.5" />
            Живое превью
          </span>
        </div>

        <div className="content-card mt-4 h-[20rem] min-w-0 p-2 sm:p-3">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
            <RadarChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
              <PolarGrid stroke="#334155" strokeOpacity={0.7} />
              <PolarAngleAxis dataKey="skill" tick={{ fill: "#94A3B8", fontSize: 12 }} tickLine={false} axisLine={false} />
              <Radar dataKey="projected" stroke="#34d399" strokeDasharray="5 4" fill="#34d399" fillOpacity={0.05} />
              <Radar dataKey="value" stroke="#a5b4fc" strokeWidth={2} fill="#6366f1" fillOpacity={0.26} />
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
                  ? "border-indigo-400/35 bg-indigo-500/15 text-indigo-200"
                  : "border-border bg-card/75 text-muted-foreground hover:border-border/70",
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
          <p className="data-label">Сильный навык</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{strongestSkill}</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="data-label">Зона развития</p>
          <p className="mt-1 text-lg font-semibold text-foreground">Автоматизация</p>
          <p className="mt-1 text-xs text-muted-foreground">Улучшит скор интервью после спринта.</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="data-label">Прогноз роста</p>
          <p className="mt-1 text-lg font-semibold text-emerald-200">+12% за 6 недель</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-300">
            Открыть личный план
            <ArrowUpRight className="h-3.5 w-3.5" />
          </p>
        </article>
      </motion.aside>
    </section>
  );
}

