import { TrackCategory } from "@prisma/client";

type RecommendationInput = {
  category: TrackCategory;
  progressPercent: number;
  averageScore: number | null;
  completedModules: number;
  totalModules: number;
};

export function buildLearningRecommendations(items: RecommendationInput[]) {
  if (items.length === 0) {
    return ["Start with one module this week to unlock your first momentum streak."];
  }

  const recommendations: string[] = [];

  for (const item of items) {
    if (item.progressPercent < 30) {
      recommendations.push(
        `${item.category}: finish module ${Math.min(item.completedModules + 1, item.totalModules)} to build baseline confidence.`,
      );
      continue;
    }

    if ((item.averageScore ?? 0) < 70) {
      recommendations.push(
        `${item.category}: revisit theory notes and retake the quiz to reach at least 70%.`,
      );
      continue;
    }

    if (item.progressPercent >= 70 && (item.averageScore ?? 0) >= 80) {
      recommendations.push(
        `${item.category}: you're ready for a simulation challenge and peer review task.`,
      );
      continue;
    }

    recommendations.push(`${item.category}: keep steady pace with one module and one practice task this week.`);
  }

  return recommendations.slice(0, 4);
}
