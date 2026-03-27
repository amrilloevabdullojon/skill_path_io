import type { Metadata } from "next";

import { MediaManager } from "@/components/admin/media/media-manager";
import { requireAdminPermission } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Media — Admin",
  robots: { index: false },
};

export default async function AdminMediaPage() {
  await requireAdminPermission("media.manage");
  return <MediaManager />;
}
