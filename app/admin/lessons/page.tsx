import { StudioEntitiesPage } from "@/components/admin/entities/studio-entities-page";
import { requireAdminPermission } from "@/lib/admin-auth";

export default async function AdminLessonsPage() {
  await requireAdminPermission("courses.read");
  return (
    <StudioEntitiesPage
      type="lessons"
      title="Lessons"
      description="Block-based lesson library across all courses."
    />
  );
}
