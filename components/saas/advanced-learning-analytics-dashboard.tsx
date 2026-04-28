"use client";

import { memo, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DownloadCloud, TrendingUp, CalendarDays, Activity, Target } from "lucide-react";

import { LearningHeatmap } from "@/components/charts/learning-heatmap";
import { AdvancedLearningAnalytics } from "@/types/saas";

type AdvancedLearningAnalyticsDashboardProps = {
  analytics: AdvancedLearningAnalytics;
};

const VelocityChart = memo(function VelocityChart({
  data,
}: {
  data: AdvancedLearningAnalytics["learningVelocity"];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
      <LineChart data={data}>
        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
        <YAxis stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ background: "hsl(var(--card) / 0.95)", backdropFilter: "blur(8px)", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))" }}
          itemStyle={{ color: "#38bdf8" }}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="url(#colorVelocity)" 
          strokeWidth={3} 
          dot={{ fill: "#0ea5e9", r: 4, strokeWidth: 2, stroke: "#020617" }} 
          activeDot={{ r: 6, fill: "#38bdf8", stroke: "#fff" }} 
        />
        <defs>
          <linearGradient id="colorVelocity" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
      </LineChart>
    </ResponsiveContainer>
  );
});

const RadarEvolutionChart = memo(function RadarEvolutionChart({
  data,
}: {
  data: AdvancedLearningAnalytics["skillGrowth"]["current"];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis dataKey="skill" tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <Radar 
          dataKey="value" 
          stroke="#818cf8" 
          strokeWidth={2}
          fill="#818cf8" 
          fillOpacity={0.3} 
        />
      </RadarChart>
    </ResponsiveContainer>
  );
});

export function AdvancedLearningAnalyticsDashboard({ analytics }: AdvancedLearningAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "1y">("30d");

  const topSkills = useMemo(
    () =>
      [...analytics.skillGrowth.current]
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [analytics.skillGrowth],
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 surface-hero border border-indigo-500/20 bg-card/40 backdrop-blur-md p-6 sm:p-8 rounded-[24px]">
        <div className="space-y-2 relative z-10 w-full lg:w-2/3">
          <p className="kicker text-indigo-400 font-semibold tracking-widest uppercase flex items-center gap-2">
            <Activity className="w-4 h-4" /> Глубокая Аналитика
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Динамика обучения и навыки</h1>
          <p className="text-sm text-foreground/70">
            Отслеживайте показатели завершаемости миссий, точность ответов на квизах и стройте эволюцию радарных диаграмм компетенций вашей команды.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full lg:w-auto">
          <div className="flex items-center bg-background/50 border border-border/50 rounded-full p-1.5 w-full sm:w-auto justify-center">
            <button 
              onClick={() => setTimeRange("7d")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${timeRange === "7d" ? "bg-card text-indigo-300 shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"}`}
            >
              7 Дней
            </button>
            <button 
              onClick={() => setTimeRange("30d")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${timeRange === "30d" ? "bg-card text-indigo-300 shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"}`}
            >
              30 Дней
            </button>
            <button 
              onClick={() => setTimeRange("1y")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${timeRange === "1y" ? "bg-card text-indigo-300 shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"}`}
            >
              ВЕСЬ ГОД
            </button>
          </div>
          <button className="btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border-indigo-500/30 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10">
            <DownloadCloud className="w-4 h-4" />
            Экспорт CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Успешность миссий", value: `${analytics.missionSuccessRate}%`, icon: Target },
          { label: "Точность квизов", value: `${analytics.quizAccuracy}%`, icon: Activity },
          { label: "Консистентность", value: `${analytics.weeklyConsistency.score}%`, icon: CalendarDays },
          { label: "Скорость (Текущая)", value: analytics.learningVelocity[analytics.learningVelocity.length - 1]?.value ?? 0, icon: TrendingUp },
          { label: "Топ Навык", value: topSkills[0]?.skill ?? "n/a", icon: Target, isSkill: true },
        ].map((stat, idx) => (
          <article key={idx} className={`surface-elevated border bg-card/60 backdrop-blur-md p-5 rounded-2xl relative overflow-hidden transition-all hover:-translate-y-1 ${stat.isSkill ? "border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 to-transparent" : "border-border/50"}`}>
            {stat.isSkill && <div className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-500/20 blur-xl pointer-events-none rounded-full" />}
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-3.5 h-3.5 ${stat.isSkill ? "text-indigo-400" : "text-muted-foreground"}`} />
              <p className="text-xs uppercase tracking-wider font-semibold text-foreground/60 leading-tight truncate">
                {stat.label}
              </p>
            </div>
            <p className={`mt-2 text-3xl font-extrabold tracking-tight truncate ${stat.isSkill ? "text-indigo-200" : "text-foreground"}`}>
              {stat.value}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md p-6 rounded-[24px]">
          <h2 className="mb-6 text-lg font-bold text-foreground inline-flex items-center gap-2">
            Скорость обучения (XP / Период)
          </h2>
          <div className="h-[300px] w-full">
            <VelocityChart data={analytics.learningVelocity} />
          </div>
        </article>
        
        <article className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md p-6 rounded-[24px]">
          <h2 className="mb-6 text-lg font-bold text-foreground inline-flex items-center gap-2">
            Эволюция радара компетенций
          </h2>
          <div className="h-[300px] w-full">
            <RadarEvolutionChart data={analytics.skillGrowth.current} />
          </div>
        </article>
      </div>

      <article className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md p-6 rounded-[24px]">
        <h2 className="mb-4 text-lg font-bold text-foreground">Тепловая карта активности (Weekly)</h2>
        <div className="opactiy-90 saturate-150">
          <LearningHeatmap data={analytics.weeklyConsistency.heatmap} />
        </div>
      </article>
    </section>
  );
}
