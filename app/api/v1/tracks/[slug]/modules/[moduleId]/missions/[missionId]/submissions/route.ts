import { evaluateMissionSubmission } from "@/features/missions/engine";
import { Errors, withErrorHandler } from "@/lib/api/error-handler";
import { parseBody, parseQuery, respond } from "@/lib/api/v1/http";
import { requireIdentity } from "@/lib/api/v1/identity";
import {
  MissionParamsSchema,
  MissionSubmissionResultSchema,
  MissionSubmissionSchema,
} from "@/lib/contracts/missions";
import { TracksQuerySchema } from "@/lib/contracts/tracks";
import { resolveRuntimeCourseBySlug } from "@/lib/learning/content-resolver";
import { toLearningMission } from "@/lib/missions/runtime-mission";
import {
  denyFeature,
  denyUsage,
  ensureFeature,
  ensureUsage,
  recordMeterUsage,
  resolveApiSubscriptionContext,
} from "@/lib/saas/api-access";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string; moduleId: string; missionId: string }> };

/**
 * POST /api/v1/tracks/{slug}/modules/{moduleId}/missions/{missionId}/submissions
 * Evaluate a mission submission. The mission is resolved server-side by id;
 * the plan's mission feature gate and submission meter are enforced.
 */
export const POST = withErrorHandler(async (request: Request, context: RouteContext) => {
  const identity = await requireIdentity(request);
  const { slug, moduleId, missionId } = MissionParamsSchema.parse(await context.params);
  const { submission } = await parseBody(request, MissionSubmissionSchema);
  const query = parseQuery(request, TracksQuerySchema);

  const accessContext = await resolveApiSubscriptionContext({
    email: identity.email,
    role: identity.role === "ADMIN" ? "ADMIN" : "STUDENT",
  });
  const unlimitedGate = ensureFeature(accessContext, "missions.unlimited");
  const limitedGate = ensureFeature(accessContext, "missions.limited");
  if (!unlimitedGate.allowed && !limitedGate.allowed) {
    return denyFeature("missions.limited", unlimitedGate.upgradePlanId ?? limitedGate.upgradePlanId);
  }
  const usage = ensureUsage(accessContext, "missionSubmissions");
  if (usage.reached) {
    return denyUsage("missionSubmissions", usage);
  }

  const course = await resolveRuntimeCourseBySlug(slug, {
    includeCourseEntities: query.includeCourseEntities,
    includeDraftCourses: query.includeDraftCourses,
  });
  if (!course) {
    throw Errors.notFound(`Track "${slug}" not found`);
  }
  const moduleItem = course.modules.find((candidate) => candidate.id === moduleId);
  const mission = moduleItem?.missions.find((candidate) => candidate.id === missionId);
  if (!moduleItem || !mission) {
    throw Errors.notFound(`Mission "${missionId}" not found in track "${slug}"`);
  }

  const evaluation = evaluateMissionSubmission({
    mission: toLearningMission(mission, course.category),
    submission,
  });

  recordMeterUsage(accessContext, "missionSubmissions");
  return respond(MissionSubmissionResultSchema, { evaluation });
});
