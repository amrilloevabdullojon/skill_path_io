import type { RuntimeCategory, RuntimeMission } from "@/lib/learning/content-types";
import type { LearningMission, MissionDifficulty, TrackTag } from "@/types/personalization";

/**
 * Adapt a runtime mission (as carried in track/module content) into the
 * LearningMission shape expected by the mission evaluation engine.
 */

function toMissionDifficulty(value: string): MissionDifficulty {
  const normalized = value.trim().toLowerCase();
  if (normalized.startsWith("easy") || normalized.startsWith("begin")) return "Easy";
  if (normalized.startsWith("hard") || normalized.startsWith("adv")) return "Hard";
  return "Medium";
}

function toTrackTag(category: RuntimeCategory): TrackTag {
  return category === "BA" || category === "DA" ? category : "QA";
}

export function toLearningMission(
  mission: RuntimeMission,
  category: RuntimeCategory,
): LearningMission {
  return {
    id: mission.id,
    title: mission.title,
    scenario: mission.scenario,
    roleContext: "",
    objective: mission.objective,
    steps: [],
    skillsUsed: [],
    expectedResult: "",
    difficulty: toMissionDifficulty(mission.difficulty),
    xpReward: mission.xpReward,
    aiEvaluation: false,
    category: toTrackTag(category),
    status: "available",
  };
}
