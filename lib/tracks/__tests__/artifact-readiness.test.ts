import { describe, expect, it } from "vitest";

import {
  artifactReadinessPercent,
  buildArtifactReadinessChecklist,
  buildPortfolioGate,
  buildReviewActionPlan,
  buildReviewGate,
} from "@/lib/tracks/artifact-readiness";

describe("artifact readiness", () => {
  it("marks early artifact work as not ready", () => {
    const checklist = buildArtifactReadinessChecklist({
      filledFields: 2,
      totalFields: 5,
      artifactHealth: 42,
      hasReview: false,
      reviewScore: null,
      portfolioSaved: false,
    });

    expect(checklist.map((item) => item.done)).toEqual([false, false, false, false]);
    expect(artifactReadinessPercent(checklist)).toBe(0);
  });

  it("marks a reviewed portfolio artifact as ready", () => {
    const checklist = buildArtifactReadinessChecklist({
      filledFields: 5,
      totalFields: 5,
      artifactHealth: 86,
      hasReview: true,
      reviewScore: 88,
      portfolioSaved: true,
    });

    expect(checklist.map((item) => item.done)).toEqual([true, true, true, true]);
    expect(checklist[2]?.description).toContain("88");
    expect(artifactReadinessPercent(checklist)).toBe(100);
  });

  it("explains why AI review is gated", () => {
    expect(buildReviewGate({ contentLength: 80, filledFields: 1 })).toMatchObject({
      canReview: false,
      title: "AI-review пока закрыт",
    });
    expect(buildReviewGate({ contentLength: 220, filledFields: 2 })).toMatchObject({
      canReview: false,
      title: "Нужно больше веток",
    });
    expect(buildReviewGate({ contentLength: 220, filledFields: 3 })).toMatchObject({
      canReview: true,
      title: "AI-review доступен",
    });
  });

  it("turns review feedback into targeted action items", () => {
    const plan = buildReviewActionPlan({
      feedback: ["Add request/response evidence for the failing API call."],
      nextSteps: ["Write a release recommendation and retest step."],
    });

    expect(plan).toHaveLength(2);
    expect(plan[0]).toMatchObject({ target: "evidence", label: "Evidence" });
    expect(plan[1]).toMatchObject({ target: "decision", label: "Вывод" });
  });

  it("separates portfolio draft save from recommended portfolio quality", () => {
    expect(buildPortfolioGate({ filledFields: 2, artifactHealth: 40, hasReview: false })).toMatchObject({
      canSave: false,
      recommended: false,
      title: "Портфолио пока закрыто",
    });
    expect(buildPortfolioGate({ filledFields: 3, artifactHealth: 62, hasReview: false })).toMatchObject({
      canSave: true,
      recommended: false,
      title: "Можно сохранить черновик",
    });
    expect(buildPortfolioGate({ filledFields: 5, artifactHealth: 88, hasReview: true, reviewScore: 91 })).toMatchObject({
      canSave: true,
      recommended: true,
      title: "Готово для портфолио",
    });
  });
});
