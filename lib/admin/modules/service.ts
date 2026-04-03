import { prisma } from "@/lib/prisma";

// ─── Write operations for admin module actions ───────────────────────────────

export type ModuleWriteData = {
  title: string;
  description?: string | null;
  duration: number;
  order: number;
};

export async function moduleUpdate(id: string, data: ModuleWriteData) {
  return prisma.module.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description ?? undefined,
      duration: data.duration,
      order: data.order,
    },
  });
}

export async function moduleCreate(data: {
  trackId: string;
  title: string;
  description: string;
  duration: number;
  order: number;
}) {
  return prisma.module.create({ data: { ...data, content: {} } });
}

export async function moduleDelete(id: string) {
  return prisma.module.delete({ where: { id } });
}

export async function moduleBulkDelete(ids: string[]) {
  return prisma.module.deleteMany({ where: { id: { in: ids } } });
}

export async function moduleReorder(updates: { id: string; order: number }[]) {
  return prisma.$transaction(
    updates.map(({ id, order }) => prisma.module.update({ where: { id }, data: { order } })),
  );
}

/**
 * Duplicates a module and all its lessons, appending "(copy)" to the title.
 * Returns the new module, or null if the source module was not found.
 */
export async function moduleDuplicate(id: string) {
  const mod = await prisma.module.findUnique({
    where: { id },
    include: { lessons: { orderBy: { order: "asc" } } },
  });
  if (!mod) return null;

  const { _max } = await prisma.module.aggregate({
    where: { trackId: mod.trackId },
    _max: { order: true },
  });
  const newOrder = (_max.order ?? 0) + 1;

  return prisma.module.create({
    data: {
      trackId: mod.trackId,
      title: `${mod.title} (copy)`,
      description: mod.description,
      duration: mod.duration,
      order: newOrder,
      content: mod.content as object,
      lessons: {
        create: mod.lessons.map((l) => ({
          order: l.order,
          title: l.title,
          body: l.body,
          type: l.type,
        })),
      },
    },
  });
}
