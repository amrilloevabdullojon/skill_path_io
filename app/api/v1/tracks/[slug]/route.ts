import { Errors, withErrorHandler } from "@/lib/api/error-handler";
import { parseQuery, respond } from "@/lib/api/v1/http";
import { TrackDetailSchema, TrackParamsSchema, TracksQuerySchema } from "@/lib/contracts/tracks";
import { resolveRuntimeCourseBySlug } from "@/lib/learning/content-resolver";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * GET /api/v1/tracks/{slug} — a single published track/course with its modules.
 * Reuses the same query semantics as the catalog endpoint.
 */
export const GET = withErrorHandler(async (request: Request, context: RouteContext) => {
  const { slug } = TrackParamsSchema.parse(await context.params);
  const query = parseQuery(request, TracksQuerySchema);

  const course = await resolveRuntimeCourseBySlug(slug, {
    includeCourseEntities: query.includeCourseEntities,
    includeDraftCourses: query.includeDraftCourses,
  });

  if (!course) {
    throw Errors.notFound(`Track "${slug}" not found`);
  }

  return respond(TrackDetailSchema, { course });
});
