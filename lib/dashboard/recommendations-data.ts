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

export function getTrackSkills(category: TrackCategory, customSkills?: string[]): string[] {
  if (customSkills && customSkills.length > 0) return customSkills;
  if (category === TrackCategory.QA) {
    return ["Testing strategy", "API validation", "Bug reporting"];
  }
  if (category === TrackCategory.BA) {
    return ["User stories", "Acceptance criteria", "Stakeholder discovery"];
  }
  return ["SQL analysis", "Metrics reasoning", "Data storytelling"];
}

/** @deprecated Use getTrackSkills() instead */
export function trackSkillsByCategory(category: TrackCategory): string[] {
  return getTrackSkills(category);
}

export function getTrackCareerImpact(category: TrackCategory, customCareerImpact?: string): string {
  if (customCareerImpact) return customCareerImpact;
  if (category === TrackCategory.QA) {
    return "Build confidence for Junior QA release cycles";
  }
  if (category === TrackCategory.BA) {
    return "Strengthen BA delivery for backlog and requirement quality";
  }
  return "Increase readiness for Junior Data Analyst insights delivery";
}

/** @deprecated Use getTrackCareerImpact() instead */
export function trackCareerImpact(category: TrackCategory): string {
  return getTrackCareerImpact(category);
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
          title: `Пересдайте тест: ${input.lowScoreProgress.moduleTitle}`,
          description: `Текущий результат ${input.lowScoreProgress.score}%. Проработайте слабые места и пересдайте на 70%+.`,
          tag: "Quiz",
          href: `/tracks/${input.lowScoreProgress.trackSlug}/modules/${input.lowScoreProgress.moduleId}/quiz`,
        }
      : {
          id: "quiz-challenge",
          title: "Возьмите продвинутый тест",
          description: "Результаты по тестам стабильны. Поддержите темп сложным модулем.",
          tag: "Quiz",
          href: input.primaryTrack?.nextModuleHref
            ? `${input.primaryTrack.nextModuleHref}/quiz`
            : "/tracks",
        },
    {
      id: "simulation",
      title:
        input.strongestCategory === TrackCategory.BA
          ? "Попробуйте BA-симуляцию"
          : input.strongestCategory === TrackCategory.DA
            ? "Практика в SQL-песочнице"
            : "Симулятор баг-трекера",
      description:
        input.strongestCategory === TrackCategory.BA
          ? "Закрепите user stories и критерии приёмки через сценарии с обратной связью."
          : input.strongestCategory === TrackCategory.DA
            ? "Запускайте SQL-запросы на учебных данных, чтобы укрепить аналитику."
            : "Симулируйте Jira-уровень баг-репортинга и отточите QA-исполнение.",
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
      title: `Подтяните: ${input.skillRadar.weakestSkill}`,
      description: `Сильнее всего: ${input.skillRadar.strongestSkill}. Уделите одну фокусную сессию навыку ${input.skillRadar.weakestSkill}.`,
      tag: "Skill",
      href: input.skillRadar.weakestSkill === "SQL" ? "/sandbox/sql" : "/tracks",
    },
    {
      id: "career",
      title: `Возможно, вам подойдёт направление ${input.focusTrack}`,
      description:
        input.categoryTrackTitle
          ? `Ваш лучший темп — в треке ${input.categoryTrackTitle}. Привяжите его к следующему карьерному этапу.`
          : "Откройте roadmap и сопоставьте сильные навыки с карьерными целями.",
      tag: "Career",
      href: "/career",
    },
    {
      id: "mentor",
      title: "Спросите у ИИ-ментора план на неделю",
      description: input.baseRecommendationText ?? "Получите адаптивный план на следующий спринт.",
      tag: "Mentor",
      href: input.primaryTrack?.nextModuleHref ?? "/tracks",
    },
  ];
}

