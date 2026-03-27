import type { Metadata } from "next";
import Link from "next/link";
import { StudioContentStatus } from "@prisma/client";

import { DeleteAssignmentButton } from "@/components/admin/assignments/delete-assignment-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Assignments — Admin",
  robots: { index: false },
};

const STATUS_BADGE: Record<StudioContentStatus, string> = {
  DRAFT: "border-slate-500/30 bg-slate-500/10 text-slate-400",
  IN_REVIEW: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  PUBLISHED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  ARCHIVED: "border-red-500/30 bg-red-500/10 text-red-400",
};

export default async function AdminAssignmentsPage() {
  await requireAdminPermission("courses.read");

  const assignments = await prisma.assignment.findMany({
    orderBy: [{ module: { course: { title: "asc" } } }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      assignmentType: true,
      maxScore: true,
      estimatedTime: true,
      status: true,
      createdAt: true,
      module: {
        select: {
          id: true,
          title: true,
          course: { select: { id: true, title: true } },
        },
      },
    },
  });

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title="Assignments"
        description="Text tasks, bug reports, SQL tasks, and AI-reviewed practical exercises."
        actionLabel="New assignment"
        actionHref="/admin/assignments/new"
      />

      <section className="surface-elevated space-y-3 p-5">
        <p className="text-xs text-muted-foreground">
          {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}
        </p>

        {assignments.length === 0 ? (
          <EmptyState
            title="No assignments found"
            description="No assignments have been created yet."
            actionLabel="New assignment"
            actionHref="/admin/assignments/new"
            size="sm"
          />
        ) : (
          <div className="table-shell">
            <table className="table-base min-w-[900px]">
              <thead className="table-head">
                <tr>
                  <th className="px-3 py-3 text-left">Course</th>
                  <th className="px-3 py-3 text-left">Module</th>
                  <th className="px-3 py-3 text-left">Title</th>
                  <th className="px-3 py-3 text-left">Type</th>
                  <th className="px-3 py-3 text-left">Max Score</th>
                  <th className="px-3 py-3 text-left">Time (min)</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Edit</th>
                  <th className="px-3 py-3 text-left">Del</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id} className="table-row">
                    <td className="px-3 py-2 text-sm text-muted-foreground">
                      {a.module.course.title}
                    </td>
                    <td className="px-3 py-2 text-sm text-muted-foreground">
                      {a.module.title}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-foreground">
                      {a.title}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex rounded border border-border bg-card px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {a.assignmentType}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-sm text-foreground">
                      {a.maxScore}
                    </td>
                    <td className="px-3 py-2 font-mono text-sm text-foreground">
                      {a.estimatedTime}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_BADGE[a.status]}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/assignments/${a.id}`}
                        className="btn-secondary px-2.5 py-1 text-xs"
                      >
                        Edit
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <DeleteAssignmentButton
                        assignmentId={a.id}
                        assignmentTitle={a.title}
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
