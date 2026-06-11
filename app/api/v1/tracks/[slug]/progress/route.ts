import { Errors, withErrorHandler } from "@/lib/api/error-handler";
import { parseQuery, respond } from "@/lib/api/v1/http";
import { requireIdentity } from "@/lib/api/v1/identity";
import { TrackProgressSchema } from "@/lib/contracts/track-progress";
import { TracksQuerySchema } from "@/lib/contracts/tracks";
import { resolveRuntimeCourseBySlug } from "@/lib/learning/content-resolver";
import { buildTrackProgress } from "@/lib/learning/track-progress";
import { resolveLearningUser } from "@/lib/learning-user";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

/** GET /api/v1/tracks/{slug}/progress — the caller's per-module progress in a track. */
export const GET = withErrorHandler(async (request: Request, context: RouteContext) => {
  const identity = await requireIdentity(request);
  const { slug } = await context.params;
  const query = parseQuery(request, TracksQuerySchema);

  const course = await resolveRuntimeCourseBySlug(slug, {
    includeCourseEntities: query.includeCourseEntities,
    includeDraftCourses: query.includeDraftCourses,
  });
  if (!course) {
    throw Errors.notFound(`Track "${slug}" not found`);
  }

  const user = await resolveLearningUser(identity.email);
  if (!user) {
    return respond(TrackProgressSchema, {
      slug: course.slug,
      totalModules: course.modules.length,
      completedModules: 0,
      modules: course.modules.map((module) => ({
        moduleId: module.id,
        status: "NOT_STARTED" as const,
        score: null,
        completedAt: null,
      })),
    });
  }

  return respond(TrackProgressSchema, await buildTrackProgress(user.id, course));
});
