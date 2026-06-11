import { withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { parseBody, respond } from "@/lib/api/v1/http";
import { PlannerForecastRequestSchema, PlannerForecastSchema } from "@/lib/contracts/planner";
import { plannerForecast } from "@/lib/planner/service";

export const runtime = "nodejs";

/**
 * POST /api/v1/planner/forecast — compute the workload forecast for a plan.
 * Stateless; the plan is supplied by the caller.
 */
export const POST = withErrorHandler(async (request: Request) => {
  await requireIdentity(request);
  const { plan } = await parseBody(request, PlannerForecastRequestSchema);
  return respond(PlannerForecastSchema, plannerForecast(plan));
});
