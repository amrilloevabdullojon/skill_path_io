import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PermissionRoleType } from "@prisma/client";

import { createPermissionAction } from "@/app/admin/actions";
import { SubmitModuleButton } from "@/components/admin/modules/submit-module-button";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Grant Access — Admin",
  robots: { index: false },
};

export default async function NewPermissionPage() {
  await requireAdminPermission("users.manage");

  async function handleCreate(formData: FormData) {
    "use server";
    await createPermissionAction(formData);
    redirect("/admin/permissions");
  }

  return (
    <section className="page-shell">
      <PageHeader kicker="People" title="Grant Access" description="Add a new permission role for a user." />

      <section className="surface-elevated p-6">
        <form action={handleCreate} className="max-w-lg space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email *</label>
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              placeholder="user@example.com"
              className="input-base"
            />
            <p className="text-xs text-muted-foreground">Must match the user&apos;s sign-in email.</p>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Role *</label>
            <select name="role" required defaultValue={PermissionRoleType.COURSE_EDITOR} className="select-base">
              <option value={PermissionRoleType.SUPER_ADMIN}>Super Admin</option>
              <option value={PermissionRoleType.CONTENT_ADMIN}>Content Admin</option>
              <option value={PermissionRoleType.COURSE_EDITOR}>Course Editor</option>
              <option value={PermissionRoleType.REVIEWER}>Reviewer</option>
              <option value={PermissionRoleType.ANALYTICS_MANAGER}>Analytics Manager</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <SubmitModuleButton label="Grant access" />
            <Link href="/admin/permissions" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </section>
  );
}
