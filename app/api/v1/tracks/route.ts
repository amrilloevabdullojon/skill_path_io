import { withErrorHandler } from "@/lib/api/error-handler";
import { parseQuery, respond } from "@/lib/api/v1/http";
import { CatalogSchema } from "@/lib/contracts/catalog";
import { TracksQuerySchema } from "@/lib/contracts/tracks";
import { resolveRuntimeCatalog } from "@/lib/learning/content-resolver";
import { toLearnerCourse } from "@/lib/learning/module-view";

export const runtime = "nodejs";

/**
 * GET /api/v1/tracks — published learning catalog (tracks + studio courses),
 * learner-safe (quiz answers stripped).
 */
export const GET = withErrorHandler(async (request: Request) => {
  const query = parseQuery(request, TracksQuerySchema);

  const catalog = await resolveRuntimeCatalog({
    includeCourseEntities: query.includeCourseEntities,
    includeDraftCourses: query.includeDraftCourses,
  });

  return respond(CatalogSchema, {
    source: catalog.source,
    courses: catalog.courses.map(toLearnerCourse),
  });
});
