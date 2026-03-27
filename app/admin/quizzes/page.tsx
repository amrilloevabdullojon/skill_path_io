import type { Metadata } from "next";

import { StudioEntitiesPage } from "@/components/admin/entities/studio-entities-page";
import { requireAdminPermission } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Quizzes — Admin",
  robots: { index: false },
};

export default async function AdminQuizzesPage() {
  await requireAdminPermission("courses.read");
  return (
    <StudioEntitiesPage
      type="quizzes"
      title="Quizzes"
      description="Question banks, passing scores, and randomization settings."
    />
  );
}
