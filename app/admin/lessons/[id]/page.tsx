import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonType } from "@prisma/client";

import { updateLessonAction } from "@/app/admin/actions";
import { SubmitModuleButton } from "@/components/admin/modules/submit-module-button";
import { DeleteLessonButton } from "@/components/admin/lessons/delete-lesson-button";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { getLessonDetail } from "@/lib/admin/lessons/queries";

export const metadata: Metadata = {
  title: "Edit Lesson — Admin",
  robots: { index: false },
};

const TYPE_BADGE: Record<LessonType, string> = {
  TEXT: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  VIDEO: "border-violet-500/30 bg-violet-500/10 text-violet-400",
  TASK: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

export default async function EditLessonPage({ params }: { params: { id: string } }) {
  await requireAdminPermission("courses.write");

  const lesson = await getLessonDetail(params.id);

  if (!lesson) notFound();

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title="Edit Lesson"
        description={lesson.title}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* ── Left: edit form ─────────────────────────────────────── */}
        <section className="surface-elevated p-6">
          <form action={updateLessonAction} className="space-y-5">
            <input type="hidden" name="lessonId" value={lesson.id} />

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Title *</label>
              <input
                name="title"
                required
                maxLength={200}
                defaultValue={lesson.title}
                className="input-base"
              />
            </div>

            {/* Type + Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Type *</label>
                <select name="type" defaultValue={lesson.type} required className="select-base">
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
                  defaultValue={lesson.order}
                  className="input-base"
                />
              </div>
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Body</label>
              <textarea
                name="body"
                rows={14}
                defaultValue={lesson.body}
                placeholder="Lesson content (markdown or plain text)…"
                className="input-base resize-y font-mono text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <SubmitModuleButton label="Save lesson" />
              <Link href="/admin/lessons" className="btn-secondary">
                Cancel
              </Link>
              <div className="ml-auto">
                <DeleteLessonButton lessonId={lesson.id} lessonTitle={lesson.title} />
              </div>
            </div>
          </form>
        </section>

        {/* ── Right: metadata panel ───────────────────────────────── */}
        <aside className="space-y-4">
          <section className="surface-elevated p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Info
            </h2>
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Module</dt>
                <dd className="font-medium text-foreground">{lesson.module.title}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Track</dt>
                <dd className="text-foreground">{lesson.module.track.title}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Type</dt>
                <dd>
                  <span
                    className={`inline-flex rounded border px-1.5 py-0.5 text-[11px] font-semibold ${TYPE_BADGE[lesson.type]}`}
                  >
                    {lesson.type}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Order</dt>
                <dd className="font-mono text-foreground">{lesson.order}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Body length</dt>
                <dd className="font-mono text-foreground">{lesson.body.length} chars</dd>
              </div>
            </dl>
          </section>

          <section className="surface-elevated p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Navigate
            </h2>
            <div className="flex flex-col gap-2">
              <Link
                href={`/admin/modules/${lesson.module.id}`}
                className="btn-secondary justify-start text-xs"
              >
                Open module →
              </Link>
              <Link href="/admin/lessons" className="btn-secondary justify-start text-xs">
                All lessons →
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
