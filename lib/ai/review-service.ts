import { generateExerciseReview, ExerciseType } from "@/features/ai/exercise-review";
import { generateAiQuizReview } from "@/features/ai/quiz-review";
import { UnifiedAiReviewRequest } from "@/types/ai";

function isExerciseType(value: unknown): value is ExerciseType {
  return value === "BUG_REPORT" || value === "USER_STORY" || value === "SQL_ANALYSIS" || value === "ANALYTICS_TASK";
}

export async function runUnifiedReview(payload: UnifiedAiReviewRequest) {
  if (payload.reviewType === "QUIZ") {
    if (!payload.payload.question || payload.payload.correctAnswers.length === 0) {
      return {
        ok: false as const,
        status: 400,
        error: "Invalid payload for quiz AI review.",
      };
    }

    const result = await generateAiQuizReview({
      question: payload.payload.question,
      options: payload.payload.options ?? [],
      userAnswers: payload.payload.userAnswers,
      correctAnswers: payload.payload.correctAnswers,
      lessonContext: payload.payload.lessonContext,
    });

    return {
      ok: true as const,
      status: 200,
      data: {
        source: "quiz" as const,
        result,
      },
    };
  }

  if (!isExerciseType(payload.payload.exerciseType) || payload.payload.submission.trim().length < 10) {
    return {
      ok: false as const,
      status: 400,
      error: "Invalid payload for exercise AI review.",
    };
  }

  const result = await generateExerciseReview({
    exerciseType: payload.payload.exerciseType,
    submission: payload.payload.submission,
    context: payload.payload.context ?? "",
  });

  return {
    ok: true as const,
    status: 200,
    data: {
      source: "exercise" as const,
      result,
    },
  };
}
