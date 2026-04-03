import type { Metadata } from "next";
import Link from "next/link";
import type { TrackCategory, TrackStatus } from "@prisma/client";

import { updateTrackAction } from "@/app/admin/actions";
import { SaveRowButton } from "@/components/admin/save-row-button";
import { DeleteTrackButton } from "@/components/admin/tracks/delete-track-button";
import { PublishGuardForm } from "@/components/admin/tracks/publish-guard-form";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { getTrackListData } from "@/lib/admin/tracks/queries";

export const metadata: Metadata = {
  title: "Tracks — Admin",
  robots: { index: false },
};

type TracksAdminPageProps = {
  searchParams?: {
    q?: string | string[];
    category?: string | string[];
    status?: string | string[];
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

const STATUS_BADGE: Record<TrackStatus, string> = {
  DRAFT: "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide border-slate-500/40 bg-slate-500/10 text-slate-400",
  PUBLISHED: "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  ARCHIVED: "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide border-red-500/40 bg-red-500/10 text-red-400",
};

export default async function TracksAdminPage({ searchParams }: TracksAdminPageProps) {
  await requireAdminPermission("courses.read");

  const query = paramValue(searchParams?.q);
  const categoryParam = paramValue(searchParams?.category);
  const statusParam = paramValue(searchParams?.status);

  const { tracks, categoryFilter, statusFilter } = await getTrackListData({
    query,
    category: categoryParam,
    status: statusParam,
  });

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title="Tracks"
        description="Search, filter by category, and edit track metadata inline."
        actionLabel="New track"
        actionHref="/admin/tracks/new"
      />

      {/* ── Filter ────────────────────────────────────────────────── */}
      <section className="surface-elevated p-5">
        <form className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by title, slug, or description…"
            className="input-base"
          />
          <select name="category" defaultValue={categoryFilter} className="select-base">
            <option value="ALL">All categories</option>
            <option value="QA">QA</option>
            <option value="BA">BA</option>
            <option value="DA">DA</option>
          </select>
          <select name="status" defaultValue={statusFilter} className="select-base">
            <option value="ALL">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
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
          {statusFilter !== "ALL" ? ` · status: ${statusFilter}` : ""}
        </p>

        {tracks.length === 0 ? (
          <EmptyState
            title="No tracks found"
            description={
              query || categoryFilter !== "ALL" || statusFilter !== "ALL"
                ? "Try changing the search query or filters."
                : "No tracks have been created yet."
            }
            size="sm"
          />
        ) : (
          <div className="table-shell">
            <table className="table-base min-w-[1360px]">
              <thead className="table-head">
                <tr>
                  <th className="px-3 py-3 text-left">Category</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Slug</th>
                  <th className="px-3 py-3 text-left">Title</th>
                  <th className="px-3 py-3 text-left">Description</th>
                  <th className="px-3 py-3 text-left">Color</th>
                  <th className="px-3 py-3 text-left">Modules</th>
                  <th className="px-3 py-3 text-left">Certs</th>
                  <th className="px-3 py-3 text-left">Created</th>
                  <th className="px-3 py-3 text-left">Save</th>
                  <th className="px-3 py-3 text-left">Del</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((track) => (
                  <tr key={track.id} className="table-row align-top">
                    {/* Category badge + editable select */}
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
                          <option value="QA">QA</option>
                          <option value="BA">BA</option>
                          <option value="DA">DA</option>
                        </select>
                      </div>
                    </td>

                    {/* Status badge + editable select */}
                    <td className="px-3 py-2">
                      <span className={STATUS_BADGE[track.status]}>
                        {track.status}
                      </span>
                      <div className="mt-1.5">
                        <select
                          form={`track-edit-${track.id}`}
                          name="status"
                          defaultValue={track.status}
                          className="select-base h-8 px-1.5 py-0.5 text-xs"
                        >
                          <option value="DRAFT">Draft</option>
                          <option value="PUBLISHED">Published</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </div>
                    </td>

                    {/* Slug (read-only) */}
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {track.slug}
                      {track.skills.length > 0 && (
                        <div className="mt-1">
                          <span className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 text-[10px] text-sky-400">
                            {track.skills.length} skill{track.skills.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
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

                    {/* Created date */}
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {track.createdAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Save */}
                    <td className="px-3 py-2">
                      <PublishGuardForm
                        id={`track-edit-${track.id}`}
                        trackTitle={track.title}
                        currentStatus={track.status}
                        action={updateTrackAction}
                      >
                        <input type="hidden" name="trackId" value={track.id} />
                        <SaveRowButton />
                      </PublishGuardForm>
                    </td>

                    {/* Delete */}
                    <td className="px-3 py-2">
                      <DeleteTrackButton
                        trackId={track.id}
                        trackTitle={track.title}
                        moduleCount={track._count.modules}
                      />
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
