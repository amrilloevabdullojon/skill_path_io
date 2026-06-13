import { CourseStudentPreview } from "@/components/admin/preview/course-student-preview";
import { requireAdminPermission } from "@/lib/admin-auth";

type AdminCoursePreviewPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function AdminCoursePreviewPage({ params }: AdminCoursePreviewPageProps) {
  const resolvedParams = await params;
  await requireAdminPermission("courses.read");
  return <CourseStudentPreview courseId={resolvedParams.courseId} />;
}
