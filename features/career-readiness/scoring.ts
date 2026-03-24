import { ReadinessSnapshot } from "@/types/personalization";

type SkillPoint = { skill: string; value: number };

type ReadinessInput = {
  role: "Junior QA" | "Junior BA" | "Junior Data Analyst";
  skillRadar: SkillPoint[];
  quizAccuracy: number;
  missionCompletionRate: number;
  simulationPerformance: number;
  progressPercent: number;
};

function readinessLevel(score: number): ReadinessSnapshot["level"] {
  if (score >= 85) return "Pre-Middle";
  if (score >= 72) return "Strong Junior";
  if (score >= 60) return "Junior-ready";
  if (score >= 42) return "Foundation";
  return "Beginner";
}

function nextMilestone(score: number, role: ReadinessInput["role"]) {
  if (score >= 85) {
    return `Prepare portfolio and target ${role} interviews`;
  }
  if (score >= 70) {
    return "Close remaining skill gaps and complete 2 advanced simulations";
  }
  if (score >= 55) {
    return "Reach consistent 80% quiz performance";
  }
  return "Build fundamentals through guided modules and review mode";
}

export function calculateCareerReadiness(input: ReadinessInput): ReadinessSnapshot {
  const radarAverage =
    input.skillRadar.length > 0
      ? Math.round(input.skillRadar.reduce((sum, item) => sum + item.value, 0) / input.skillRadar.length)
      : 0;

  const score = Math.round(
    input.progressPercent * 0.22 +
      input.quizAccuracy * 0.26 +
      input.missionCompletionRate * 0.2 +
      input.simulationPerformance * 0.2 +
      radarAverage * 0.12,
  );

  const strongest = [...input.skillRadar].sort((a, b) => b.value - a.value).slice(0, 3).map((item) => item.skill);
  const weakest = [...input.skillRadar].sort((a, b) => a.value - b.value).slice(0, 3).map((item) => item.skill);

  return {
    score,
    level: readinessLevel(score),
    strengths: strongest,
    missingSkills: weakest,
    nextMilestone: nextMilestone(score, input.role),
    progressToGoal: Math.min(score, 100),
  };
}
