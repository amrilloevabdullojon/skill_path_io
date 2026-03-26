import { describe, expect, it } from "vitest";
import type {
  EvaluationCriteria,
  MissionFeedback,
  PlannerTasks,
  QuestionOptions,
  ReadinessBreakdown,
  RoadmapItem,
  SimulationStep,
  Tags,
  UnlockRule,
} from "../prisma-json";

/**
 * These tests validate that our type definitions accurately model
 * the data structures stored in Prisma Json fields.
 * They serve as living documentation of the expected shapes.
 */

describe("PrismaJson type shapes", () => {
  it("Tags is a string array", () => {
    const tags: Tags = ["typescript", "testing", "qa"];
    expect(Array.isArray(tags)).toBe(true);
    expect(tags.every((t) => typeof t === "string")).toBe(true);
  });

  it("QuestionOptions has id and text", () => {
    const options: QuestionOptions = [
      { id: "a", text: "Option A" },
      { id: "b", text: "Option B" },
    ];
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveProperty("id");
    expect(options[0]).toHaveProperty("text");
  });

  it("UnlockRule is optional/partial", () => {
    const rule: UnlockRule = { type: "score_threshold", threshold: 80 };
    expect(rule.type).toBe("score_threshold");
    expect(rule.threshold).toBe(80);

    const emptyRule: UnlockRule = {};
    expect(emptyRule.type).toBeUndefined();
  });

  it("EvaluationCriteria has id and label", () => {
    const criteria: EvaluationCriteria = [
      { id: "c1", label: "Correctness", weight: 0.6 },
      { id: "c2", label: "Clarity" },
    ];
    expect(criteria[0].weight).toBe(0.6);
    expect(criteria[1].weight).toBeUndefined();
  });

  it("SimulationStep has id and title", () => {
    const step: SimulationStep = {
      id: "s1",
      title: "Open bug tracker",
      description: "Navigate to the Jira board",
      expectedAction: "Click on Issues tab",
    };
    expect(step.id).toBe("s1");
    expect(step.description).toBeDefined();
  });

  it("ReadinessBreakdown allows arbitrary keys", () => {
    const breakdown: ReadinessBreakdown = {
      technical: 75,
      communication: 80,
      customDomain: 60,
    };
    expect(breakdown.technical).toBe(75);
    expect(breakdown["customDomain"]).toBe(60);
  });

  it("PlannerTasks is an array of tasks", () => {
    const tasks: PlannerTasks = [
      { id: "t1", title: "Complete Module 1", completed: false },
      { id: "t2", title: "Quiz Review", dueDate: "2024-02-01", completed: true },
    ];
    expect(tasks[0].completed).toBe(false);
    expect(tasks[1].dueDate).toBe("2024-02-01");
  });

  it("MissionFeedback has criterion and passed", () => {
    const feedback: MissionFeedback = [
      { criterion: "Identified root cause", passed: true, comment: "Good analysis" },
      { criterion: "Proposed fix", passed: false },
    ];
    expect(feedback[0].passed).toBe(true);
    expect(feedback[1].comment).toBeUndefined();
  });

  it("RoadmapItem has title and optional fields", () => {
    const item: RoadmapItem = {
      title: "Learn SQL basics",
      moduleId: "mod_123",
      estimatedWeeks: 2,
    };
    expect(item.title).toBe("Learn SQL basics");
    expect(item.estimatedWeeks).toBe(2);
  });
});
