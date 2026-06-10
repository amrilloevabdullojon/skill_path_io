import { CourseEditorForm } from "@/components/admin/courses/course-editor-form";
import { requireAdminPermission } from "@/lib/admin-auth";

type AdminCourseDetailPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function AdminCourseDetailPage({ params }: AdminCourseDetailPageProps) {
  const resolvedParams = await params;
  await requireAdminPermission("courses.write");
  return <CourseEditorForm courseId={resolvedParams.courseId} />;
}
