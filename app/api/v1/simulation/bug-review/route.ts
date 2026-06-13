import { withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { parseBody, respond } from "@/lib/api/v1/http";
import { BugReportInputSchema, BugReviewResultSchema } from "@/lib/contracts/simulation";
import { reviewBugReportLocally } from "@/features/simulations/bug-tracker";

export const runtime = "nodejs";

/** POST /api/v1/simulation/bug-review — score a bug report draft. */
export const POST = withErrorHandler(async (request: Request) => {
  await requireIdentity(request);
  const input = await parseBody(request, BugReportInputSchema);
  return respond(BugReviewResultSchema, reviewBugReportLocally(input));
});
