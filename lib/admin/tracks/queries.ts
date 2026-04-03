import type { TrackCategory, TrackStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

// ─── Read queries for admin track pages ──────────────────────────────────────

export async function getTrackDetail(id: string) {
  const track = await prisma.track.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          duration: true,
          _count: { select: { lessons: true } },
        },
      },
      certificates: { select: { id: true } },
      _count: { select: { modules: true, certificates: true } },
    },
  });

  if (!track) return null;

  const moduleIds = track.modules.map((m) => m.id);

  const enrolledCount =
    moduleIds.length > 0
      ? await prisma.userProgress
          .groupBy({ by: ["userId"], where: { moduleId: { in: moduleIds } } })
          .then((r) => r.length)
      : 0;

  const completedCount =
    moduleIds.length > 0
      ? await prisma.userProgress
          .groupBy({
            by: ["userId"],
            where: { moduleId: { in: moduleIds }, completedAt: { not: null } },
            having: { userId: { _count: { equals: moduleIds.length } } },
          })
          .then((r) => r.length)
          .catch(() => 0)
      : 0;

  return { track, enrolledCount, completedCount };
}

export async function getTrackListData(params: {
  query?: string;
  category?: string;
  status?: string;
}) {
  const { query, category, status } = params;

  const VALID_CATEGORIES = ["QA", "BA", "DA"] as const;
  const VALID_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

  const categoryFilter = (VALID_CATEGORIES as readonly string[]).includes(category ?? "")
    ? (category as TrackCategory)
    : null;

  const statusFilter = (VALID_STATUSES as readonly string[]).includes(status ?? "")
    ? (status as TrackStatus)
    : null;

  const tracks = await prisma.track.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { slug: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(categoryFilter ? { category: categoryFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    orderBy: { title: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      color: true,
      category: true,
      status: true,
      createdAt: true,
      skills: true,
      _count: { select: { modules: true, certificates: true } },
    },
  });

  return { tracks, categoryFilter: categoryFilter ?? "ALL", statusFilter: statusFilter ?? "ALL" };
}
