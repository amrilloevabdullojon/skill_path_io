import type { Metadata } from "next";
import Link from "next/link";
import { LessonType } from "@prisma/client";
import { redirect } from "next/navigation";

import { createLessonAction } from "@/app/admin/actions";
import { SubmitModuleButton } from "@/components/admin/modules/submit-module-button";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { getModulesForSelect } from "@/lib/admin/lessons/queries";

export const metadata: Metadata = {
  title: "New Lesson — Admin",
  robots: { index: false },
};

export default async function NewLessonPage() {
  await requireAdminPermission("courses.write");

  const modules = await getModulesForSelect();

  async function handleCreate(formData: FormData) {
    "use server";
    await createLessonAction(formData);
    redirect("/admin/lessons");
  }

  return (
    <section className="page-shell">
      <PageHeader kicker="Content" title="New Lesson" description="Add a lesson to a module." />

      <section className="surface-elevated p-6">
        <form action={handleCreate} className="space-y-5 max-w-2xl">
          {/* Module */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Module *</label>
            <select name="moduleId" required className="select-base">
              <option value="">Select a module…</option>
              {modules.map((mod) => (
                <option key={mod.id} value={mod.id}>
                  {mod.track.title} — {mod.title} ({mod._count.lessons} lessons)
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Title *</label>
            <input
              name="title"
              required
              maxLength={200}
              placeholder="Lesson title"
              className="input-base"
            />
          </div>

          {/* Type + Order row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Type *</label>
              <select name="type" defaultValue={LessonType.TEXT} required className="select-base">
                <option value={LessonType.TEXT}>TEXT</option>
                <option value={LessonType.VIDEO}>VIDEO</option>
                <option value={LessonType.TASK}>TASK</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Order *</label>
              <input
                name="order"
                type="number"
                required
                min={1}
                max={999}
                defaultValue={1}
                className="input-base"
              />
            </div>
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Body</label>
            <p className="text-xs text-muted-foreground">
              Lesson content (markdown or plain text).
            </p>
            <textarea
              name="body"
              rows={8}
              placeholder="Write lesson content here…"
              className="input-base resize-y font-mono text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <SubmitModuleButton label="Create lesson" />
            <Link href="/admin/lessons" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </section>
  );
}
