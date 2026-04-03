import { LessonType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

// ─── Read queries for admin lesson pages ─────────────────────────────────────

export async function getLessonDetail(id: string) {
  return prisma.lesson.findUnique({
    where: { id },
    include: {
      module: {
        select: {
          id: true,
          title: true,
          order: true,
          track: { select: { title: true, category: true } },
        },
      },
    },
  });
}

const PAGE_SIZE = 50;

export async function getLessonListData(params: {
  query?: string;
  moduleId?: string;
  type?: string;
  page?: number;
}) {
  const { query, moduleId, type, page = 1 } = params;
  const skip = (Math.max(1, page) - 1) * PAGE_SIZE;

  const validType = Object.values(LessonType).includes(type as LessonType)
    ? (type as LessonType)
    : null;

  const where = {
    ...(query ? { title: { contains: query, mode: "insensitive" as const } } : {}),
    ...(moduleId ? { moduleId } : {}),
    ...(validType ? { type: validType } : {}),
  };

  const [modules, lessons, total] = await prisma.$transaction([
    prisma.module.findMany({
      orderBy: [{ track: { title: "asc" } }, { order: "asc" }],
      select: { id: true, title: true },
    }),
    prisma.lesson.findMany({
      where,
      orderBy: [
        { module: { track: { title: "asc" } } },
        { module: { order: "asc" } },
        { order: "asc" },
      ],
      take: PAGE_SIZE,
      skip,
      select: {
        id: true,
        title: true,
        type: true,
        order: true,
        body: true,
        moduleId: true,
        module: {
          select: {
            id: true,
            title: true,
            track: { select: { title: true, category: true } },
          },
        },
      },
    }),
    prisma.lesson.count({ where }),
  ]);

  return { modules, lessons, total, pageSize: PAGE_SIZE };
}

export async function getModulesForSelect() {
  return prisma.module.findMany({
    orderBy: [{ track: { title: "asc" } }, { order: "asc" }],
    select: {
      id: true,
      title: true,
      order: true,
      track: { select: { title: true } },
      _count: { select: { lessons: true } },
    },
  });
}
