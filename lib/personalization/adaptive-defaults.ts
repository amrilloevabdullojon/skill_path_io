import { AdaptiveSignal } from "@/types/personalization";

const defaultAdaptiveSignal: AdaptiveSignal = {
  quizAccuracy: 70,
  frequentMistakes: [],
  timeSpentMinutes: 0,
  completedModules: 0,
  skippedLessons: 0,
  simulationPerformance: 65,
};

function toNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function buildDefaultAdaptiveSignal(input?: Partial<AdaptiveSignal>): AdaptiveSignal {
  return {
    quizAccuracy: toNumber(input?.quizAccuracy, defaultAdaptiveSignal.quizAccuracy),
    frequentMistakes: Array.isArray(input?.frequentMistakes)
      ? input.frequentMistakes.filter((item): item is string => typeof item === "string")
      : defaultAdaptiveSignal.frequentMistakes,
    timeSpentMinutes: toNumber(input?.timeSpentMinutes, defaultAdaptiveSignal.timeSpentMinutes),
    completedModules: toNumber(input?.completedModules, defaultAdaptiveSignal.completedModules),
    skippedLessons: toNumber(input?.skippedLessons, defaultAdaptiveSignal.skippedLessons),
    simulationPerformance: toNumber(input?.simulationPerformance, defaultAdaptiveSignal.simulationPerformance),
  };
}
