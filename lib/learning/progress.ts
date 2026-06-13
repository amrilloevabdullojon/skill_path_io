import "server-only";

import { ProgressStatus } from "@prisma/client";

import type { RuntimeContentSource } from "@/lib/learning/content-types";
import { prisma } from "@/lib/prisma";

export type RuntimeModuleProgress = {
  moduleId: string;
  status: ProgressStatus;
  score: number | null;
  completedAt: Date | null;
};

function isStudioBackedSource(source: RuntimeContentSource) {
  return source === "prisma-course";
}

export async function findRuntimeModuleProgress(params: {
  userId: string;
  moduleIds: string[];
  source: RuntimeContentSource;
}): Promise<RuntimeModuleProgress[]> {
  const moduleIds = Array.from(new Set(params.moduleIds.filter(Boolean)));
  if (moduleIds.length === 0) {
    return [];
  }

  if (params.source === "prisma-track") {
    const records = await prisma.userProgress.findMany({
      where: { userId: params.userId, moduleId: { in: moduleIds } },
    });
    return records.map((record) => ({
      moduleId: record.moduleId,
      status: record.status,
      score: record.score,
      completedAt: record.completedAt,
    }));
  }

  if (isStudioBackedSource(params.source)) {
    const records = await prisma.courseModuleProgress.findMany({
      where: { userId: params.userId, courseModuleId: { in: moduleIds } },
    });
    return records.map((record) => ({
      moduleId: record.courseModuleId,
      status: record.status,
      score: record.score,
      completedAt: record.completedAt,
    }));
  }

  return [];
}

export async function findRuntimeModuleProgressById(params: {
  userId: string;
  moduleId: string;
  source: RuntimeContentSource;
}): Promise<RuntimeModuleProgress | null> {
  const records = await findRuntimeModuleProgress({
    userId: params.userId,
    moduleIds: [params.moduleId],
    source: params.source,
  });
  return records[0] ?? null;
}

export async function upsertRuntimeModuleProgress(params: {
  userId: string;
  moduleId: string;
  source: RuntimeContentSource;
  status: ProgressStatus;
  score?: number | null;
  completedAt?: Date | null;
}): Promise<void> {
  if (params.source === "prisma-track") {
    await prisma.userProgress.upsert({
      where: {
        userId_moduleId: {
          userId: params.userId,
          moduleId: params.moduleId,
        },
      },
      update: {
        status: params.status,
        score: params.score,
        completedAt: params.completedAt,
      },
      create: {
        userId: params.userId,
        moduleId: params.moduleId,
        status: params.status,
        score: params.score,
        completedAt: params.completedAt,
      },
    });
    return;
  }

  if (isStudioBackedSource(params.source)) {
    await prisma.courseModuleProgress.upsert({
      where: {
        userId_courseModuleId: {
          userId: params.userId,
          courseModuleId: params.moduleId,
        },
      },
      update: {
        status: params.status,
        score: params.score,
        completedAt: params.completedAt,
      },
      create: {
        userId: params.userId,
        courseModuleId: params.moduleId,
        status: params.status,
        score: params.score,
        completedAt: params.completedAt,
      },
    });
  }
}
