import { MediaManager } from "@/components/admin/media/media-manager";
import { requireAdminPermission } from "@/lib/admin-auth";

export default async function AdminMediaPage() {
  await requireAdminPermission("media.manage");
  return <MediaManager />;
}
