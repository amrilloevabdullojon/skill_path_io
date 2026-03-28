import "server-only";

export type {
  RuntimeCatalog,
  RuntimeCategory,
  RuntimeContentSource,
  RuntimeCourse,
  RuntimeLesson,
  RuntimeMission,
  RuntimeModule,
  RuntimeQuestion,
  RuntimeQuiz,
  RuntimeSimulation,
  RuntimeStatus,
  RuntimeVisibility,
} from "@/lib/learning/content-types";

export {
  adaptPrismaCourseToRuntimeCourse,
  adaptPrismaTrackToRuntimeCourse,
  adaptSeedTrackToRuntimeCourse,
  adaptStudioEntityToRuntimeCourse,
} from "@/lib/learning/content-adapters";

export {
  resolveRuntimeCatalog,
  resolveRuntimeCourseById,
  resolveRuntimeCourseBySlug,
} from "@/lib/learning/content-resolver";

import { RuntimeCategory, RuntimeCourse } from "@/lib/learning/content-types";

export type TrackProgress = {
  completedModules: number;
  totalModules: number;
  progressPercent: number;
  isStarted: boolean;
};

export type RuntimeTrackCardData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: "Junior" | "Middle";
  durationWeeks: number;
  category: RuntimeCategory;
  modules: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
  }>;
  progress?: TrackProgress;
};

export function toRuntimeTrackCardData(course: RuntimeCourse): RuntimeTrackCardData {
  const level = course.level === "INTERMEDIATE" || course.level === "ADVANCED" ? "Middle" : "Junior";
  const durationWeeks = Math.max(1, Math.round(course.estimatedDuration / (60 * 3)));

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.shortDescription || course.description,
    level,
    durationWeeks,
    category: course.category,
    modules: course.modules
      .sort((a, b) => a.order - b.order)
      .map((moduleItem) => ({
        id: moduleItem.id,
        title: moduleItem.title,
        description: moduleItem.description,
        order: moduleItem.order,
      })),
  };
}
