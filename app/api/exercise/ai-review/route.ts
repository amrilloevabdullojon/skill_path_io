import { NextResponse } from "next/server";

import { runUnifiedReview } from "@/lib/ai";

type Body = {
  exerciseType?: "BUG_REPORT" | "USER_STORY" | "SQL_ANALYSIS" | "ANALYTICS_TASK";
  submission?: string;
  context?: string;
};

// Backward-compatible endpoint. Preferred endpoint: /api/ai/review
export async function POST(request: Request) {
  const body = (await request.json()) as Body;

  const result = await runUnifiedReview({
    reviewType: "EXERCISE",
    payload: {
      exerciseType: body.exerciseType ?? "BUG_REPORT",
      submission: body.submission ?? "",
      context: body.context ?? "",
    },
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data.result, { status: result.status });
}
