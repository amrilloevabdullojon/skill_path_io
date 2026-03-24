import { CourseStudentPreview } from "@/components/admin/preview/course-student-preview";
import { requireAdminPermission } from "@/lib/admin-auth";

type AdminCoursePreviewPageProps = {
  params: {
    courseId: string;
  };
};

export default async function AdminCoursePreviewPage({ params }: AdminCoursePreviewPageProps) {
  await requireAdminPermission("courses.read");
  return <CourseStudentPreview courseId={params.courseId} />;
}
