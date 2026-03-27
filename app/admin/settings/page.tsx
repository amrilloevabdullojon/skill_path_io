import type { Metadata } from "next";

import { AdminSettingsPanel } from "@/components/admin/settings/admin-settings-panel";
import { requireAdminPermission } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Settings — Admin",
  robots: { index: false },
};

export default async function AdminSettingsPage() {
  await requireAdminPermission("settings.manage");
  return <AdminSettingsPanel />;
}
