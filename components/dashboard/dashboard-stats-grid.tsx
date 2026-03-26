import { Activity, BarChart3, Brain, CheckCircle2, Flame, Trophy } from "lucide-react";

import { MetricCard } from "@/components/analytics/metric-card";
import type { DashboardStatCard } from "@/lib/dashboard/data";

type DashboardStatsGridProps = {
  stats: DashboardStatCard[];
};

function cardIcon(id: DashboardStatCard["id"]) {
  if (id === "completed-lessons") {
    return <CheckCircle2 className="h-4 w-4" />;
  }
  if (id === "active-tracks") {
    return <Activity className="h-4 w-4" />;
  }
  if (id === "total-xp") {
    return <Trophy className="h-4 w-4" />;
  }
  if (id === "quiz-accuracy") {
    return <Brain className="h-4 w-4" />;
  }
  if (id === "weekly-streak") {
    return <Flame className="h-4 w-4" />;
  }
  return <BarChart3 className="h-4 w-4" />;
}

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  const primaryIds: DashboardStatCard["id"][] = ["total-xp", "active-tracks", "completed-lessons"];
  const learningIds: DashboardStatCard["id"][] = ["quiz-accuracy", "weekly-streak", "simulations"];
  const primaryStats = stats.filter((item) => primaryIds.includes(item.id));
  const learningStats = stats.filter((item) => learningIds.includes(item.id));

  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <h2 className="data-label font-semibold text-sm">Primary stats</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {primaryStats.map((stat) => (
            <MetricCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              helper={stat.helper}
              icon={cardIcon(stat.id)}
            />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="data-label font-semibold text-sm">Learning stats</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {learningStats.map((stat) => (
            <MetricCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              helper={stat.helper}
              icon={cardIcon(stat.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
