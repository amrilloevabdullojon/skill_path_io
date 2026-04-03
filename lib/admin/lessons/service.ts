import type { LessonType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

// ─── Write operations for admin lesson actions ───────────────────────────────

export async function lessonCreate(data: {
  moduleId: string;
  title: string;
  body: string;
  type: LessonType;
  order: number;
}) {
  return prisma.lesson.create({ data });
}

export async function lessonUpdate(
  id: string,
  data: { title: string; body: string; type: LessonType; order: number },
) {
  return prisma.lesson.update({
    where: { id },
    data,
    select: { moduleId: true },
  });
}

export async function lessonDelete(id: string) {
  return prisma.lesson.delete({
    where: { id },
    select: { moduleId: true },
  });
}

export async function lessonBulkDelete(ids: string[]) {
  return prisma.lesson.deleteMany({ where: { id: { in: ids } } });
}
