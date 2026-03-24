import { SkillRadarSummary } from "@/lib/dashboard/skills-data";
import { clamp } from "@/lib/dashboard/progress-data";

export type CareerSummary = {
  currentStage: "Junior" | "Middle" | "Senior";
  nextStage: "Junior" | "Middle" | "Senior" | null;
  progressToNextStage: number;
  missingSkills: string[];
  focusTrack: string;
};

export function buildCareerSummary(totalXp: number, radar: SkillRadarSummary): CareerSummary {
  const stages = [
    { title: "Junior" as const, minXp: 0 },
    { title: "Middle" as const, minXp: 1400 },
    { title: "Senior" as const, minXp: 2800 },
  ];

  const currentStage = [...stages].reverse().find((stage) => totalXp >= stage.minXp) ?? stages[0];
  const currentStageIndex = stages.findIndex((stage) => stage.title === currentStage.title);
  const nextStage = stages[currentStageIndex + 1] ?? null;

  const progressToNextStage = nextStage
    ? clamp(Math.round(((totalXp - currentStage.minXp) / (nextStage.minXp - currentStage.minXp)) * 100), 0, 100)
    : 100;

  const missingSkills = [...radar.data]
    .sort((a, b) => a.value - b.value)
    .slice(0, 3)
    .map((skill) => skill.skill);

  return {
    currentStage: currentStage.title,
    nextStage: nextStage?.title ?? null,
    progressToNextStage,
    missingSkills,
    focusTrack: radar.strongestSkill,
  };
}

