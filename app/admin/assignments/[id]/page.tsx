import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StudioAssignmentType, StudioContentStatus } from "@prisma/client";

import { updateAssignmentAction } from "@/app/admin/actions";
import { DeleteAssignmentButton } from "@/components/admin/assignments/delete-assignment-button";
import { SubmitModuleButton } from "@/components/admin/modules/submit-module-button";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Edit Assignment — Admin",
  robots: { index: false },
};

const STATUS_BADGE: Record<StudioContentStatus, string> = {
  DRAFT: "border-slate-500/30 bg-slate-500/10 text-slate-400",
  IN_REVIEW: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  PUBLISHED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  ARCHIVED: "border-red-500/30 bg-red-500/10 text-red-400",
};

export default async function EditAssignmentPage({ params }: { params: { id: string } }) {
  await requireAdminPermission("courses.write");

  const assignment = await prisma.assignment.findUnique({
    where: { id: params.id },
    include: {
      module: {
        select: {
          id: true,
          title: true,
          course: { select: { id: true, title: true } },
        },
      },
    },
  });

  if (!assignment) notFound();

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title="Edit Assignment"
        description={assignment.title}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* ── Left: edit form ─────────────────────────────────────── */}
        <section className="surface-elevated p-6">
          <form action={updateAssignmentAction} className="space-y-5">
            <input type="hidden" name="assignmentId" value={assignment.id} />

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Title *</label>
              <input
                name="title"
                required
                maxLength={200}
                defaultValue={assignment.title}
                className="input-base"
              />
            </div>

            {/* Type + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Assignment type *</label>
                <select
                  name="assignmentType"
                  required
                  defaultValue={assignment.assignmentType}
                  className="select-base"
                >
                  {Object.values(StudioAssignmentType).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  name="status"
                  defaultValue={assignment.status}
                  className="select-base"
                >
                  {Object.values(StudioContentStatus).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Instructions *</label>
              <textarea
                name="instructions"
                required
                rows={6}
                defaultValue={assignment.instructions}
                placeholder="Describe what the student must do…"
                className="input-base resize-y"
              />
            </div>

            {/* Expected output */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Expected output</label>
              <textarea
                name="expectedOutput"
                rows={4}
                defaultValue={assignment.expectedOutput}
                placeholder="Describe the expected deliverable or outcome…"
                className="input-base resize-y"
              />
            </div>

            {/* Max score + Estimated time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Max score</label>
                <input
                  name="maxScore"
                  type="number"
                  min={0}
                  max={10000}
                  defaultValue={assignment.maxScore}
                  className="input-base"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Estimated time (min)</label>
                <input
                  name="estimatedTime"
                  type="number"
                  min={0}
                  defaultValue={assignment.estimatedTime}
                  className="input-base"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <SubmitModuleButton label="Save assignment" />
              <Link href="/admin/assignments" className="btn-secondary">
                Cancel
              </Link>
              <div className="ml-auto">
                <DeleteAssignmentButton
                  assignmentId={assignment.id}
                  assignmentTitle={assignment.title}
                />
              </div>
            </div>
          </form>
        </section>

        {/* ── Right: info sidebar ──────────────────────────────────── */}
        <aside className="space-y-4">
          <section className="surface-elevated p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Info
            </h2>
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Module</dt>
                <dd className="font-medium text-foreground">{assignment.module.title}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Course</dt>
                <dd className="text-foreground">{assignment.module.course.title}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Type</dt>
                <dd>
                  <span className="inline-flex rounded border border-border bg-card px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {assignment.assignmentType}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_BADGE[assignment.status]}`}
                  >
                    {assignment.status}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-mono text-xs text-foreground">
                  {assignment.createdAt.toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </section>

          <section className="surface-elevated p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Navigate
            </h2>
            <div className="flex flex-col gap-2">
              <Link
                href={`/admin/modules/${assignment.module.id}`}
                className="btn-secondary justify-start text-xs"
              >
                Open module →
              </Link>
              <Link href="/admin/assignments" className="btn-secondary justify-start text-xs">
                All assignments →
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
