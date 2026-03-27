import type { Metadata } from "next";
import Link from "next/link";
import { TrackCategory } from "@prisma/client";

import { updateTrackAction } from "@/app/admin/actions";
import { SaveRowButton } from "@/components/admin/save-row-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Tracks — Admin",
  robots: { index: false },
};

type TracksAdminPageProps = {
  searchParams?: {
    q?: string | string[];
    category?: string | string[];
  };
};

function paramValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

const TRACK_BADGE: Record<TrackCategory, string> = {
  QA: "track-badge-qa",
  BA: "track-badge-ba",
  DA: "track-badge-da",
};

export default async function TracksAdminPage({ searchParams }: TracksAdminPageProps) {
  await requireAdminPermission("courses.read");

  const query = paramValue(searchParams?.q);
  const categoryParam = paramValue(searchParams?.category);
  const categoryFilter = Object.values(TrackCategory).includes(categoryParam as TrackCategory)
    ? (categoryParam as TrackCategory)
    : "ALL";

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
      ...(categoryFilter !== "ALL" ? { category: categoryFilter } : {}),
    },
    orderBy: { title: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      color: true,
      category: true,
      _count: { select: { modules: true, certificates: true } },
    },
  });

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title="Tracks"
        description="Search, filter by category, and edit track metadata inline."
      />

      {/* ── Filter ────────────────────────────────────────────────── */}
      <section className="surface-elevated p-5">
        <form className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by title, slug, or description…"
            className="input-base"
          />
          <select name="category" defaultValue={categoryFilter} className="select-base">
            <option value="ALL">All categories</option>
            <option value={TrackCategory.QA}>QA</option>
            <option value={TrackCategory.BA}>BA</option>
            <option value={TrackCategory.DA}>DA</option>
          </select>
          <button type="submit" className="btn-secondary">
            Apply
          </button>
        </form>
      </section>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <section className="surface-elevated space-y-3 p-5">
        <p className="text-xs text-muted-foreground">
          {tracks.length} track{tracks.length !== 1 ? "s" : ""}
          {query ? ` matching "${query}"` : ""}
          {categoryFilter !== "ALL" ? ` · category: ${categoryFilter}` : ""}
        </p>

        {tracks.length === 0 ? (
          <EmptyState
            title="No tracks found"
            description={
              query || categoryFilter !== "ALL"
                ? "Try changing the search query or category filter."
                : "No tracks have been created yet."
            }
            size="sm"
          />
        ) : (
          <div className="table-shell">
            <table className="table-base min-w-[1160px]">
              <thead className="table-head">
                <tr>
                  <th className="px-3 py-3 text-left">Category</th>
                  <th className="px-3 py-3 text-left">Slug</th>
                  <th className="px-3 py-3 text-left">Title</th>
                  <th className="px-3 py-3 text-left">Description</th>
                  <th className="px-3 py-3 text-left">Color</th>
                  <th className="px-3 py-3 text-left">Modules</th>
                  <th className="px-3 py-3 text-left">Certs</th>
                  <th className="px-3 py-3 text-left">Save</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((track) => (
                  <tr key={track.id} className="table-row align-top">
                    {/* Category badge (read-only display) + editable select */}
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TRACK_BADGE[track.category]}`}
                      >
                        {track.category}
                      </span>
                      <div className="mt-1.5">
                        <select
                          form={`track-edit-${track.id}`}
                          name="category"
                          defaultValue={track.category}
                          className="select-base h-8 px-1.5 py-0.5 text-xs"
                        >
                          <option value={TrackCategory.QA}>QA</option>
                          <option value={TrackCategory.BA}>BA</option>
                          <option value={TrackCategory.DA}>DA</option>
                        </select>
                      </div>
                    </td>

                    {/* Slug (read-only) */}
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {track.slug}
                    </td>

                    {/* Title */}
                    <td className="px-3 py-2">
                      <input
                        form={`track-edit-${track.id}`}
                        name="title"
                        defaultValue={track.title}
                        maxLength={200}
                        className="input-base h-9 min-w-[160px] px-2 py-1.5 text-sm"
                      />
                    </td>

                    {/* Description */}
                    <td className="px-3 py-2">
                      <input
                        form={`track-edit-${track.id}`}
                        name="description"
                        defaultValue={track.description}
                        maxLength={500}
                        className="input-base h-9 min-w-[200px] px-2 py-1.5 text-xs"
                      />
                    </td>

                    {/* Color hex */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-5 w-5 shrink-0 rounded border border-border"
                          style={{ background: track.color }}
                        />
                        <input
                          form={`track-edit-${track.id}`}
                          name="color"
                          defaultValue={track.color}
                          maxLength={20}
                          className="input-base h-9 w-28 px-2 py-1.5 font-mono text-xs"
                        />
                      </div>
                    </td>

                    {/* Modules count → link to modules filtered */}
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/modules?trackId=${track.id}`}
                        className="text-sm text-sky-300 hover:underline"
                      >
                        {track._count.modules}
                      </Link>
                    </td>

                    {/* Certs count → link to certificates filtered */}
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/certificates?trackId=${track.id}`}
                        className="text-sm text-sky-300 hover:underline"
                      >
                        {track._count.certificates}
                      </Link>
                    </td>

                    {/* Save */}
                    <td className="px-3 py-2">
                      <form id={`track-edit-${track.id}`} action={updateTrackAction}>
                        <input type="hidden" name="trackId" value={track.id} />
                        <SaveRowButton />
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
