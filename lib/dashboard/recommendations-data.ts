import { TrackCategory } from "@prisma/client";

import { SkillRadarSummary } from "@/lib/dashboard/skills-data";

export type DashboardRecommendationItem = {
  id: string;
  title: string;
  description: string;
  tag: "Quiz" | "Simulation" | "Skill" | "Career" | "Mentor";
  href: string;
};

export type RecommendationPrimaryTrack = {
  title: string;
  category: TrackCategory;
  nextModuleHref: string;
  nextModuleTitle: string | null;
};

export type RecommendationLowScoreProgress = {
  moduleId: string;
  score: number;
  moduleTitle: string;
  trackSlug: string;
};

export function trackSkillsByCategory(category: TrackCategory) {
  if (category === TrackCategory.QA) {
    return ["Testing strategy", "API validation", "Bug reporting"];
  }
  if (category === TrackCategory.BA) {
    return ["User stories", "Acceptance criteria", "Stakeholder discovery"];
  }
  return ["SQL analysis", "Metrics reasoning", "Data storytelling"];
}

export function trackCareerImpact(category: TrackCategory) {
  if (category === TrackCategory.QA) {
    return "Build confidence for Junior QA release cycles";
  }
  if (category === TrackCategory.BA) {
    return "Strengthen BA delivery for backlog and requirement quality";
  }
  return "Increase readiness for Junior Data Analyst insights delivery";
}

export function buildDashboardRecommendations(input: {
  lowScoreProgress: RecommendationLowScoreProgress | null;
  primaryTrack: RecommendationPrimaryTrack | null;
  strongestCategory: TrackCategory;
  skillRadar: SkillRadarSummary;
  focusTrack: string;
  categoryTrackTitle?: string;
  baseRecommendationText?: string;
}): DashboardRecommendationItem[] {
  return [
    input.lowScoreProgress
      ? {
          id: "repeat-quiz",
          title: `Repeat ${input.lowScoreProgress.moduleTitle} quiz`,
          description: `Current score ${input.lowScoreProgress.score}%. Revisit weak points and retake to pass 70%+.`,
          tag: "Quiz",
          href: `/tracks/${input.lowScoreProgress.trackSlug}/modules/${input.lowScoreProgress.moduleId}/quiz`,
        }
      : {
          id: "quiz-challenge",
          title: "Take an advanced quiz round",
          description: "Your current quiz results are stable. Keep momentum with a challenge module.",
          tag: "Quiz",
          href: input.primaryTrack?.nextModuleHref
            ? `${input.primaryTrack.nextModuleHref}/quiz`
            : "/tracks",
        },
    {
      id: "simulation",
      title:
        input.strongestCategory === TrackCategory.BA
          ? "Try BA simulation"
          : input.strongestCategory === TrackCategory.DA
            ? "Practice SQL sandbox"
            : "Try Bug Tracker Simulation",
      description:
        input.strongestCategory === TrackCategory.BA
          ? "Strengthen user stories and acceptance criteria with scenario feedback."
          : input.strongestCategory === TrackCategory.DA
            ? "Run SQL queries against practice data to improve analytics confidence."
            : "Simulate Jira-quality bug reporting and sharpen QA execution.",
      tag: "Simulation",
      href:
        input.strongestCategory === TrackCategory.BA
          ? "/simulation/ba"
          : input.strongestCategory === TrackCategory.DA
            ? "/sandbox/sql"
            : "/simulation/bug-tracker",
    },
    {
      id: "weakest-skill",
      title: `Improve ${input.skillRadar.weakestSkill}`,
      description: `Strongest now: ${input.skillRadar.strongestSkill}. Focus one focused session on ${input.skillRadar.weakestSkill}.`,
      tag: "Skill",
      href: input.skillRadar.weakestSkill === "SQL" ? "/sandbox/sql" : "/tracks",
    },
    {
      id: "career",
      title: `You may fit ${input.focusTrack} pathway`,
      description:
        input.categoryTrackTitle
          ? `Your best momentum is in ${input.categoryTrackTitle}. Map it to your next career stage.`
          : "Open roadmap and align your strongest skills with career goals.",
      tag: "Career",
      href: "/career",
    },
    {
      id: "mentor",
      title: "Ask AI mentor for a weekly plan",
      description: input.baseRecommendationText ?? "Get an adaptive plan for your next sprint.",
      tag: "Mentor",
      href: input.primaryTrack?.nextModuleHref ?? "/tracks",
    },
  ];
}

