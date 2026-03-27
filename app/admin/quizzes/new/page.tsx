import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createQuizAction } from "@/app/admin/actions";
import { SubmitModuleButton } from "@/components/admin/modules/submit-module-button";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "New Quiz — Admin",
  robots: { index: false },
};

export default async function NewQuizPage() {
  await requireAdminPermission("courses.write");

  // Only modules without an existing quiz
  const modules = await prisma.module.findMany({
    where: { quiz: null },
    orderBy: [{ track: { title: "asc" } }, { order: "asc" }],
    select: {
      id: true,
      title: true,
      track: { select: { title: true } },
    },
  });

  async function handleCreate(formData: FormData) {
    "use server";
    await createQuizAction(formData);
    redirect("/admin/quizzes");
  }

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title="New Quiz"
        description="Attach a quiz to a module. Each module can have at most one quiz."
      />

      <section className="surface-elevated p-6">
        <form action={handleCreate} className="max-w-lg space-y-5">
          {/* Module */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Module *</label>
            {modules.length === 0 ? (
              <p className="rounded-lg border border-amber-500/20 bg-amber-500/8 p-3 text-sm text-amber-400">
                All modules already have quizzes. Delete an existing quiz to re-assign it.
              </p>
            ) : (
              <select name="moduleId" required className="select-base">
                <option value="">Select a module…</option>
                {modules.map((mod) => (
                  <option key={mod.id} value={mod.id}>
                    {mod.track.title} — {mod.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Quiz title *</label>
            <input
              name="title"
              required
              maxLength={200}
              placeholder="e.g. Module 1 Assessment"
              className="input-base"
            />
          </div>

          {/* Passing score */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Passing score % *</label>
            <input
              name="passingScore"
              type="number"
              required
              min={0}
              max={100}
              defaultValue={70}
              className="input-base"
            />
            <p className="text-xs text-muted-foreground">
              Minimum percentage to pass (0–100).
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <SubmitModuleButton label="Create quiz" />
            <Link href="/admin/quizzes" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </section>
  );
}
