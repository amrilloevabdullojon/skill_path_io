import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateCaseAction } from "@/app/admin/actions";
import { DeleteCaseButton } from "@/components/admin/cases/delete-case-button";
import { SubmitModuleButton } from "@/components/admin/modules/submit-module-button";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Edit Case — Admin",
  robots: { index: false },
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "border-slate-500/30 bg-slate-500/10 text-slate-400",
  IN_REVIEW: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  PUBLISHED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  ARCHIVED: "border-red-500/30 bg-red-500/10 text-red-400",
};

export default async function EditCasePage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdminPermission("courses.write");

  const caseStudy = await prisma.caseStudy.findUnique({
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

  if (!caseStudy) notFound();

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title="Edit Case Study"
        description={caseStudy.title}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Main edit form ──────────────────────────────────────── */}
        <section className="surface-elevated p-6">
          <form action={updateCaseAction} className="space-y-5">
            <input type="hidden" name="caseId" value={caseStudy.id} />

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Title *</label>
              <input
                name="title"
                required
                maxLength={300}
                defaultValue={caseStudy.title}
                className="input-base"
              />
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Summary</label>
              <textarea
                name="summary"
                rows={2}
                maxLength={500}
                defaultValue={caseStudy.summary}
                className="input-base resize-none"
              />
            </div>

            {/* Problem Statement */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Problem Statement *
              </label>
              <textarea
                name="problemStatement"
                rows={5}
                required
                defaultValue={caseStudy.problemStatement}
                className="input-base resize-y"
              />
            </div>

            {/* Expected Approach */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Expected Approach
              </label>
              <textarea
                name="expectedApproach"
                rows={4}
                defaultValue={caseStudy.expectedApproach}
                className="input-base resize-y"
              />
            </div>

            {/* Outcome */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Outcome</label>
              <textarea
                name="outcome"
                rows={3}
                defaultValue={caseStudy.outcome}
                className="input-base resize-y"
              />
            </div>

            {/* Difficulty + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Difficulty</label>
                <select
                  name="difficulty"
                  defaultValue={caseStudy.difficulty}
                  className="select-base"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  name="status"
                  defaultValue={caseStudy.status}
                  className="select-base"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <SubmitModuleButton label="Save changes" />
              <Link href="/admin/cases" className="btn-secondary">
                Cancel
              </Link>
              <div className="ml-auto">
                <DeleteCaseButton
                  caseId={caseStudy.id}
                  caseTitle={caseStudy.title}
                />
              </div>
            </div>
          </form>
        </section>

        {/* ── Sidebar: readonly info ──────────────────────────────── */}
        <aside className="space-y-4">
          <section className="surface-elevated p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Info
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Module</dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {caseStudy.module.title}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Course</dt>
                <dd className="mt-0.5 text-foreground">
                  {caseStudy.module.course.title}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className="mt-0.5">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_BADGE[caseStudy.status] ?? "border-border bg-card text-muted-foreground"}`}
                  >
                    {caseStudy.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Created</dt>
                <dd className="mt-0.5 font-mono text-xs text-foreground">
                  {caseStudy.createdAt.toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </section>

          <section className="surface-elevated p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Navigation
            </h2>
            <div className="flex flex-col gap-2">
              <Link
                href={`/admin/modules/${caseStudy.module.id}`}
                className="btn-secondary justify-start text-xs"
              >
                Open module →
              </Link>
              <Link
                href="/admin/cases"
                className="btn-secondary justify-start text-xs"
              >
                All cases →
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
