import type { Metadata } from "next";
import Link from "next/link";
import { StudioContentStatus } from "@prisma/client";

import { DeleteSimulationButton } from "@/components/admin/simulations/delete-simulation-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Simulations — Admin",
  robots: { index: false },
};

const STATUS_BADGE: Record<StudioContentStatus, string> = {
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

export default async function AdminSimulationsPage() {
  await requireAdminPermission("courses.read");

  const simulations = await prisma.simulation.findMany({
    orderBy: [{ module: { course: { title: "asc" } } }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      simulationType: true,
      difficulty: true,
      xpReward: true,
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
        title="Simulations"
        description="Bug tracker, analyst workflow, SQL challenge, and interview simulations."
        actionLabel="New simulation"
        actionHref="/admin/simulations/new"
      />

      <section className="surface-elevated space-y-3 p-5">
        <p className="text-xs text-muted-foreground">
          {simulations.length} simulation{simulations.length !== 1 ? "s" : ""}
        </p>

        {simulations.length === 0 ? (
          <EmptyState
            title="No simulations found"
            description="No simulations have been created yet."
            actionLabel="New simulation"
            actionHref="/admin/simulations/new"
            size="sm"
          />
        ) : (
          <div className="table-shell">
            <table className="table-base min-w-[1000px]">
              <thead className="table-head">
                <tr>
                  <th className="px-3 py-3 text-left">Course</th>
                  <th className="px-3 py-3 text-left">Module</th>
                  <th className="px-3 py-3 text-left">Title</th>
                  <th className="px-3 py-3 text-left">Type</th>
                  <th className="px-3 py-3 text-left">Difficulty</th>
                  <th className="px-3 py-3 text-left">XP</th>
                  <th className="px-3 py-3 text-left">Time (min)</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Edit</th>
                  <th className="px-3 py-3 text-left">Del</th>
                </tr>
              </thead>
              <tbody>
                {simulations.map((s) => (
                  <tr key={s.id} className="table-row">
                    <td className="px-3 py-2 text-sm text-muted-foreground">
                      {s.module.course.title}
                    </td>
                    <td className="px-3 py-2 text-sm text-muted-foreground">
                      {s.module.title}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-foreground">
                      {s.title}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex rounded border border-border bg-card px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {s.simulationType}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${DIFFICULTY_BADGE[s.difficulty] ?? "border-border bg-card text-muted-foreground"}`}
                      >
                        {s.difficulty}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-sm text-foreground">
                      {s.xpReward}
                    </td>
                    <td className="px-3 py-2 font-mono text-sm text-foreground">
                      {s.estimatedTime}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_BADGE[s.status]}`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/simulations/${s.id}`}
                        className="btn-secondary px-2.5 py-1 text-xs"
                      >
                        Edit
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <DeleteSimulationButton
                        simulationId={s.id}
                        simulationTitle={s.title}
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
