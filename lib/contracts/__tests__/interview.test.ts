// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  InterviewRequestSchema,
  InterviewResponseSchema,
} from "@/lib/contracts/interview";

describe("interview contract", () => {
  it("accepts a start request", () => {
    expect(InterviewRequestSchema.safeParse({ action: "start", track: "QA" }).success).toBe(true);
  });

  it("accepts an evaluate request with answers", () => {
    const result = InterviewRequestSchema.safeParse({
      action: "evaluate",
      track: "BA",
      answers: [{ questionId: "q1", answer: "..." }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown action or track", () => {
    expect(InterviewRequestSchema.safeParse({ action: "stop", track: "QA" }).success).toBe(false);
    expect(InterviewRequestSchema.safeParse({ action: "start", track: "PM" }).success).toBe(false);
  });

  it("validates both response shapes (questions and evaluation)", () => {
    expect(
      InterviewResponseSchema.safeParse({
        questions: [{ id: "q1", text: "t", expectedFocus: "f" }],
      }).success,
    ).toBe(true);
    expect(
      InterviewResponseSchema.safeParse({
        evaluation: {
          score: 80,
          level: "Junior+",
          strengths: [],
          weaknesses: [],
          recommendations: [],
          summary: "ok",
        },
      }).success,
    ).toBe(true);
  });
});
