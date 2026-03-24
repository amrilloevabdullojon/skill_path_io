import { CourseEditorForm } from "@/components/admin/courses/course-editor-form";
import { requireAdminPermission } from "@/lib/admin-auth";

type AdminCourseDetailPageProps = {
  params: {
    courseId: string;
  };
};

export default async function AdminCourseDetailPage({ params }: AdminCourseDetailPageProps) {
  await requireAdminPermission("courses.write");
  return <CourseEditorForm courseId={params.courseId} />;
}
