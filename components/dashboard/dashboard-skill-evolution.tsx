"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardSection } from "@/components/dashboard/dashboard-section";

type WeeklyPoint = {
  week: string;
  progress: number;
  completed: number;
};

export function DashboardSkillEvolutionSection({ weeklyProgress }: { weeklyProgress: WeeklyPoint[] }) {
  const data = weeklyProgress.map((item, index, arr) => {
    const prev = index > 0 ? arr[index - 1] : null;
    return {
      ...item,
      velocity: prev ? Math.max(0, item.progress - prev.progress) : 0,
    };
  });

  return (
    <DashboardSection
      id="skill-evolution"
      title="Skill evolution"
      description="Learning velocity and growth trend by week."
    >
      <div className="chart-surface h-[19rem] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 2 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
            <XAxis dataKey="week" tick={{ fill: "#94A3B8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} tickLine={false} axisLine={false} width={40} />
            <Tooltip
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid #334155",
                backgroundColor: "#020617",
                color: "#E2E8F0",
              }}
            />
            <Line type="monotone" dataKey="progress" stroke="#38BDF8" strokeWidth={3} dot={false} name="Skill growth %" />
            <Line type="monotone" dataKey="velocity" stroke="#34D399" strokeWidth={2} dot={false} name="Learning velocity" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DashboardSection>
  );
}
