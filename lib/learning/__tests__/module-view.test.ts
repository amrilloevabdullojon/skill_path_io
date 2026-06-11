// @vitest-environment node
import { describe, expect, it } from "vitest";

import { ModuleDetailSchema } from "@/lib/contracts/modules";
import type { RuntimeModule } from "@/lib/learning/content-types";
import { toLearnerModule } from "@/lib/learning/module-view";

const runtimeModule: RuntimeModule = {
  id: "m1",
  courseId: "c1",
  order: 1,
  title: "Test design",
  description: "Module on test design",
  estimatedDuration: 90,
  xpReward: 50,
  status: "PUBLISHED",
  visibility: "PUBLIC",
  content: { internal: "secret-config" },
  lessons: [],
  quiz: {
    id: "q1",
    moduleId: "m1",
    title: "Quiz",
    description: "",
    passingScore: 70,
    status: "PUBLISHED",
    questions: [
      {
        id: "qq1",
        text: "What is a boundary value?",
        type: "single",
        options: [
          { id: "a", text: "Edge of a partition" },
          { id: "b", text: "A random value" },
        ],
        correctAnswer: ["a"],
      },
    ],
  },
  missions: [],
  simulations: [],
};

describe("toLearnerModule", () => {
  const learner = toLearnerModule(runtimeModule);

  it("never exposes correct answers", () => {
    const serialized = JSON.stringify(learner);
    expect(serialized).not.toContain("correctAnswer");
    expect(learner.quiz?.questions[0]).not.toHaveProperty("correctAnswer");
  });

  it("keeps quiz metadata and a question count", () => {
    expect(learner.quiz?.questionCount).toBe(1);
    expect(learner.quiz?.questions).toHaveLength(1);
    expect(learner.quiz?.passingScore).toBe(70);
  });

  it("drops the internal content blob", () => {
    expect(learner).not.toHaveProperty("content");
  });

  it("produces a payload that satisfies the published contract", () => {
    const result = ModuleDetailSchema.safeParse({
      course: { slug: "qa", title: "QA" },
      module: learner,
    });
    expect(result.success).toBe(true);
  });
});
