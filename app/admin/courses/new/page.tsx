import { NewCourseForm } from "@/components/admin/courses/new-course-form";
import { requireAdminPermission } from "@/lib/admin-auth";

export default async function AdminNewCoursePage() {
  await requireAdminPermission("courses.write");
  return <NewCourseForm />;
}
