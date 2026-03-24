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

type WeeklyProgressPoint = {
  week: string;
  progress: number;
  completed: number;
};

type WeeklyProgressChartProps = {
  data: WeeklyProgressPoint[];
};

export function WeeklyProgressChart({ data }: WeeklyProgressChartProps) {
  return (
    <div className="h-64 w-full min-w-0 sm:h-72">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 2 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
          <XAxis
            dataKey="week"
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={16}
          />
          <YAxis
            yAxisId="progress"
            domain={[0, 100]}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            width={40}
          />
          <YAxis yAxisId="completed" hide domain={[0, "auto"]} />
          <Tooltip
            cursor={{ stroke: "#38BDF8", strokeOpacity: 0.2 }}
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid #334155",
              backgroundColor: "#020617",
              color: "#E2E8F0",
            }}
            labelStyle={{ color: "#E2E8F0", fontWeight: 600 }}
          />
          <Line
            yAxisId="progress"
            type="monotone"
            dataKey="progress"
            stroke="#38BDF8"
            strokeWidth={3}
            dot={{ r: 4, fill: "#38BDF8" }}
            activeDot={{ r: 6, fill: "#7DD3FC" }}
            name="Progress"
          />
          <Line
            yAxisId="completed"
            type="monotone"
            dataKey="completed"
            stroke="#34D399"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3, fill: "#34D399" }}
            name="Modules completed"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
