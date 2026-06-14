import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StudioSimulationType } from "@prisma/client";

import { createSimulationAction } from "@/app/admin/actions";
import { SubmitModuleButton } from "@/components/admin/modules/submit-module-button";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "New Simulation — Admin",
  robots: { index: false },
};

export default async function NewSimulationPage() {
  await requireAdminPermission("courses.write");

  const modules = await prisma.courseModule.findMany({
    orderBy: [{ course: { title: "asc" } }, { order: "asc" }],
    select: {
      id: true,
      title: true,
      course: { select: { title: true } },
    },
  });

  async function handleCreate(formData: FormData) {
    "use server";
    await createSimulationAction(formData);
    redirect("/admin/simulations");
  }

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title="New Simulation"
        description="Create an interactive simulation and attach it to a module."
      />

      <section className="surface-elevated p-6">
        <form action={handleCreate} className="max-w-2xl space-y-5">
          {/* Module */}
          <div className="space-y-1.5">
            <label htmlFor="moduleId" className="text-sm font-medium text-foreground">Module *</label>
            <select id="moduleId" name="moduleId" required className="select-base">
              <option value="">Select a module…</option>
              {modules.map((mod) => (
                <option key={mod.id} value={mod.id}>
                  {mod.course.title} — {mod.title}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-medium text-foreground">Title *</label>
            <input id="title"
              name="title"
              required
              maxLength={200}
              placeholder="Simulation title"
              className="input-base"
            />
          </div>

          {/* Simulation type */}
          <div className="space-y-1.5">
            <label htmlFor="simulationType" className="text-sm font-medium text-foreground">Simulation type *</label>
            <select id="simulationType" name="simulationType" required className="select-base">
              {Object.values(StudioSimulationType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Scenario */}
          <div className="space-y-1.5">
            <label htmlFor="scenario" className="text-sm font-medium text-foreground">Scenario *</label>
            <textarea id="scenario"
              name="scenario"
              required
              rows={6}
              placeholder="Describe the simulation scenario…"
              className="input-base resize-y"
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-1.5">
            <label htmlFor="difficulty" className="text-sm font-medium text-foreground">Difficulty</label>
            <select id="difficulty" name="difficulty" defaultValue="MEDIUM" className="select-base">
              <option value="EASY">EASY</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HARD">HARD</option>
            </select>
          </div>

          {/* Estimated time + XP reward */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="estimatedTime" className="text-sm font-medium text-foreground">Estimated time (min)</label>
              <input id="estimatedTime"
                name="estimatedTime"
                type="number"
                min={0}
                defaultValue={0}
                className="input-base"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="xpReward" className="text-sm font-medium text-foreground">XP reward</label>
              <input id="xpReward"
                name="xpReward"
                type="number"
                min={0}
                defaultValue={0}
                className="input-base"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <SubmitModuleButton label="Create simulation" />
            <Link href="/admin/simulations" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </section>
  );
}
