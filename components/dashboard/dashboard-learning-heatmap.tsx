import { Flame } from "lucide-react";

import { LearningHeatmap } from "@/components/charts/learning-heatmap";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import type { DashboardData } from "@/lib/dashboard/data";

type DashboardLearningHeatmapProps = {
  heatmap: DashboardData["heatmap"];
  streak: number;
};

export function DashboardLearningHeatmapSection({ heatmap, streak }: DashboardLearningHeatmapProps) {
  return (
    <DashboardSection
      id="heatmap"
      title="Learning Heatmap"
      description="GitHub-style activity map for the last 12 weeks."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="xp-pill inline-flex items-center gap-1 px-3 py-1">
            <Flame className="h-3.5 w-3.5 text-orange-300" />
            Current streak: {streak} days
          </span>
          <span className="xp-pill px-3 py-1">
            Data mode: {heatmap.mode === "real" ? "real activity" : "mock fallback"}
          </span>
        </div>
        <LearningHeatmap data={heatmap.data} />
      </div>
    </DashboardSection>
  );
}
