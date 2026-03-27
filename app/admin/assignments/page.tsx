import type { Metadata } from "next";

import { StudioEntitiesPage } from "@/components/admin/entities/studio-entities-page";
import { requireAdminPermission } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Assignments — Admin",
  robots: { index: false },
};

export default async function AdminAssignmentsPage() {
  await requireAdminPermission("courses.read");
  return (
    <StudioEntitiesPage
      type="assignments"
      title="Assignments"
      description="Text tasks, bug reports, SQL tasks, and AI-reviewed practical exercises."
    />
  );
}
