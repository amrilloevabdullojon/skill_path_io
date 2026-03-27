import type { Metadata } from "next";

import { TemplatesManager } from "@/components/admin/templates/templates-manager";
import { requireAdminPermission } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Templates — Admin",
  robots: { index: false },
};

export default async function AdminTemplatesPage() {
  await requireAdminPermission("templates.manage");
  return <TemplatesManager />;
}
