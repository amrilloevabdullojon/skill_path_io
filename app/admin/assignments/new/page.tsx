import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StudioAssignmentType } from "@prisma/client";

import { createAssignmentAction } from "@/app/admin/actions";
import { SubmitModuleButton } from "@/components/admin/modules/submit-module-button";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "New Assignment — Admin",
  robots: { index: false },
};

export default async function NewAssignmentPage() {
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
    await createAssignmentAction(formData);
    redirect("/admin/assignments");
  }

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title="New Assignment"
        description="Create a practical assignment and attach it to a module."
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
              placeholder="Assignment title"
              className="input-base"
            />
          </div>

          {/* Assignment type */}
          <div className="space-y-1.5">
            <label htmlFor="assignmentType" className="text-sm font-medium text-foreground">Assignment type *</label>
            <select id="assignmentType" name="assignmentType" required className="select-base">
              {Object.values(StudioAssignmentType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <label htmlFor="instructions" className="text-sm font-medium text-foreground">Instructions *</label>
            <textarea id="instructions"
              name="instructions"
              required
              rows={6}
              placeholder="Describe what the student must do…"
              className="input-base resize-y"
            />
          </div>

          {/* Max score + Estimated time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="maxScore" className="text-sm font-medium text-foreground">Max score</label>
              <input id="maxScore"
                name="maxScore"
                type="number"
                min={0}
                max={10000}
                defaultValue={100}
                className="input-base"
              />
            </div>
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
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <SubmitModuleButton label="Create assignment" />
            <Link href="/admin/assignments" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </section>
  );
}
