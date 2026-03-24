import { NextResponse } from "next/server";

import { runUnifiedReview } from "@/lib/ai";

type RequestBody = {
  question?: string;
  options?: string[];
  userAnswers?: string[];
  correctAnswers?: string[];
  lessonContext?: string;
};

// Backward-compatible endpoint. Preferred endpoint: /api/ai/review
export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const result = await runUnifiedReview({
    reviewType: "QUIZ",
    payload: {
      question: body.question ?? "",
      options: Array.isArray(body.options) ? body.options : [],
      userAnswers: Array.isArray(body.userAnswers) ? body.userAnswers : [],
      correctAnswers: Array.isArray(body.correctAnswers) ? body.correctAnswers : [],
      lessonContext: body.lessonContext ?? "",
    },
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data.result, { status: result.status });
}
