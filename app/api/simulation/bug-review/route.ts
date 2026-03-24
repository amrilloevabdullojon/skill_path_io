import { NextResponse } from "next/server";

import { BugSeverity, reviewBugReportLocally } from "@/features/simulations/bug-tracker";

type Body = {
  title?: string;
  severity?: BugSeverity;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
};

function isSeverity(value: unknown): value is BugSeverity {
  return value === "LOW" || value === "MEDIUM" || value === "HIGH" || value === "CRITICAL";
}

export async function POST(request: Request) {
  const body = (await request.json()) as Body;

  if (
    typeof body.title !== "string" ||
    !isSeverity(body.severity) ||
    typeof body.stepsToReproduce !== "string" ||
    typeof body.expectedResult !== "string" ||
    typeof body.actualResult !== "string"
  ) {
    return NextResponse.json(
      {
        error: "Invalid bug report payload.",
      },
      { status: 400 },
    );
  }

  const review = reviewBugReportLocally({
    title: body.title,
    severity: body.severity,
    stepsToReproduce: body.stepsToReproduce,
    expectedResult: body.expectedResult,
    actualResult: body.actualResult,
  });

  return NextResponse.json(review, { status: 200 });
}
