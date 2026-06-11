// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  BugReportInputSchema,
  BugReviewResultSchema,
  UserStoryInputSchema,
  UserStoryReviewSchema,
} from "@/lib/contracts/simulation";

describe("simulation contracts", () => {
  it("accepts a user story input and validates its review", () => {
    expect(
      UserStoryInputSchema.safeParse({
        actor: "QA engineer",
        action: "run a regression suite",
        value: "to catch regressions early",
        acceptanceCriteria: "All critical paths pass",
      }).success,
    ).toBe(true);
    expect(
      UserStoryReviewSchema.safeParse({ score: 80, strengths: [], gaps: [], recommendations: [] })
        .success,
    ).toBe(true);
  });

  it("requires a valid bug severity", () => {
    const base = {
      title: "Crash on save",
      stepsToReproduce: "open, edit, save",
      expectedResult: "saved",
      actualResult: "crash",
    };
    expect(BugReportInputSchema.safeParse({ ...base, severity: "HIGH" }).success).toBe(true);
    expect(BugReportInputSchema.safeParse({ ...base, severity: "URGENT" }).success).toBe(false);
  });

  it("validates a bug review result", () => {
    expect(
      BugReviewResultSchema.safeParse({
        qualityScore: 70,
        strengths: [],
        issues: [],
        suggestions: [],
      }).success,
    ).toBe(true);
  });
});
