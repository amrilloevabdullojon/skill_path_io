import { prisma } from "@/lib/prisma";

// ─── Read queries for admin quiz pages ───────────────────────────────────────

export async function getQuizDetail(id: string) {
  return prisma.quiz.findUnique({
    where: { id },
    include: {
      module: {
        select: {
          id: true,
          title: true,
          track: { select: { title: true } },
        },
      },
      questions: { orderBy: { id: "asc" } },
    },
  });
}

export async function getQuizListData(params: { query?: string; moduleId?: string }) {
  const { query, moduleId } = params;

  return prisma.$transaction([
    prisma.module.findMany({
      where: { quiz: { isNot: null } },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    prisma.quiz.findMany({
      where: {
        ...(query ? { title: { contains: query, mode: "insensitive" } } : {}),
        ...(moduleId ? { moduleId } : {}),
      },
      orderBy: [
        { module: { track: { title: "asc" } } },
        { module: { order: "asc" } },
      ],
      select: {
        id: true,
        title: true,
        passingScore: true,
        module: {
          select: {
            id: true,
            title: true,
            track: { select: { title: true, category: true } },
          },
        },
        _count: { select: { questions: true } },
      },
    }),
  ]);
}

/** Returns modules that do not yet have a quiz attached (for the new-quiz form). */
export async function getModulesWithoutQuiz() {
  return prisma.module.findMany({
    where: { quiz: null },
    orderBy: [{ track: { title: "asc" } }, { order: "asc" }],
    select: {
      id: true,
      title: true,
      track: { select: { title: true } },
    },
  });
}
