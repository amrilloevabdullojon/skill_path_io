import { SmartRecommendation } from "@/types/saas";

type BuildSmartRecommendationsInput = {
  careerTarget: string;
  learningProgressPercent: number;
  skillGaps: string[];
  weakestSkills: string[];
  upcomingModules: Array<{ title: string; href: string }>;
  missionSuggestions: Array<{ title: string; href: string }>;
};

export function buildSmartRecommendations(input: BuildSmartRecommendationsInput): SmartRecommendation[] {
  const recommendations: SmartRecommendation[] = [];

  const nextModule = input.upcomingModules[0];
  if (nextModule) {
    recommendations.push({
      id: "next-module",
      type: "module",
      title: `Next module: ${nextModule.title}`,
      description: "Progress your current learning path with the highest impact module.",
      href: nextModule.href,
      reason: `Progress is ${input.learningProgressPercent}%, module completion will increase velocity.`,
    });
  }

  const nextMission = input.missionSuggestions[0];
  if (nextMission) {
    recommendations.push({
      id: "next-mission",
      type: "mission",
      title: `Next mission: ${nextMission.title}`,
      description: "Practice work-like scenarios and add output to your portfolio.",
      href: nextMission.href,
      reason: "Mission outcomes directly improve readiness and hiring match confidence.",
    });
  }

  if (input.skillGaps.length > 0 || input.weakestSkills.length > 0) {
    const targetSkill = input.skillGaps[0] ?? input.weakestSkills[0] ?? "core skill";
    recommendations.push({
      id: "skill-gap-focus",
      type: "skill",
      title: `Improve skill: ${targetSkill}`,
      description: "Focus weak area through targeted lessons and quiz remediation.",
      href: "/career",
      reason: `Closing ${targetSkill} gap increases readiness for ${input.careerTarget}.`,
    });
  }

  recommendations.push({
    id: "interview-prep",
    type: "interview",
    title: "Interview preparation session",
    description: "Run a mock interview and refine explanation quality.",
    href: "/interview",
    reason: "Interview fluency is a key conversion step from learning to hiring.",
  });

  return recommendations.slice(0, 4);
}
