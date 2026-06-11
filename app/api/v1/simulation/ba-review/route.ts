import { withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { parseBody, respond } from "@/lib/api/v1/http";
import { UserStoryInputSchema, UserStoryReviewSchema } from "@/lib/contracts/simulation";
import { reviewUserStoryLocally } from "@/features/simulations/ba-simulation";

export const runtime = "nodejs";

/** POST /api/v1/simulation/ba-review — score a user story draft. */
export const POST = withErrorHandler(async (request: Request) => {
  await requireIdentity(request);
  const input = await parseBody(request, UserStoryInputSchema);
  return respond(UserStoryReviewSchema, reviewUserStoryLocally(input));
});
