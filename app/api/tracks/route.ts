import { apiOk, withErrorHandler } from "@/lib/api/error-handler";
import { resolveRuntimeCatalog } from "@/lib/learning/content-resolver";

export const GET = withErrorHandler(async (request: Request) => {
  const url = new URL(request.url);
  const rawCourseEntities = url.searchParams.get("includeCourseEntities");
  const includeCourseEntities = rawCourseEntities === null || rawCourseEntities !== "0";
  const includeDraftCourses = url.searchParams.get("includeDraftCourses") === "1";

  const catalog = await resolveRuntimeCatalog({
    includeCourseEntities: includeCourseEntities !== false,
    includeDraftCourses,
  });

  return apiOk(catalog);
});
