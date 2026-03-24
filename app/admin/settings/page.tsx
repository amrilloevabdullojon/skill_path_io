import { AdminSettingsPanel } from "@/components/admin/settings/admin-settings-panel";
import { requireAdminPermission } from "@/lib/admin-auth";

export default async function AdminSettingsPage() {
  await requireAdminPermission("settings.manage");
  return <AdminSettingsPanel />;
}
