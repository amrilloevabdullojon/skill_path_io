import { Errors, withErrorHandler } from "@/lib/api/error-handler";
import { parseQuery, respond } from "@/lib/api/v1/http";
import { ModuleDetailSchema, ModuleParamsSchema } from "@/lib/contracts/modules";
import { TracksQuerySchema } from "@/lib/contracts/tracks";
import { resolveRuntimeCourseBySlug } from "@/lib/learning/content-resolver";
import { toLearnerModule } from "@/lib/learning/module-view";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string; moduleId: string }> };

/**
 * GET /api/v1/tracks/{slug}/modules/{moduleId} — a single module's learner view
 * (lessons, missions, simulations, and quiz metadata without correct answers).
 */
export const GET = withErrorHandler(async (request: Request, context: RouteContext) => {
  const { slug, moduleId } = ModuleParamsSchema.parse(await context.params);
  const query = parseQuery(request, TracksQuerySchema);

  const course = await resolveRuntimeCourseBySlug(slug, {
    includeCourseEntities: query.includeCourseEntities,
    includeDraftCourses: query.includeDraftCourses,
  });
  if (!course) {
    throw Errors.notFound(`Track "${slug}" not found`);
  }

  const targetModule = course.modules.find((candidate) => candidate.id === moduleId);
  if (!targetModule) {
    throw Errors.notFound(`Module "${moduleId}" not found in track "${slug}"`);
  }

  return respond(ModuleDetailSchema, {
    course: { slug: course.slug, title: course.title },
    module: toLearnerModule(targetModule),
  });
});
