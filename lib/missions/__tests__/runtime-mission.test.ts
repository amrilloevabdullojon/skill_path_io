// @vitest-environment node
import { describe, expect, it } from "vitest";

import type { RuntimeMission } from "@/lib/learning/content-types";
import { toLearningMission } from "@/lib/missions/runtime-mission";

const runtimeMission: RuntimeMission = {
  id: "mis1",
  title: "Write a test plan",
  scenario: "A new checkout flow needs coverage",
  objective: "Produce a risk-based test plan",
  xpReward: 80,
  difficulty: "advanced",
  status: "PUBLISHED",
};

describe("toLearningMission", () => {
  it("maps core fields and fills engine-required defaults", () => {
    const mission = toLearningMission(runtimeMission, "QA");
    expect(mission).toMatchObject({
      id: "mis1",
      title: "Write a test plan",
      scenario: "A new checkout flow needs coverage",
      objective: "Produce a risk-based test plan",
      xpReward: 80,
      category: "QA",
      status: "available",
      aiEvaluation: false,
    });
    expect(mission.steps).toEqual([]);
    expect(mission.skillsUsed).toEqual([]);
  });

  it("normalizes difficulty strings", () => {
    expect(toLearningMission({ ...runtimeMission, difficulty: "easy" }, "QA").difficulty).toBe("Easy");
    expect(toLearningMission({ ...runtimeMission, difficulty: "advanced" }, "QA").difficulty).toBe("Hard");
    expect(toLearningMission({ ...runtimeMission, difficulty: "whatever" }, "QA").difficulty).toBe("Medium");
  });

  it("clamps category to a valid TrackTag", () => {
    expect(toLearningMission(runtimeMission, "BA").category).toBe("BA");
    expect(toLearningMission(runtimeMission, "PRODUCT").category).toBe("QA");
    expect(toLearningMission(runtimeMission, "GENERAL").category).toBe("QA");
  });
});
