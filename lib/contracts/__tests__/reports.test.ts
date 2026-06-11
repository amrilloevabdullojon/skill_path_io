// @vitest-environment node
import { describe, expect, it } from "vitest";

import { WeeklyReportResponseSchema } from "@/lib/contracts/reports";

describe("reports contract", () => {
  it("validates a weekly report payload", () => {
    const result = WeeklyReportResponseSchema.safeParse({
      report: {
        headline: "Strong week",
        summary: "You completed 3 modules.",
        highlights: ["Passed the QA quiz", "Submitted a mission"],
        nextFocus: "Start the BA track",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a report missing required fields", () => {
    expect(
      WeeklyReportResponseSchema.safeParse({ report: { headline: "x" } }).success,
    ).toBe(false);
  });
});
