import { evaluateInterview, getInterviewQuestions, InterviewAnswer } from "@/features/ai/interview";
import { TrackCategory } from "@prisma/client";

type InterviewAction = "start" | "evaluate";

export type UnifiedInterviewRequest = {
  action?: InterviewAction;
  track?: TrackCategory;
  answers?: InterviewAnswer[];
};

function resolveTrack(value: unknown) {
  if (value === TrackCategory.QA || value === TrackCategory.BA || value === TrackCategory.DA) {
    return value;
  }
  return null;
}

export async function runUnifiedInterview(payload: UnifiedInterviewRequest) {
  const track = resolveTrack(payload.track);
  if (!payload.action || !track) {
    return {
      ok: false as const,
      status: 400,
      error: "Action and track are required.",
    };
  }

  if (payload.action === "start") {
    return {
      ok: true as const,
      status: 200,
      data: {
        questions: getInterviewQuestions(track, 4),
      },
    };
  }

  const answers = Array.isArray(payload.answers)
    ? payload.answers.filter(
        (item): item is InterviewAnswer =>
          typeof item.questionId === "string" && typeof item.answer === "string" && item.answer.trim().length > 0,
      )
    : [];

  if (answers.length === 0) {
    return {
      ok: false as const,
      status: 400,
      error: "Interview answers are required.",
    };
  }

  const evaluation = await evaluateInterview(track, answers);

  return {
    ok: true as const,
    status: 200,
    data: {
      evaluation,
    },
  };
}
