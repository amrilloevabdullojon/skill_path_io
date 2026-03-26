"use client";

import { memo, useMemo } from "react";
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
        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
        <XAxis dataKey="label" stroke="#64748b" />
        <YAxis stroke="#64748b" />
        <Tooltip contentStyle={{ background: "#020617", border: "1px solid #334155", borderRadius: 12 }} />
        <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
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
        <Radar dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.35} />
      </RadarChart>
    </ResponsiveContainer>
  );
});

export function AdvancedLearningAnalyticsDashboard({ analytics }: AdvancedLearningAnalyticsDashboardProps) {
  const topSkills = useMemo(
    () =>
      [...analytics.skillGrowth.current]
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [analytics.skillGrowth],
  );

  return (
    <section className="space-y-6">
      <header className="surface-elevated space-y-2 p-5 sm:p-6">
        <p className="kicker">Advanced Analytics</p>
        <h1 className="page-title">Learning velocity and skill growth intelligence</h1>
        <p className="section-description">
          Includes radar evolution, learning trend lines, mission success, quiz accuracy, and weekly consistency.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="surface-elevated p-4">
          <p className="text-xs text-muted-foreground">Mission success rate</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{analytics.missionSuccessRate}%</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="text-xs text-muted-foreground">Quiz accuracy</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{analytics.quizAccuracy}%</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="text-xs text-muted-foreground">Consistency score</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{analytics.weeklyConsistency.score}%</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="text-xs text-muted-foreground">Velocity (latest)</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {analytics.learningVelocity[analytics.learningVelocity.length - 1]?.value ?? 0}
          </p>
        </article>
        <article className="surface-elevated p-4">
          <p className="text-xs text-muted-foreground">Top skill</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{topSkills[0]?.skill ?? "n/a"}</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="surface-elevated p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Learning velocity (line chart)</p>
          <div className="h-72">
            <VelocityChart data={analytics.learningVelocity} />
          </div>
        </article>
        <article className="surface-elevated p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Skill radar evolution</p>
          <div className="h-72">
            <RadarEvolutionChart data={analytics.skillGrowth.current} />
          </div>
        </article>
      </div>

      <article className="surface-elevated p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">Weekly consistency heatmap</p>
        <LearningHeatmap data={analytics.weeklyConsistency.heatmap} />
      </article>
    </section>
  );
}
