import { describe, expect, it } from "vitest";

import { buildModuleShiftSeed, buildQaShiftBrief } from "@/lib/tracks/module-brief";

describe("module shift brief", () => {
  it("builds a QA scenario brief with lesson route and artifact", () => {
    const brief = buildQaShiftBrief({
      moduleOrder: 4,
      finalChallenge: "Write an API QA note.",
      lessons: [
        { title: "HTTP and JSON Basics" },
        { title: "Postman Workflow" },
        { title: "Practice: Validate Login and Profile APIs" },
      ],
    });

    expect(brief?.scene).toContain("API response");
    expect(brief?.stakes).toContain("request/response evidence");
    expect(brief?.route).toEqual([
      "1. HTTP and JSON Basics",
      "2. Postman Workflow",
      "3. Practice: Validate Login and Profile APIs",
    ]);
    expect(brief?.artifact).toBe("Write an API QA note.");
  });

  it("returns null for modules without a QA brief", () => {
    expect(buildQaShiftBrief({ moduleOrder: 99, finalChallenge: "Done", lessons: [] })).toBeNull();
  });

  it("turns a shift brief into artifact seed fields", () => {
    const brief = buildQaShiftBrief({
      moduleOrder: 5,
      finalChallenge: "Prepare a release recommendation.",
      lessons: [{ title: "Bug reports" }, { title: "Test pass" }],
    });

    expect(brief).not.toBeNull();
    const seed = buildModuleShiftSeed(brief!);

    expect(seed.observation).toContain("release review");
    expect(seed.risk).toContain("blockers");
    expect(seed.testIdea).toContain("1. Bug reports -> 2. Test pass");
    expect(seed.decision).toContain("Prepare a release recommendation.");
  });
});
