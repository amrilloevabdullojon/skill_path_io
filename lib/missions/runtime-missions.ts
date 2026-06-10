import "server-only";

import { resolveRuntimeCatalog } from "@/lib/learning/runtime-content";
import { RuntimeCatalog } from "@/lib/learning/content-types";
import { LearningMission, MissionDifficulty, MissionStatus, TrackTag } from "@/types/personalization";

function toTrackTag(value: string): TrackTag | null {
  if (value === "QA" || value === "BA" || value === "DA") {
    return value;
  }
  return null;
}

function defaultSkillsByTrack(track: TrackTag) {
  if (track === "QA") {
    return ["Testing", "API Testing", "Bug Reporting"];
  }
  if (track === "BA") {
    return ["User Stories", "Requirements", "Communication"];
  }
  return ["SQL", "Analytics", "Communication"];
}

function difficultyByOrder(order: number, total: number): MissionDifficulty {
  if (order <= Math.ceil(total / 3)) return "Easy";
  if (order >= Math.ceil((total * 2) / 3)) return "Hard";
  return "Medium";
}

function statusByOrder(order: number): MissionStatus {
  if (order === 1) return "available";
  if (order === 2) return "in_progress";
  return "locked";
}

export function mapRuntimeCatalogToMissions(catalog: RuntimeCatalog) {
  const missions: LearningMission[] = [];

  for (const course of catalog.courses) {
    const category = toTrackTag(course.category);
    if (!category) {
      continue;
    }

    const totalModules = Math.max(course.modules.length, 1);
    const categorySkills = defaultSkillsByTrack(category);

    for (const moduleItem of course.modules) {
      const missionId = `runtime-mission-${course.slug}-${moduleItem.id}`;
      const steps = moduleItem.lessons.length > 0
        ? moduleItem.lessons.slice(0, 4).map((lesson) => `Review lesson: ${lesson.title}`)
        : [
            "Review module overview",
            "Create practical artifact",
            "Validate against checklist",
            "Summarize key learning output",
          ];

      const getRoleContext = (cat: string) => {
        if (cat === "QA") return "Ваш Менеджер Проекта";
        if (cat === "BA") return "Агрессивный Заказчик";
        return "Lead Data Engineer";
      };

      const getScenario = (title: string, cat: string) => {
        if (cat === "QA") return `В продакшене найден критический баг, связанный с темой "${title}". Проджект-менеджер в панике. Выясните подробности и локализуйте проблему.`;
        if (cat === "BA") return `Бизнес требует фичу по теме "${title}" к завтрашнему дню. У вас нет ни одного требования. Проведите интервью в чате и выбейте детали.`;
        return `Дашборд по теме "${title}" упал. Инженер на связи, но он не знает бизнес-логику. Выясните, что сломалось, и предложите решение в чате.`;
      };
      
      const getObjective = (cat: string) => {
        if (cat === "QA") return "Допросить менеджера, узнать шаги воспроизведения, браузер и составить мини-баг-репорт прямо в чате.";
        if (cat === "BA") return "Снять 3 ключевых требования, определить целевую аудиторию и успокоить заказчика.";
        return "Локализовать сбой в SQL-метриках и согласовать план починки.";
      };

      const missionDifficulty = difficultyByOrder(moduleItem.order, totalModules);
      const baseXp = moduleItem.xpReward || 100;
      const xpMultiplier = missionDifficulty === "Hard" ? 1.6 : missionDifficulty === "Medium" ? 1.2 : 1.0;
      const scaledXp = Math.max(60, Math.round((baseXp * xpMultiplier) / 10) * 10);

      missions.push({
        id: missionId,
        title: `Миссия: ${moduleItem.title}`,
        scenario: getScenario(moduleItem.title, category),
        roleContext: getRoleContext(category),
        objective: getObjective(category),
        steps,
        skillsUsed: categorySkills,
        expectedResult: "Краткий артефакт с допущениями, шагами выполнения и измеримым итогом.",
        difficulty: missionDifficulty,
        xpReward: scaledXp,
        aiEvaluation: true,
        category,
        status: statusByOrder(moduleItem.order),
      });
    }
  }

  return missions;
}

export async function resolveRuntimeMissions() {
  const catalog = await resolveRuntimeCatalog({ includeCourseEntities: true, includeDraftCourses: false });
  return mapRuntimeCatalogToMissions(catalog);
}
