import { Errors, withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { respond } from "@/lib/api/v1/http";
import { WeeklyReportResponseSchema } from "@/lib/contracts/reports";
import { getDashboardData } from "@/lib/dashboard/data";

export const runtime = "nodejs";

/** GET /api/v1/reports/weekly — the caller's weekly AI report. */
export const GET = withErrorHandler(async (request: Request) => {
  const identity = await requireIdentity(request);
  const dashboard = await getDashboardData({
    preferredEmail: identity.email,
    sessionRole: identity.role,
  });

  if (!dashboard) {
    throw Errors.notFound("No weekly report available.");
  }

  return respond(WeeklyReportResponseSchema, { report: dashboard.weeklyAiReport });
});
