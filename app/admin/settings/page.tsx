import type { Metadata } from "next";

import { requireAdminPermission } from "@/lib/admin-auth";
import { readAdminSettings } from "@/lib/admin-settings";
import { saveAdminSettingsAction } from "@/app/admin/actions";
import { PageHeader } from "@/components/ui/page-header";
import { SubmitModuleButton } from "@/components/admin/modules/submit-module-button";

export const metadata: Metadata = {
  title: "Settings — Admin",
  robots: { index: false },
};

export default async function AdminSettingsPage() {
  await requireAdminPermission("settings.manage");
  const settings = readAdminSettings();

  return (
    <div className="page-shell">
      <PageHeader
        title="Admin Settings"
        description="Configure site-wide behavior, access controls, and system preferences."
      />

      <form action={saveAdminSettingsAction} className="grid gap-6">
        {/* ── Site ── */}
        <section className="surface-elevated space-y-4 p-6">
          <h2 className="text-lg font-semibold text-foreground">Site</h2>

          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Site name
            </span>
            <input
              name="siteName"
              defaultValue={settings.siteName}
              className="input-base"
              required
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Site description
            </span>
            <input
              name="siteDescription"
              defaultValue={settings.siteDescription}
              className="input-base"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Support email
            </span>
            <input
              name="supportEmail"
              type="email"
              defaultValue={settings.supportEmail}
              className="input-base"
            />
          </label>
        </section>

        {/* ── Access ── */}
        <section className="surface-elevated space-y-4 p-6">
          <h2 className="text-lg font-semibold text-foreground">Access</h2>

          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Allow registration
            </span>
            <select
              name="allowRegistration"
              defaultValue={String(settings.allowRegistration)}
              className="select-base"
            >
              <option value="true">Yes — open registration</option>
              <option value="false">No — invite only</option>
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Require email verification
            </span>
            <select
              name="requireEmailVerification"
              defaultValue={String(settings.requireEmailVerification)}
              className="select-base"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Default user role
            </span>
            <select
              name="defaultUserRole"
              defaultValue={settings.defaultUserRole}
              className="select-base"
            >
              <option value="STUDENT">Student</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
        </section>

        {/* ── System ── */}
        <section className="surface-elevated space-y-4 p-6">
          <h2 className="text-lg font-semibold text-foreground">System</h2>

          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Maintenance mode
            </span>
            <select
              name="maintenanceMode"
              defaultValue={String(settings.maintenanceMode)}
              className="select-base"
            >
              <option value="false">Off</option>
              <option value="true">On — site unavailable to users</option>
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Analytics
            </span>
            <select
              name="analyticsEnabled"
              defaultValue={String(settings.analyticsEnabled)}
              className="select-base"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Max upload size (MB)
            </span>
            <input
              name="maxUploadSizeMb"
              type="number"
              min={1}
              max={500}
              defaultValue={settings.maxUploadSizeMb}
              className="input-base"
            />
          </label>
        </section>

        <div className="flex justify-end">
          <SubmitModuleButton label="Save settings" />
        </div>
      </form>
    </div>
  );
}
