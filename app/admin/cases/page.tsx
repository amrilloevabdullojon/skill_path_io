import { StudioEntitiesPage } from "@/components/admin/entities/studio-entities-page";
import { requireAdminPermission } from "@/lib/admin-auth";

export default async function AdminCasesPage() {
  await requireAdminPermission("courses.read");
  return (
    <StudioEntitiesPage
      type="cases"
      title="Case Library"
      description="Real-world cases with expected approach and outcomes."
    />
  );
}
