import { prisma } from "@/lib/prisma";

// ─── Read queries for admin module pages ─────────────────────────────────────

export async function getModuleDetail(id: string) {
  return prisma.module.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      order: true,
      duration: true,
      trackId: true,
      track: { select: { id: true, title: true, slug: true, category: true } },
      quiz: { select: { id: true, title: true, passingScore: true } },
      lessons: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, order: true, type: true },
      },
      _count: { select: { lessons: true, userProgresses: true } },
    },
  });
}

export async function getModuleListData(params: { query?: string; trackId?: string }) {
  const { query, trackId } = params;

  return prisma.$transaction([
    prisma.track.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    prisma.module.findMany({
      where: {
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(trackId ? { trackId } : {}),
      },
      orderBy: [{ track: { title: "asc" } }, { order: "asc" }],
      select: {
        id: true,
        title: true,
        description: true,
        order: true,
        duration: true,
        trackId: true,
        track: { select: { title: true, slug: true, category: true } },
        quiz: { select: { id: true } },
        _count: { select: { lessons: true } },
      },
    }),
  ]);
}

export async function getTracksForSelect() {
  return prisma.track.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, category: true },
  });
}
