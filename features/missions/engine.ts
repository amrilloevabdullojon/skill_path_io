import { LearningMission, MissionEvaluation, MissionStatus } from "@/types/personalization";

export function missionProgressState(input: {
  completedSteps: number;
  totalSteps: number;
  unlocked: boolean;
}): MissionStatus {
  if (!input.unlocked) {
    return "locked";
  }
  if (input.completedSteps <= 0) {
    return "available";
  }
  if (input.completedSteps >= input.totalSteps) {
    return "completed";
  }
  return "in_progress";
}

export function evaluateMissionSubmission(params: {
  mission: LearningMission;
  submission: string;
}): MissionEvaluation {
  const wordCount = params.submission.trim().split(/\s+/).filter(Boolean).length;
  const score = Math.max(35, Math.min(98, Math.round(wordCount * 1.7)));

  const verdict: MissionEvaluation["verdict"] = score >= 85 ? "Excellent" : score >= 65 ? "Good" : "Needs improvement";

  return {
    score,
    verdict,
    strengths: [
      "Structured answer with scenario context",
      "Objective is linked to measurable outcome",
    ],
    improvements: [
      "Add clearer validation criteria",
      "Include one real-world risk and mitigation step",
    ],
    recoveryPlan: [
      "Review relevant lesson summary",
      "Retry mission with explicit acceptance criteria",
      "Run AI remediation hints before final submit",
    ],
  };
}

export function missionXpSummary(missions: LearningMission[]) {
  const completed = missions.filter((item) => item.status === "completed");
  const inProgress = missions.filter((item) => item.status === "in_progress");
  return {
    total: missions.reduce((sum, item) => sum + item.xpReward, 0),
    earned: completed.reduce((sum, item) => sum + item.xpReward, 0) +
      inProgress.reduce((sum, item) => sum + Math.round(item.xpReward * 0.4), 0),
  };
}
