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

      missions.push({
        id: missionId,
        title: `${moduleItem.title} Mission`,
        scenario: moduleItem.description || `Apply concepts from ${moduleItem.title} in a practical scenario.`,
        roleContext: `${course.title} learner`,
        objective: `Produce a practical result for module "${moduleItem.title}" and document outcomes.`,
        steps,
        skillsUsed: categorySkills,
        expectedResult: "A concise artifact with assumptions, execution steps, and measurable result summary.",
        difficulty: difficultyByOrder(moduleItem.order, totalModules),
        xpReward: Math.max(60, moduleItem.xpReward || 100),
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
