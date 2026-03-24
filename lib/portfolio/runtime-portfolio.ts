import "server-only";

import { DashboardData } from "@/lib/dashboard/data";
import { PortfolioEntry } from "@/types/personalization";

export function buildRuntimePortfolioSeed(dashboard: DashboardData | null): PortfolioEntry[] {
  if (!dashboard) {
    return [];
  }

  const seen = new Set<string>();
  const entries: PortfolioEntry[] = [];

  for (const item of dashboard.activity) {
    if (item.kind !== "lesson" && item.kind !== "quiz" && item.kind !== "simulation") {
      continue;
    }

    const id = `runtime-${item.id}`;
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);

    entries.push({
      id,
      title: item.title,
      description: item.description,
      skillsUsed: dashboard.skillRadar.data
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .map((skill) => skill.skill),
      resultSummary:
        item.kind === "quiz"
          ? "Assessment passed and reflected in learning progress."
          : item.kind === "simulation"
            ? "Real-work practice milestone completed."
            : "Learning module completed with recorded activity.",
      source: item.kind === "quiz" ? "quiz" : item.kind === "simulation" ? "simulation" : "module",
      sourceRef: item.id,
      createdAt: item.timestamp.toISOString(),
    });
  }

  return entries.slice(0, 8);
}

