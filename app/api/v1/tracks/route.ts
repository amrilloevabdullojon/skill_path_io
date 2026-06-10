import { withErrorHandler } from "@/lib/api/error-handler";
import { parseQuery, respond } from "@/lib/api/v1/http";
import { TracksCatalogSchema, TracksQuerySchema } from "@/lib/contracts/tracks";
import { resolveRuntimeCatalog } from "@/lib/learning/content-resolver";

export const runtime = "nodejs";

/**
 * GET /api/v1/tracks — published learning catalog (tracks + studio courses).
 *
 * Reference implementation of the versioned API pattern:
 *   auth (proxy middleware) -> validate(query) -> service -> respond(contract).
 * The handler stays thin; all logic lives in `resolveRuntimeCatalog`.
 */
export const GET = withErrorHandler(async (request: Request) => {
  const query = parseQuery(request, TracksQuerySchema);

  const catalog = await resolveRuntimeCatalog({
    includeCourseEntities: query.includeCourseEntities,
    includeDraftCourses: query.includeDraftCourses,
  });

  return respond(TracksCatalogSchema, catalog);
});
