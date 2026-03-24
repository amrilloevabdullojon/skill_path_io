import { calculateCareerReadiness } from "@/features/career-readiness/scoring";
import { ReadinessSnapshot } from "@/types/personalization";

export function buildCareerReadinessSnapshot(input: {
  role: "Junior QA" | "Junior BA" | "Junior Data Analyst";
  radar: Array<{ skill: string; value: number }>;
  quizAccuracy: number;
  missionCompletionRate: number;
  simulationPerformance: number;
  progressPercent: number;
}): ReadinessSnapshot {
  return calculateCareerReadiness({
    role: input.role,
    skillRadar: input.radar,
    quizAccuracy: input.quizAccuracy,
    missionCompletionRate: input.missionCompletionRate,
    simulationPerformance: input.simulationPerformance,
    progressPercent: input.progressPercent,
  });
}
