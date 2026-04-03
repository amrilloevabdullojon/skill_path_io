import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { runUnifiedReview } from "@/lib/ai";
import { authOptions } from "@/lib/auth";

type Body = {
  exerciseType?: "BUG_REPORT" | "USER_STORY" | "SQL_ANALYSIS" | "ANALYTICS_TASK";
  submission?: string;
  context?: string;
};

// Backward-compatible endpoint. Preferred endpoint: /api/ai/review
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

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
