import { TemplatesManager } from "@/components/admin/templates/templates-manager";
import { requireAdminPermission } from "@/lib/admin-auth";

export default async function AdminTemplatesPage() {
  await requireAdminPermission("templates.manage");
  return <TemplatesManager />;
}
