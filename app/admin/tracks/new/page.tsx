import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TrackCategory } from "@prisma/client";

import { createTrackAction } from "@/app/admin/actions";
import { SubmitModuleButton } from "@/components/admin/modules/submit-module-button";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "New Track — Admin",
  robots: { index: false },
};

export default async function NewTrackPage() {
  await requireAdminPermission("courses.write");

  async function handleCreate(formData: FormData) {
    "use server";
    await createTrackAction(formData);
    redirect("/admin/tracks");
  }

  return (
    <section className="page-shell">
      <PageHeader kicker="Content" title="New Track" description="Create a new learning track." />

      <section className="surface-elevated p-6">
        <form action={handleCreate} className="max-w-lg space-y-5">
          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Slug *</label>
            <input
              name="slug"
              required
              maxLength={60}
              placeholder="e.g. qa-fundamentals"
              className="input-base font-mono"
            />
            <p className="text-xs text-muted-foreground">URL-friendly identifier, lowercase with hyphens.</p>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Title *</label>
            <input
              name="title"
              required
              maxLength={200}
              placeholder="e.g. QA Fundamentals"
              className="input-base"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Description *</label>
            <textarea
              name="description"
              required
              maxLength={500}
              rows={3}
              placeholder="Brief description of the track…"
              className="input-base resize-none"
            />
          </div>

          {/* Category + Icon row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Category *</label>
              <select name="category" required defaultValue={TrackCategory.QA} className="select-base">
                <option value={TrackCategory.QA}>QA</option>
                <option value={TrackCategory.BA}>BA</option>
                <option value={TrackCategory.DA}>DA</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Icon</label>
              <input
                name="icon"
                maxLength={10}
                placeholder="🎯"
                defaultValue="📚"
                className="input-base"
              />
              <p className="text-xs text-muted-foreground">Emoji or short string.</p>
            </div>
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Color *</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="color-picker"
                defaultValue="#6366f1"
                className="h-9 w-16 cursor-pointer rounded border border-border bg-card"
                onChange={(e) => {
                  const input = document.getElementById("color-hex") as HTMLInputElement | null;
                  if (input) input.value = e.target.value;
                }}
              />
              <input
                id="color-hex"
                name="color"
                required
                maxLength={20}
                defaultValue="#6366f1"
                placeholder="#6366f1"
                className="input-base font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">Hex color used in badges and charts.</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <SubmitModuleButton label="Create track" />
            <Link href="/admin/tracks" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </section>
  );
}
