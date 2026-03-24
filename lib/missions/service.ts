import { evaluateMissionSubmission, missionXpSummary } from "@/features/missions/engine";
import { LearningMission } from "@/types/personalization";

export function getMissionXp(missions: LearningMission[]) {
  return missionXpSummary(missions);
}

export function reviewMissionSubmission(params: {
  mission: LearningMission;
  submission: string;
}) {
  return evaluateMissionSubmission(params);
}
