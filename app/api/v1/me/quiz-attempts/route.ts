import { withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { respond } from "@/lib/api/v1/http";
import { ProgressResponseSchema } from "@/lib/contracts/progress";
import { listLearnerProgress } from "@/lib/learning/quiz-history";
import { resolveLearningUser } from "@/lib/learning-user";

export const runtime = "nodejs";

const EMPTY: import("@/lib/contracts/progress").ProgressResponse = {
  stats: { totalAttempts: 0, passedAttempts: 0, averageScore: 0 },
  attempts: [],
};

/** GET /api/v1/me/quiz-attempts — the caller's recent quiz attempts and stats. */
export const GET = withErrorHandler(async (request: Request) => {
  const identity = await requireIdentity(request);
  const user = await resolveLearningUser(identity.email);
  if (!user) {
    return respond(ProgressResponseSchema, EMPTY);
  }

  const progress = await listLearnerProgress(user.id);
  return respond(ProgressResponseSchema, progress);
});
