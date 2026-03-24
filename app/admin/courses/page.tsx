import { CoursesManager } from "@/components/admin/courses/courses-manager";
import { requireAdminPermission } from "@/lib/admin-auth";

export default async function AdminCoursesPage() {
  await requireAdminPermission("courses.read");
  return <CoursesManager />;
}
