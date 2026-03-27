import type { Metadata } from "next";
import { TrackCategory } from "@prisma/client";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ModulesTable, type TrackGroup } from "@/components/admin/modules/modules-table";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Modules — Admin",
  robots: { index: false },
};

type ModulesAdminPageProps = {
  searchParams?: {
    q?: string | string[];
    trackId?: string | string[];
  };
};

function paramValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ModulesAdminPage({ searchParams }: ModulesAdminPageProps) {
  await requireAdminPermission("courses.read");

  const query = paramValue(searchParams?.q);
  const trackIdFilter = paramValue(searchParams?.trackId);

  const [tracks, modules] = await prisma.$transaction([
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
        ...(trackIdFilter ? { trackId: trackIdFilter } : {}),
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

  const activeTrackLabel = trackIdFilter
    ? (tracks.find((t) => t.id === trackIdFilter)?.title ?? "selected track")
    : null;

  // Group modules by track preserving fetch order
  const groupMap = new Map<string, TrackGroup>();
  for (const mod of modules) {
    if (!groupMap.has(mod.trackId)) {
      groupMap.set(mod.trackId, {
        trackId: mod.trackId,
        trackTitle: mod.track.title,
        trackSlug: mod.track.slug,
        category: mod.track.category as string,
        modules: [],
      });
    }
    groupMap.get(mod.trackId)!.modules.push({
      ...mod,
      description: mod.description ?? "",
      track: { ...mod.track, category: mod.track.category as string },
    });
  }
  const groups = Array.from(groupMap.values());

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title="Modules"
        description="Search, filter, and edit module metadata inline. Drag rows to reorder within a track."
        actionLabel="New module"
        actionHref="/admin/modules/new"
      />

      {/* ── Filter ────────────────────────────────────────────────── */}
      <section className="surface-elevated p-5">
        <form className="grid gap-3 md:grid-cols-[1fr_260px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search title or description…"
            className="input-base"
          />
          <select name="trackId" defaultValue={trackIdFilter} className="select-base">
            <option value="">All tracks</option>
            {tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.title}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-secondary">
            Apply
          </button>
        </form>
      </section>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <section className="surface-elevated space-y-3 p-5">
        <p className="text-xs text-muted-foreground">
          {modules.length} module{modules.length !== 1 ? "s" : ""}
          {query ? ` matching "${query}"` : ""}
          {activeTrackLabel ? ` in ${activeTrackLabel}` : ""}
        </p>

        {modules.length === 0 ? (
          <EmptyState
            title="No modules found"
            description={
              query || trackIdFilter
                ? "Try changing the search query or track filter."
                : "No modules exist yet. Create the first one."
            }
            actionLabel="New module"
            actionHref="/admin/modules/new"
            size="sm"
          />
        ) : (
          <ModulesTable groups={groups} />
        )}
      </section>
    </section>
  );
}
