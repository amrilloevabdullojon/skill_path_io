import { WeeklyAiReport } from "@/types/saas";

type BuildWeeklyReportInput = {
  skillGrowthPercent: number;
  strongestSkill: string;
  completedMissions: number;
  nextFocus: string;
  readinessScore: number;
};

function boundedPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function buildWeeklyAiReport(input: BuildWeeklyReportInput): WeeklyAiReport {
  const normalizedGrowth = boundedPercent(input.skillGrowthPercent);

  return {
    headline: "Weekly AI Learning Report",
    summary: `This week you improved ${input.strongestSkill} by ${normalizedGrowth}%. You completed ${input.completedMissions} missions.`,
    highlights: [
      `Readiness score is currently ${boundedPercent(input.readinessScore)}.`,
      `Your strongest skill this week: ${input.strongestSkill}.`,
      `Mission delivery count: ${input.completedMissions}.`,
    ],
    nextFocus: input.nextFocus,
  };
}
