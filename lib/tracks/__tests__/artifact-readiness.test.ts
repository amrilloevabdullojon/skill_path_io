import { describe, expect, it } from "vitest";

import { artifactReadinessPercent, buildArtifactReadinessChecklist } from "@/lib/tracks/artifact-readiness";

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
});
