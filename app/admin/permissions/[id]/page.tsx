import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PermissionRoleType } from "@prisma/client";

import { updatePermissionAction } from "@/app/admin/actions";
import { SubmitModuleButton } from "@/components/admin/modules/submit-module-button";
import { DeletePermissionButton } from "@/components/admin/permissions/delete-permission-button";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Edit Permission — Admin",
  robots: { index: false },
};

export default async function EditPermissionPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdminPermission("users.manage");

  const role = await prisma.permissionRole.findUnique({
    where: { id: params.id },
  });

  if (!role) notFound();

  return (
    <section className="page-shell">
      <header className="surface-elevated space-y-2 p-5 sm:p-7">
        <p className="kicker">People</p>
        <h1 className="section-title">Edit Permission</h1>
        <p className="body-text font-mono text-sm text-muted-foreground">{role.email}</p>
      </header>

      <section className="surface-elevated p-6">
        <form action={updatePermissionAction} className="max-w-lg space-y-5">
          <input type="hidden" name="permId" value={role.id} />

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <p className="input-base cursor-default font-mono text-muted-foreground select-all">
              {role.email}
            </p>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="role">
              Role *
            </label>
            <select
              id="role"
              name="role"
              required
              defaultValue={role.role}
              className="select-base"
            >
              <option value={PermissionRoleType.SUPER_ADMIN}>Super Admin</option>
              <option value={PermissionRoleType.CONTENT_ADMIN}>Content Admin</option>
              <option value={PermissionRoleType.COURSE_EDITOR}>Course Editor</option>
              <option value={PermissionRoleType.REVIEWER}>Reviewer</option>
              <option value={PermissionRoleType.ANALYTICS_MANAGER}>Analytics Manager</option>
            </select>
          </div>

          {/* Active */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="isActive">
              Status *
            </label>
            <select
              id="isActive"
              name="isActive"
              required
              defaultValue={role.isActive ? "true" : "false"}
              className="select-base"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Created */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Created: {role.createdAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <SubmitModuleButton label="Save changes" />
            <Link href="/admin/permissions" className="btn-secondary">
              Cancel
            </Link>
            <div className="ml-auto">
              <DeletePermissionButton permId={role.id} email={role.email} />
            </div>
          </div>
        </form>
      </section>
    </section>
  );
}
