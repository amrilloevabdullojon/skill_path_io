"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

type SkillRadarPoint = {
  skill: string;
  value: number;
};

type SkillRadarChartProps = {
  data: SkillRadarPoint[];
};

function RadarAngleTick(props: { x?: number; y?: number; payload?: { value?: string } }) {
  const x = props.x ?? 0;
  const y = props.y ?? 0;
  const label = props.payload?.value ?? "";
  const words = label.split(" ");

  const lines =
    words.length > 1
      ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")]
      : label.length > 12
        ? [label.slice(0, 12), label.slice(12)]
        : [label];

  return (
    <text x={x} y={y} textAnchor="middle" fill="#94A3B8" fontSize={11}>
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : 12}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

export function SkillRadarChart({ data }: SkillRadarChartProps) {
  return (
    <div className="h-[20rem] w-full min-w-0 rounded-2xl border border-slate-800 bg-slate-950/70 p-2 sm:h-[22rem] sm:p-3">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
        <RadarChart data={data} margin={{ top: 24, right: 30, bottom: 20, left: 30 }}>
          <defs>
            <linearGradient id="skillRadarFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.36} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.18} />
            </linearGradient>
          </defs>
          <PolarGrid stroke="#334155" strokeOpacity={0.7} />
          <PolarAngleAxis
            dataKey="skill"
            tickLine={false}
            axisLine={false}
            tick={<RadarAngleTick />}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "0.85rem",
              border: "1px solid #334155",
              backgroundColor: "#020617",
              color: "#e2e8f0",
            }}
          />
          <Radar dataKey="value" stroke="#7dd3fc" strokeWidth={2} fill="url(#skillRadarFill)" />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
