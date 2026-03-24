import { evaluateMissionSubmission } from "@/features/missions/engine";
import { apiOk, Errors, withErrorHandler } from "@/lib/api/error-handler";
import {
  denyFeature,
  denyUsage,
  ensureFeature,
  ensureUsage,
  recordMeterUsage,
  resolveApiSubscriptionContext,
} from "@/lib/saas/api-access";
import { LearningMission } from "@/types/personalization";

export const POST = withErrorHandler(async (request: Request) => {
  const accessContext = await resolveApiSubscriptionContext();
  const unlimitedGate = ensureFeature(accessContext, "missions.unlimited");
  const limitedGate = ensureFeature(accessContext, "missions.limited");
  if (!unlimitedGate.allowed && !limitedGate.allowed) {
    return denyFeature("missions.limited", unlimitedGate.upgradePlanId ?? limitedGate.upgradePlanId);
  }

  const usage = ensureUsage(accessContext, "missionSubmissions");
  if (usage.reached) {
    return denyUsage("missionSubmissions", usage);
  }

  const body = (await request.json()) as {
    mission?: LearningMission;
    submission?: string;
  };

  if (!body.mission || typeof body.submission !== "string") {
    throw Errors.validation("Mission and submission are required");
  }

  const evaluation = evaluateMissionSubmission({
    mission: body.mission,
    submission: body.submission,
  });

  recordMeterUsage(accessContext, "missionSubmissions");
  return apiOk({ evaluation });
});
