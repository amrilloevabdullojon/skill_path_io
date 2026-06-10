import { CourseBuilderStudio } from "@/components/admin/builder/course-builder-studio";
import { requireAdminRoute } from "@/lib/admin-auth";
import { hasAdminPermission } from "@/lib/permissions/admin-permissions";

type AdminCourseBuilderPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function AdminCourseBuilderPage({ params }: AdminCourseBuilderPageProps) {
  const resolvedParams = await params;
  const admin = await requireAdminRoute();
  const canWrite = hasAdminPermission(admin.adminRole, "builder.write");
  const canPublish = hasAdminPermission(admin.adminRole, "courses.publish");

  return (
    <CourseBuilderStudio
      courseId={resolvedParams.courseId}
      canWrite={canWrite}
      canPublish={canPublish}
    />
  );
}
