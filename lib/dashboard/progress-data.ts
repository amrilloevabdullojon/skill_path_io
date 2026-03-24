import { buildLearningHeatmap, type HeatmapCell } from "@/features/analytics/learning-heatmap";

export function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function formatWeekLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function formatDuration(minutes: number) {
  if (minutes <= 0) {
    return "Done";
  }
  if (minutes < 60) {
    return `~${minutes} min`;
  }
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `~${hours} h`;
}

export function calculateCurrentStreak(dates: Date[]) {
  const unique = [...new Set(dates.map((date) => formatDateKey(date)))].sort();
  if (unique.length === 0) {
    return 0;
  }

  let streak = 1;
  let cursor = new Date(unique[unique.length - 1]);

  for (let index = unique.length - 2; index >= 0; index -= 1) {
    const previous = new Date(unique[index]);
    const diff = (cursor.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak += 1;
      cursor = previous;
      continue;
    }
    break;
  }

  return streak;
}

export function buildWeeklyProgressData(completedDates: Date[], totalModules: number) {
  const currentWeekStart = startOfWeek(new Date());

  return Array.from({ length: 8 }, (_, index) => {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() - (7 - index) * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const completedThisWeek = completedDates.filter(
      (completedDate) => completedDate >= weekStart && completedDate <= weekEnd,
    ).length;
    const completedUntilWeek = completedDates.filter((completedDate) => completedDate <= weekEnd).length;

    return {
      week: formatWeekLabel(weekStart),
      progress: totalModules > 0 ? Math.round((completedUntilWeek / totalModules) * 100) : 0,
      completed: completedThisWeek,
    };
  });
}

export function buildHeatmapFromCompletedAt(completedDates: Date[], days = 84) {
  if (completedDates.length === 0) {
    return {
      mode: "mock" as const,
      data: buildLearningHeatmap(days),
    };
  }

  const completedByDay = completedDates.reduce<Record<string, number>>((acc, date) => {
    const key = formatDateKey(date);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const data: HeatmapCell[] = [];
  const now = new Date();

  for (let index = days - 1; index >= 0; index -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - index);
    const dateKey = formatDateKey(day);
    const intensity = clamp(completedByDay[dateKey] ?? 0, 0, 4);

    data.push({
      date: dateKey,
      intensity,
    });
  }

  return {
    mode: "real" as const,
    data,
  };
}

