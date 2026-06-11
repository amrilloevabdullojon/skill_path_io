import "server-only";

import type { TrackProgressResponse } from "@/lib/contracts/track-progress";
import type { RuntimeCourse } from "@/lib/learning/content-types";
import { findRuntimeModuleProgress } from "@/lib/learning/progress";

/**
 * Build a learner's per-module progress for a resolved track/course.
 * Returns contract DTOs (ISO dates) with a completed/total summary.
 */
export async function buildTrackProgress(
  userId: string,
  course: RuntimeCourse,
): Promise<TrackProgressResponse> {
  const moduleIds = course.modules.map((module) => module.id);
  const records = await findRuntimeModuleProgress({
    userId,
    moduleIds,
    source: course.source,
  });
  const byModule = new Map(records.map((record) => [record.moduleId, record]));

  const modules = course.modules.map((module) => {
    const record = byModule.get(module.id);
    return {
      moduleId: module.id,
      status: record?.status ?? "NOT_STARTED",
      score: record?.score ?? null,
      completedAt: record?.completedAt ? record.completedAt.toISOString() : null,
    };
  });

  return {
    slug: course.slug,
    totalModules: modules.length,
    completedModules: modules.filter((module) => module.status === "COMPLETED").length,
    modules,
  };
}
