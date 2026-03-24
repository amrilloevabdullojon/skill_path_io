import { StudentAnalyticsSnapshot } from "@/types/personalization";

export function analyticsHighlights(snapshot: StudentAnalyticsSnapshot) {
  const weakSpot = snapshot.weakestSkills[0] ?? "No weak spot";
  const strongSpot = snapshot.strongestSkills[0] ?? "No strong spot";
  const consistency = snapshot.weeklyProgress.length > 1
    ? snapshot.weeklyProgress[snapshot.weeklyProgress.length - 1].value - snapshot.weeklyProgress[0].value
    : 0;

  return {
    strongSpot,
    weakSpot,
    consistency,
    nextAction:
      snapshot.averageQuizAccuracy < 75
        ? "Run focused quiz remediation session"
        : "Increase simulation complexity",
  };
}
