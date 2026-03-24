import { AdvancedLearningAnalytics } from "@/types/saas";

type BuildAdvancedLearningAnalyticsInput = {
  weeklyProgress: Array<{ week: string; progress: number; completed: number }>;
  skillRadar: Array<{ skill: string; value: number }>;
  heatmap: Array<{ date: string; intensity: number }>;
  quizAccuracy: number;
  missionSuccessRate: number;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function buildAdvancedLearningAnalytics(input: BuildAdvancedLearningAnalyticsInput): AdvancedLearningAnalytics {
  const velocity = input.weeklyProgress.map((point, index) => {
    const previous = input.weeklyProgress[index - 1];
    const value = previous ? clamp(point.progress - previous.progress) : clamp(point.progress);
    return {
      label: point.week,
      value,
    };
  });

  const activeDays = input.heatmap.filter((item) => item.intensity > 0).length;
  const consistencyScore = input.heatmap.length > 0
    ? Math.round((activeDays / input.heatmap.length) * 100)
    : 0;

  const evolution = input.weeklyProgress.flatMap((point, index) =>
    input.skillRadar.slice(0, 4).map((skill, skillIndex) => ({
      date: `${point.week}-${skillIndex + 1}`,
      skill: skill.skill,
      score: clamp(skill.value - (input.weeklyProgress.length - index - 1) * (1 + skillIndex)),
    })),
  );

  return {
    learningVelocity: velocity,
    missionSuccessRate: clamp(input.missionSuccessRate),
    quizAccuracy: clamp(input.quizAccuracy),
    weeklyConsistency: {
      score: consistencyScore,
      heatmap: input.heatmap,
    },
    skillGrowth: {
      current: input.skillRadar,
      evolution,
    },
  };
}
