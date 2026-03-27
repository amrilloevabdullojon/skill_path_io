import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StudioSimulationType, StudioContentStatus } from "@prisma/client";

import { updateSimulationAction } from "@/app/admin/actions";
import { DeleteSimulationButton } from "@/components/admin/simulations/delete-simulation-button";
import { SubmitModuleButton } from "@/components/admin/modules/submit-module-button";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Edit Simulation — Admin",
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

export default async function EditSimulationPage({ params }: { params: { id: string } }) {
  await requireAdminPermission("courses.write");

  const simulation = await prisma.simulation.findUnique({
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

  if (!simulation) notFound();

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title="Edit Simulation"
        description={simulation.title}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* ── Left: edit form ─────────────────────────────────────── */}
        <section className="surface-elevated p-6">
          <form action={updateSimulationAction} className="space-y-5">
            <input type="hidden" name="simulationId" value={simulation.id} />

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Title *</label>
              <input
                name="title"
                required
                maxLength={200}
                defaultValue={simulation.title}
                className="input-base"
              />
            </div>

            {/* Type + Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Simulation type *</label>
                <select
                  name="simulationType"
                  required
                  defaultValue={simulation.simulationType}
                  className="select-base"
                >
                  {Object.values(StudioSimulationType).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Difficulty</label>
                <select
                  name="difficulty"
                  defaultValue={simulation.difficulty}
                  className="select-base"
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select
                name="status"
                defaultValue={simulation.status}
                className="select-base"
              >
                {Object.values(StudioContentStatus).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Scenario */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Scenario *</label>
              <textarea
                name="scenario"
                required
                rows={6}
                defaultValue={simulation.scenario}
                placeholder="Describe the simulation scenario…"
                className="input-base resize-y"
              />
            </div>

            {/* Estimated time + XP reward */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Estimated time (min)</label>
                <input
                  name="estimatedTime"
                  type="number"
                  min={0}
                  defaultValue={simulation.estimatedTime}
                  className="input-base"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">XP reward</label>
                <input
                  name="xpReward"
                  type="number"
                  min={0}
                  defaultValue={simulation.xpReward}
                  className="input-base"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <SubmitModuleButton label="Save simulation" />
              <Link href="/admin/simulations" className="btn-secondary">
                Cancel
              </Link>
              <div className="ml-auto">
                <DeleteSimulationButton
                  simulationId={simulation.id}
                  simulationTitle={simulation.title}
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
                <dd className="font-medium text-foreground">{simulation.module.title}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Course</dt>
                <dd className="text-foreground">{simulation.module.course.title}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Type</dt>
                <dd>
                  <span className="inline-flex rounded border border-border bg-card px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {simulation.simulationType}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Difficulty</dt>
                <dd>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${DIFFICULTY_BADGE[simulation.difficulty] ?? "border-border bg-card text-muted-foreground"}`}
                  >
                    {simulation.difficulty}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_BADGE[simulation.status]}`}
                  >
                    {simulation.status}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-mono text-xs text-foreground">
                  {simulation.createdAt.toLocaleDateString()}
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
                href={`/admin/modules/${simulation.module.id}`}
                className="btn-secondary justify-start text-xs"
              >
                Open module →
              </Link>
              <Link href="/admin/simulations" className="btn-secondary justify-start text-xs">
                All simulations →
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
