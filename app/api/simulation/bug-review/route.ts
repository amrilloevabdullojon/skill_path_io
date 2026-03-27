import { Errors, apiOk, withErrorHandler } from "@/lib/api/error-handler";
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

export const POST = withErrorHandler(async (request: Request) => {
  const body = (await request.json()) as Body;

  if (
    typeof body.title !== "string" ||
    !isSeverity(body.severity) ||
    typeof body.stepsToReproduce !== "string" ||
    typeof body.expectedResult !== "string" ||
    typeof body.actualResult !== "string"
  ) {
    throw Errors.validation("Invalid bug report payload.");
  }

  const review = reviewBugReportLocally({
    title: body.title,
    severity: body.severity,
    stepsToReproduce: body.stepsToReproduce,
    expectedResult: body.expectedResult,
    actualResult: body.actualResult,
  });

  return apiOk(review);
});
