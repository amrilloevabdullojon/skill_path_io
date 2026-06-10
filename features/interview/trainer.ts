import { TrackTag } from "@/types/personalization";

export function interviewTrackLabel(track: TrackTag) {
  if (track === "QA") return "QA Инженер";
  if (track === "BA") return "Бизнес-аналитик";
  return "Data Analyst";
}

export function interviewNextSteps(score: number, track: TrackTag) {
  if (score >= 80) {
    return [
      `Proceed to advanced ${track} simulation`,
      "Run one final mock interview this week",
      "Prepare portfolio stories in STAR format",
    ];
  }

  if (score >= 60) {
    return [
      "Repeat weak interview topics in speed review mode",
      "Complete one targeted mission and explain outcome",
      "Do a second interview pass in 48 hours",
    ];
  }

  return [
    "Review core lessons and definitions",
    "Use AI mentor for simplified explanations",
    "Retake interview with short structured answers",
  ];
}
