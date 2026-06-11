// @vitest-environment node
import { describe, expect, it } from "vitest";

import { LearningPlanSchema, PlannerForecastSchema } from "@/lib/contracts/planner";

const plan = {
  id: "plan-1",
  goal: "Land a QA role",
  weeklyHours: 6,
  forecastDate: "2026-06-01",
  workload: "Balanced",
  tasks: [
    { id: "t1", title: "Lesson", type: "lesson", durationMinutes: 60, day: "Mon", priority: "High" },
  ],
};

describe("planner contract", () => {
  it("accepts a valid plan", () => {
    expect(LearningPlanSchema.safeParse(plan).success).toBe(true);
  });

  it("rejects an unknown task type", () => {
    const bad = { ...plan, tasks: [{ ...plan.tasks[0], type: "nap" }] };
    expect(LearningPlanSchema.safeParse(bad).success).toBe(false);
  });

  it("validates a forecast payload", () => {
    const result = PlannerForecastSchema.safeParse({
      totalMinutes: 60,
      weeklyCapacity: 360,
      loadPercent: 17,
      realistic: true,
      recommendation: "Plan is realistic if you keep your weekly cadence.",
    });
    expect(result.success).toBe(true);
  });
});
