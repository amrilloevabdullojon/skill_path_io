import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createModuleAction } from "@/app/admin/actions";
import { SubmitModuleButton } from "@/components/admin/modules/submit-module-button";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "New Module — Admin",
  robots: { index: false },
};

export default async function NewModulePage() {
  await requireAdminPermission("courses.write");

  const tracks = await prisma.track.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, category: true },
  });

  async function handleCreate(formData: FormData) {
    "use server";
    await createModuleAction(formData);
    redirect("/admin/modules");
  }

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title="New Module"
        description="Create a new module and assign it to a track."
        actionLabel="Back to modules"
        actionHref="/admin/modules"
      />

      <section className="surface-elevated p-5 sm:p-7">
        <form action={handleCreate} className="max-w-lg space-y-5">
          {/* Track */}
          <div className="space-y-1.5">
            <label htmlFor="trackId" className="text-sm font-medium text-foreground">
              Track <span className="text-rose-400">*</span>
            </label>
            <select id="trackId" name="trackId" required className="select-base w-full">
              <option value="">Select a track…</option>
              {tracks.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.title} ({track.category})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-medium text-foreground">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={200}
              placeholder="e.g. Introduction to Test Automation"
              className="input-base w-full"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              maxLength={1000}
              placeholder="Short description shown to learners…"
              className="input-base w-full resize-none py-2"
            />
          </div>

          {/* Order + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="order" className="text-sm font-medium text-foreground">
                Order <span className="text-rose-400">*</span>
              </label>
              <input
                id="order"
                name="order"
                type="number"
                required
                min={1}
                defaultValue={1}
                className="input-base w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="duration" className="text-sm font-medium text-foreground">
                Duration (min) <span className="text-rose-400">*</span>
              </label>
              <input
                id="duration"
                name="duration"
                type="number"
                required
                min={1}
                max={600}
                defaultValue={30}
                className="input-base w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SubmitModuleButton />
            <Link href="/admin/modules" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </section>
  );
}
