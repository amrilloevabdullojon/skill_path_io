import { Errors, withErrorHandler } from "@/lib/api/error-handler";
import { parseBody, respond } from "@/lib/api/v1/http";
import { requireIdentity } from "@/lib/api/v1/identity";
import { ModuleParamsSchema } from "@/lib/contracts/modules";
import { QuizAttemptResultSchema, QuizSubmissionSchema } from "@/lib/contracts/quiz";
import { gradeAndRecordQuizAttempt } from "@/lib/learning/quiz-grading";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string; moduleId: string }> };

/**
 * POST /api/v1/tracks/{slug}/modules/{moduleId}/quiz/attempts
 * Submit quiz answers; the server grades them, records the attempt, updates
 * module progress, and issues a certificate when the track is completed.
 */
export const POST = withErrorHandler(async (request: Request, context: RouteContext) => {
  const identity = await requireIdentity(request);
  const { slug, moduleId } = ModuleParamsSchema.parse(await context.params);
  const { quizId, answers } = await parseBody(request, QuizSubmissionSchema);

  const result = await gradeAndRecordQuizAttempt({
    userEmail: identity.email,
    locale: new URL(request.url).searchParams.get("locale"),
    payload: { trackSlug: slug, moduleId, quizId, answers },
  });

  if (!result.ok) {
    if (result.message === "Quiz not found.") {
      throw Errors.notFound(result.message);
    }
    throw Errors.validation(result.message ?? "Quiz submission failed.");
  }

  return respond(QuizAttemptResultSchema, result);
});
