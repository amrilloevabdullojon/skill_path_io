import { TrackTag } from "@/types/personalization";

const profileTrackMap: Record<TrackTag, string> = {
  QA: "qa-engineer",
  BA: "business-analyst",
  DA: "data-analyst",
};

export function starterTrackByProfession(profession: TrackTag) {
  return profileTrackMap[profession];
}

export function buildStarterRoadmap(profession: TrackTag) {
  if (profession === "QA") {
    return ["QA Fundamentals", "Test Design", "API Testing", "Bug Tracker Simulation", "Final QA Challenge"];
  }
  if (profession === "BA") {
    return ["BA Role", "Requirements Discovery", "User Story Lab", "Stakeholder Simulation", "Final BA Challenge"];
  }
  return ["Analytics Basics", "SQL for Analysts", "Metrics Design", "Dataset Simulation", "Final DA Challenge"];
}
