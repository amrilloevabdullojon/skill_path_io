import type { Metadata } from "next";

import { createMediaAction } from "@/app/admin/actions";
import { DeleteMediaButton } from "@/components/admin/media/delete-media-button";
import { SubmitModuleButton } from "@/components/admin/modules/submit-module-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Media Library — Admin",
  robots: { index: false },
};

const TYPE_BADGE: Record<string, string> = {
  image: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  video: "border-violet-500/30 bg-violet-500/10 text-violet-400",
  document: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  audio: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

function formatSize(sizeKb: number): string {
  if (sizeKb < 1024) return `${sizeKb} KB`;
  return `${(sizeKb / 1024).toFixed(1)} MB`;
}

type MediaPageProps = {
  searchParams?: { q?: string | string[] };
};

function paramValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AdminMediaPage({ searchParams }: MediaPageProps) {
  await requireAdminPermission("media.manage");

  const query = paramValue(searchParams?.q);

  const assets = await prisma.mediaAsset.findMany({
    where: query
      ? { name: { contains: query, mode: "insensitive" } }
      : undefined,
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Assets"
        title="Media Library"
        description="Manage media assets used across courses and modules."
      />

      {/* ── Register URL form ──────────────────────────────────────── */}
      <section className="surface-elevated p-5">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Register URL
        </h2>
        <form action={createMediaAction} className="grid gap-3 md:grid-cols-[1fr_160px_1fr_100px_160px_auto]">
          <input
            name="name"
            required
            placeholder="Asset name…"
            className="input-base"
          />
          <select name="type" defaultValue="document" className="select-base">
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
            <option value="audio">Audio</option>
          </select>
          <input
            name="url"
            required
            type="url"
            placeholder="https://…"
            className="input-base"
          />
          <input
            name="sizeKb"
            type="number"
            min={0}
            placeholder="KB"
            className="input-base"
          />
          <input
            name="uploadedBy"
            placeholder="Uploaded by (optional)"
            className="input-base"
          />
          <SubmitModuleButton label="Register" />
        </form>
      </section>

      {/* ── Search filter ─────────────────────────────────────────── */}
      <section className="surface-elevated p-5">
        <form className="flex gap-3">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name…"
            className="input-base max-w-sm"
          />
          <button type="submit" className="btn-secondary">
            Search
          </button>
          {query && (
            <a href="/admin/media" className="btn-secondary text-muted-foreground">
              Reset
            </a>
          )}
        </form>
      </section>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <section className="surface-elevated space-y-3 p-5">
        <p className="text-xs text-muted-foreground">
          {assets.length} asset{assets.length !== 1 ? "s" : ""}
          {query ? ` matching "${query}"` : ""}
        </p>

        {assets.length === 0 ? (
          <EmptyState
            title="No assets found"
            description={
              query
                ? "Try a different search term."
                : "No media assets have been registered yet."
            }
            size="sm"
          />
        ) : (
          <div className="table-shell">
            <table className="table-base min-w-[800px]">
              <thead className="table-head">
                <tr>
                  <th className="px-3 py-3 text-left">Name</th>
                  <th className="px-3 py-3 text-left">Type</th>
                  <th className="px-3 py-3 text-left">Size</th>
                  <th className="px-3 py-3 text-left">URL</th>
                  <th className="px-3 py-3 text-left">Uploaded</th>
                  <th className="px-3 py-3 text-left">Del</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id} className="table-row">
                    <td className="px-3 py-2">
                      <p className="text-sm font-medium text-foreground">{asset.name}</p>
                      {asset.uploadedBy && (
                        <p className="text-xs text-muted-foreground">{asset.uploadedBy}</p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TYPE_BADGE[asset.type] ?? "border-border bg-card text-muted-foreground"}`}
                      >
                        {asset.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-sm text-muted-foreground">
                      {formatSize(asset.sizeKb)}
                    </td>
                    <td className="max-w-xs px-3 py-2">
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-xs text-sky-400 hover:underline"
                      >
                        {asset.url}
                      </a>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {asset.uploadedAt.toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">
                      <DeleteMediaButton mediaId={asset.id} mediaName={asset.name} />
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
