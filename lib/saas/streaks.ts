import { StreakSummary } from "@/types/saas";

export function buildStreakSummary(heatmap: Array<{ date: string; intensity: number }>): StreakSummary {
  const sorted = [...heatmap].sort((a, b) => a.date.localeCompare(b.date));

  let daily = 0;
  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    if (sorted[index].intensity > 0) {
      daily += 1;
    } else {
      break;
    }
  }

  const weeklyBuckets = new Map<string, number>();
  for (const cell of sorted) {
    const date = new Date(cell.date);
    const day = date.getUTCDay();
    const start = new Date(date);
    start.setUTCDate(start.getUTCDate() - day);
    const key = start.toISOString().slice(0, 10);
    weeklyBuckets.set(key, (weeklyBuckets.get(key) ?? 0) + (cell.intensity > 0 ? 1 : 0));
  }

  const weekly = [...weeklyBuckets.values()].filter((activeDays) => activeDays >= 3).length;

  return {
    daily,
    weekly,
    heatmap: heatmap,
  };
}
