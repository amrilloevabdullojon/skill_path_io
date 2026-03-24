import { NextResponse } from "next/server";

import { plannerForecast } from "@/lib/planner/service";
import { LearningPlan } from "@/types/personalization";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { plan?: LearningPlan };
    if (!body.plan) {
      return NextResponse.json({ error: "Plan is required" }, { status: 400 });
    }

    return NextResponse.json(plannerForecast(body.plan));
  } catch {
    return NextResponse.json({ error: "Planner forecast failed" }, { status: 400 });
  }
}
