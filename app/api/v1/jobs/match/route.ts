import { withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { respond } from "@/lib/api/v1/http";
import { JobsMatchResponseSchema } from "@/lib/contracts/jobs";
import { buildJobMatchResult } from "@/lib/matching/jobs-match";
import { resolveApiSubscriptionContext } from "@/lib/saas/api-access";
import type { TrackTag } from "@/types/personalization";

export const runtime = "nodejs";

function parseTrack(value: string | null): TrackTag | undefined {
  return value === "QA" || value === "BA" || value === "DA" ? value : undefined;
}

/** GET /api/v1/jobs/match?track=QA&skill=SQL&skill=API — ranked job matches. */
export const GET = withErrorHandler(async (request: Request) => {
  const identity = await requireIdentity(request);
  const accessContext = await resolveApiSubscriptionContext({
    email: identity.email,
    role: identity.role === "ADMIN" ? "ADMIN" : "STUDENT",
  });

  const url = new URL(request.url);
  const track = parseTrack(url.searchParams.get("track"));
  const skills = url.searchParams.getAll("skill");

  const result = await buildJobMatchResult(accessContext, { track, skills });
  return respond(JobsMatchResponseSchema, result);
});
