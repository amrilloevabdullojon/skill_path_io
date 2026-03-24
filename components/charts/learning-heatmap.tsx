import { HeatmapCell } from "@/features/analytics/learning-heatmap";

type LearningHeatmapProps = {
  data: HeatmapCell[];
};

function colorByIntensity(intensity: number) {
  if (intensity <= 0) {
    return "bg-slate-900";
  }
  if (intensity === 1) {
    return "bg-sky-900/80";
  }
  if (intensity === 2) {
    return "bg-sky-700/80";
  }
  if (intensity === 3) {
    return "bg-cyan-500/80";
  }
  return "bg-emerald-400/90";
}

export function LearningHeatmap({ data }: LearningHeatmapProps) {
  const streakDates = new Set<string>();
  for (let index = data.length - 1; index >= 0; index -= 1) {
    if (data[index]?.intensity && data[index].intensity > 0) {
      streakDates.add(data[index].date);
      continue;
    }
    break;
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 gap-1 sm:grid-cols-14">
        {data.map((cell) => {
          const lessons = cell.intensity;
          const xp = cell.intensity * 35;
          const isInStreak = streakDates.has(cell.date);
          return (
            <div key={cell.date} className="group relative">
              <div
                className={`h-3.5 rounded-[5px] border border-slate-900/70 transition-transform duration-200 group-hover:scale-125 ${colorByIntensity(cell.intensity)} ${
                  isInStreak ? "ring-1 ring-orange-300/70" : ""
                }`}
              />
              <div className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-950/95 px-2 py-1 text-[10px] text-slate-200 shadow-card group-hover:block">
                <p>{cell.date}</p>
                <p>Lessons: {lessons}</p>
                <p>XP: {xp}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-2 text-[11px] text-slate-500">
        <span>Less</span>
        <span className="h-2.5 w-2.5 rounded bg-slate-900" />
        <span className="h-2.5 w-2.5 rounded bg-sky-900/80" />
        <span className="h-2.5 w-2.5 rounded bg-sky-700/80" />
        <span className="h-2.5 w-2.5 rounded bg-cyan-500/80" />
        <span className="h-2.5 w-2.5 rounded bg-emerald-400/90" />
        <span>More</span>
      </div>
      <p className="text-[11px] text-slate-500">Orange ring marks your active learning streak.</p>
    </div>
  );
}
