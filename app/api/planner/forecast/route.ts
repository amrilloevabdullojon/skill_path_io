import { getServerSession } from "next-auth";

import { Errors, apiOk, withErrorHandler } from "@/lib/api/error-handler";
import { authOptions } from "@/lib/auth";
import { plannerForecast } from "@/lib/planner/service";
import { LearningPlan } from "@/types/personalization";

export const POST = withErrorHandler(async (request: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw Errors.unauthorized();
  }

  const body = (await request.json()) as { plan?: LearningPlan };
  if (!body.plan) throw Errors.validation("Plan is required.");

  return apiOk(plannerForecast(body.plan));
});
