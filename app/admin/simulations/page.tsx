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

const STATUS_OPTIONS: StudioContentStatus[] = ["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"];

type AdminSimulationsPageProps = {
  searchParams?: {
    q?: string | string[];
    status?: string | string[];
  };
};

function paramValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AdminSimulationsPage({ searchParams }: AdminSimulationsPageProps) {
  await requireAdminPermission("courses.read");

  const query = paramValue(searchParams?.q);
  const statusFilter = paramValue(searchParams?.status);
  const validStatus = STATUS_OPTIONS.includes(statusFilter as StudioContentStatus)
    ? (statusFilter as StudioContentStatus)
    : undefined;

  const simulations = await prisma.simulation.findMany({
    where: {
      ...(query
        ? { title: { contains: query, mode: "insensitive" } }
        : {}),
      ...(validStatus ? { status: validStatus } : {}),
    },
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

      {/* ── Filter ────────────────────────────────────────────────── */}
      <section className="surface-elevated p-5">
        <form className="grid gap-3 md:grid-cols-[1fr_200px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search simulations…"
            className="input-base"
          />
          <select name="status" defaultValue={statusFilter} className="select-base">
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="btn-secondary">
              Apply
            </button>
            {(query || statusFilter) && (
              <a href="/admin/simulations" className="btn-secondary text-muted-foreground">
                Reset
              </a>
            )}
          </div>
        </form>
      </section>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <section className="surface-elevated space-y-3 p-5">
        <p className="text-xs text-muted-foreground">
          {simulations.length} simulation{simulations.length !== 1 ? "s" : ""}
          {query && ` matching "${query}"`}
        </p>

        {simulations.length === 0 ? (
          <EmptyState
            title="No simulations found"
            description={
              query || statusFilter
                ? "No simulations match your filters."
                : "No simulations have been created yet."
            }
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
