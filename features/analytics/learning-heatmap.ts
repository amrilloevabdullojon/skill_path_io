export type HeatmapCell = {
  date: string;
  intensity: number;
};

export function buildLearningHeatmap(days = 84): HeatmapCell[] {
  const data: HeatmapCell[] = [];
  const now = new Date();

  for (let index = days - 1; index >= 0; index -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - index);
    const weekDay = day.getDay();
    const pseudoActivity = (day.getDate() + day.getMonth() * 2 + weekDay * 3) % 5;

    data.push({
      date: day.toISOString().slice(0, 10),
      intensity: pseudoActivity,
    });
  }

  return data;
}
