import { NextResponse } from "next/server";

import { runUnifiedReview } from "@/lib/ai";
import { UnifiedAiReviewRequest } from "@/types/ai";

export async function POST(request: Request) {
  const body = (await request.json()) as UnifiedAiReviewRequest;
  const result = await runUnifiedReview(body);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, { status: result.status });
}
