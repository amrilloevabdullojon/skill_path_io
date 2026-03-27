import type { Metadata } from "next";
import Link from "next/link";

import { DeleteCaseButton } from "@/components/admin/cases/delete-case-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Cases — Admin",
  robots: { index: false },
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "border-slate-500/30 bg-slate-500/10 text-slate-400",
  IN_REVIEW: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  PUBLISHED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  ARCHIVED: "border-red-500/30 bg-red-500/10 text-red-400",
};

const DIFFICULTY_BADGE: Record<string, string> = {
  EASY: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  MEDIUM: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  HARD: "border-rose-500/30 bg-rose-500/10 text-rose-400",
};

export default async function AdminCasesPage() {
  await requireAdminPermission("courses.read");

  const cases = await prisma.caseStudy.findMany({
    orderBy: [
      { module: { course: { title: "asc" } } },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      title: true,
      summary: true,
      difficulty: true,
      status: true,
      createdAt: true,
      module: {
        select: {
          id: true,
          title: true,
          course: { select: { title: true } },
        },
      },
    },
  });

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title="Case Library"
        description="Real-world case studies with expected approaches and outcomes."
        actionLabel="New case"
        actionHref="/admin/cases/new"
      />

      <section className="surface-elevated space-y-3 p-5">
        <p className="text-xs text-muted-foreground">
          {cases.length} case{cases.length !== 1 ? "s" : ""}
        </p>

        {cases.length === 0 ? (
          <EmptyState
            title="No cases found"
            description="No case studies have been created yet."
            actionLabel="New case"
            actionHref="/admin/cases/new"
            size="sm"
          />
        ) : (
          <div className="table-shell">
            <table className="table-base min-w-[860px]">
              <thead className="table-head">
                <tr>
                  <th className="px-3 py-3 text-left">Course</th>
                  <th className="px-3 py-3 text-left">Module</th>
                  <th className="px-3 py-3 text-left">Title</th>
                  <th className="px-3 py-3 text-left">Difficulty</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Edit</th>
                  <th className="px-3 py-3 text-left">Del</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id} className="table-row">
                    <td className="px-3 py-2 text-sm text-muted-foreground">
                      {c.module.course.title}
                    </td>
                    <td className="px-3 py-2 text-sm text-muted-foreground">
                      {c.module.title}
                    </td>
                    <td className="px-3 py-2">
                      <p className="text-sm font-medium text-foreground">{c.title}</p>
                      {c.summary && (
                        <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">
                          {c.summary}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${DIFFICULTY_BADGE[c.difficulty] ?? "border-border bg-card text-muted-foreground"}`}
                      >
                        {c.difficulty}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_BADGE[c.status] ?? "border-border bg-card text-muted-foreground"}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/cases/${c.id}`}
                        className="btn-secondary px-2.5 py-1 text-xs"
                      >
                        Edit
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <DeleteCaseButton caseId={c.id} caseTitle={c.title} />
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
