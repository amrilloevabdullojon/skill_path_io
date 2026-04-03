import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrackCategory, TrackStatus } from "@prisma/client";

import { updateTrackAction } from "@/app/admin/actions";
import { SubmitModuleButton } from "@/components/admin/modules/submit-module-button";
import { TrackSkillsEditor } from "@/components/admin/tracks/track-skills-editor";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { getTrackDetail } from "@/lib/admin/tracks/queries";

export const metadata: Metadata = {
  title: "Edit Track — Admin",
  robots: { index: false },
};

const STATUS_BADGE: Record<TrackStatus, string> = {
  DRAFT:
    "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide border-slate-500/40 bg-slate-500/10 text-slate-400",
  PUBLISHED:
    "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  ARCHIVED:
    "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide border-red-500/40 bg-red-500/10 text-red-400",
};

type Props = { params: { id: string } };

export default async function TrackDetailPage({ params }: Props) {
  await requireAdminPermission("courses.write");

  const result = await getTrackDetail(params.id);
  if (!result) notFound();

  const { track, enrolledCount, completedCount } = result;

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title={track.title}
        description={`Edit track metadata, skills, and learning outcomes.`}
        actionLabel="← Back to tracks"
        actionHref="/admin/tracks"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ── Left column: edit form ─────────────────────────────── */}
        <form action={updateTrackAction} className="space-y-5">
          <input type="hidden" name="trackId" value={track.id} />

          {/* Metadata */}
          <section className="surface-elevated space-y-4 p-5">
            <h2 className="section-title">Metadata</h2>

            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="track-title" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Title <span className="text-rose-400">*</span>
              </label>
              <input
                id="track-title"
                name="title"
                required
                maxLength={200}
                defaultValue={track.title}
                className="input-base"
              />
            </div>

            {/* Slug (read-only) */}
            <div className="space-y-1.5">
              <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Slug
              </span>
              <input
                value={track.slug}
                readOnly
                className="input-base cursor-not-allowed font-mono opacity-60"
              />
              <p className="text-xs text-muted-foreground">
                Slug cannot be changed after creation.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="track-desc" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="track-desc"
                name="description"
                required
                rows={3}
                maxLength={500}
                defaultValue={track.description}
                className="input-base resize-none"
              />
            </div>

            {/* Icon */}
            <div className="space-y-1.5">
              <label htmlFor="track-icon" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Icon
              </label>
              <input
                id="track-icon"
                name="icon"
                maxLength={10}
                defaultValue={track.icon}
                placeholder="📚"
                className="input-base"
              />
              <p className="text-xs text-muted-foreground">Emoji or short string.</p>
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Color <span className="text-rose-400">*</span>
              </span>
              <div className="flex items-center gap-3">
                <span
                  className="inline-block h-9 w-9 shrink-0 rounded border border-border"
                  style={{ background: track.color }}
                />
                <input
                  name="color"
                  required
                  maxLength={20}
                  defaultValue={track.color}
                  placeholder="#6366f1"
                  className="input-base font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground">Hex color used in badges and charts.</p>
            </div>
          </section>

          {/* Classification */}
          <section className="surface-elevated space-y-4 p-5">
            <h2 className="section-title">Classification</h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label htmlFor="track-category" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Category <span className="text-rose-400">*</span>
                </label>
                <select
                  id="track-category"
                  name="category"
                  required
                  defaultValue={track.category}
                  className="select-base"
                >
                  <option value={TrackCategory.QA}>QA</option>
                  <option value={TrackCategory.BA}>BA</option>
                  <option value={TrackCategory.DA}>DA</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label htmlFor="track-status" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Status
                </label>
                <select
                  id="track-status"
                  name="status"
                  defaultValue={track.status}
                  className="select-base"
                >
                  <option value={TrackStatus.DRAFT}>Draft</option>
                  <option value={TrackStatus.PUBLISHED}>Published</option>
                  <option value={TrackStatus.ARCHIVED}>Archived</option>
                </select>
              </div>
            </div>

            {/* Estimated Weeks */}
            <div className="space-y-1.5">
              <label htmlFor="track-weeks" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Estimated Weeks
              </label>
              <input
                id="track-weeks"
                name="estimatedWeeks"
                type="number"
                min={1}
                max={52}
                defaultValue={track.estimatedWeeks ?? ""}
                placeholder="e.g. 8"
                className="input-base"
              />
              <p className="text-xs text-muted-foreground">
                Optional. How many weeks to complete this track (1–52).
              </p>
            </div>
          </section>

          {/* Skills */}
          <section className="surface-elevated space-y-4 p-5">
            <h2 className="section-title">Skills</h2>
            <TrackSkillsEditor
              name="skills_raw"
              label="Skills"
              placeholder="e.g. SQL"
              initialValues={track.skills}
            />
          </section>

          {/* Learning Outcomes */}
          <section className="surface-elevated space-y-4 p-5">
            <h2 className="section-title">Learning Outcomes</h2>
            <TrackSkillsEditor
              name="outcomes_raw"
              label="Learning Outcomes"
              placeholder="e.g. Understand testing fundamentals"
              initialValues={track.learningOutcomes}
            />
          </section>

          {/* Career Impact */}
          <section className="surface-elevated space-y-4 p-5">
            <h2 className="section-title">Career Impact</h2>
            <div className="space-y-1.5">
              <label htmlFor="track-career" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Career Impact
              </label>
              <textarea
                id="track-career"
                name="careerImpact"
                rows={3}
                maxLength={500}
                defaultValue={track.careerImpact ?? ""}
                placeholder="Describe how this track impacts career growth…"
                className="input-base resize-none"
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <SubmitModuleButton label="Save changes" pendingLabel="Saving…" />
            <Link href="/admin/tracks" className="btn-secondary">
              ← Back to tracks
            </Link>
          </div>
        </form>

        {/* ── Right column: sidebar panels ──────────────────────── */}
        <div className="space-y-4">

          {/* Track Info */}
          <section className="surface-elevated space-y-4 p-5">
            <h2 className="section-title">Track Info</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium text-foreground">
                  {track.createdAt.toLocaleDateString()}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="text-muted-foreground">Updated</dt>
                <dd className="font-medium text-foreground">
                  {track.updatedAt.toLocaleDateString()}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="text-muted-foreground">Slug</dt>
                <dd>
                  <code className="font-mono text-xs text-foreground">{track.slug}</code>
                </dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <span className={STATUS_BADGE[track.status]}>{track.status}</span>
                </dd>
              </div>
            </dl>
          </section>

          {/* Stats */}
          <section className="surface-elevated space-y-4 p-5">
            <h2 className="section-title">Stats</h2>
            <dl className="grid grid-cols-2 gap-3">
              <div className="surface-subtle space-y-0.5 p-3">
                <dt className="text-xs text-muted-foreground">Modules</dt>
                <dd className="text-xl font-semibold text-foreground">
                  {track._count.modules}
                </dd>
              </div>
              <div className="surface-subtle space-y-0.5 p-3">
                <dt className="text-xs text-muted-foreground">Certificates issued</dt>
                <dd className="text-xl font-semibold text-foreground">
                  {track._count.certificates}
                </dd>
              </div>
              <div className="surface-subtle space-y-0.5 p-3">
                <dt className="text-xs text-muted-foreground">Learners enrolled</dt>
                <dd className="text-xl font-semibold text-foreground">{enrolledCount}</dd>
              </div>
              <div className="surface-subtle space-y-0.5 p-3">
                <dt className="text-xs text-muted-foreground">Completions</dt>
                <dd className="text-xl font-semibold text-foreground">{completedCount}</dd>
              </div>
            </dl>
          </section>

          {/* Modules list */}
          <section className="surface-elevated space-y-4 p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="section-title">
                Modules
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  ({track._count.modules})
                </span>
              </h2>
              <Link href="/admin/modules" className="text-xs text-sky-300 hover:underline">
                Manage all
              </Link>
            </div>

            {track.modules.length === 0 ? (
              <EmptyState
                title="No modules yet"
                description="Add modules to build out this track."
                size="sm"
                actionLabel="Add module"
                actionHref="/admin/modules/new"
              />
            ) : (
              <ol className="space-y-1.5">
                {track.modules.map((mod) => (
                  <li key={mod.id}>
                    <Link
                      href={`/admin/modules/${mod.id}`}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-border/80 hover:bg-card/60"
                    >
                      <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                        {mod.order}.
                      </span>
                      <span className="flex-1 truncate text-foreground">{mod.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {mod._count.lessons} lesson{mod._count.lessons !== 1 ? "s" : ""}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {mod.duration}m
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
