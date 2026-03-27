import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createCaseAction } from "@/app/admin/actions";
import { SubmitModuleButton } from "@/components/admin/modules/submit-module-button";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "New Case — Admin",
  robots: { index: false },
};

export default async function NewCasePage() {
  await requireAdminPermission("courses.write");

  const modules = await prisma.courseModule.findMany({
    select: {
      id: true,
      title: true,
      course: { select: { title: true } },
    },
  });

  async function handleCreate(formData: FormData) {
    "use server";
    await createCaseAction(formData);
    redirect("/admin/cases");
  }

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title="New Case Study"
        description="Create a real-world case study attached to a course module."
      />

      <section className="surface-elevated p-6">
        <form action={handleCreate} className="max-w-2xl space-y-5">
          {/* Module */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Module *</label>
            {modules.length === 0 ? (
              <p className="rounded-lg border border-amber-500/20 bg-amber-500/8 p-3 text-sm text-amber-400">
                No modules found. Create a module first before adding a case study.
              </p>
            ) : (
              <select name="moduleId" required className="select-base">
                <option value="">Select a module…</option>
                {modules.map((mod) => (
                  <option key={mod.id} value={mod.id}>
                    {mod.course.title} — {mod.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Title *</label>
            <input
              name="title"
              required
              maxLength={300}
              placeholder="e.g. Supply Chain Disruption at Acme Corp"
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
              placeholder="Brief one-liner about this case…"
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
              placeholder="Describe the problem learners need to solve…"
              className="input-base resize-y"
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Difficulty</label>
            <select name="difficulty" defaultValue="MEDIUM" className="select-base">
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <SubmitModuleButton label="Create case" />
            <Link href="/admin/cases" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </section>
  );
}
