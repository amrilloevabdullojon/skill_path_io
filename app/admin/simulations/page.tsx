import { StudioEntitiesPage } from "@/components/admin/entities/studio-entities-page";
import { requireAdminPermission } from "@/lib/admin-auth";

export default async function AdminSimulationsPage() {
  await requireAdminPermission("courses.read");
  return (
    <StudioEntitiesPage
      type="simulations"
      title="Simulations"
      description="Bug tracker, analyst workflow, SQL challenge, and interview simulations."
    />
  );
}
