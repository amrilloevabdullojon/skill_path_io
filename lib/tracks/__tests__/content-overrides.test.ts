import { describe, expect, it } from "vitest";
import { TrackCategory } from "@prisma/client";

import { RuntimeCourse } from "@/lib/learning/content-types";
import { applyTrackContentOverrides } from "@/lib/tracks/content-overrides";
import { buildLessonBlocks } from "@/lib/tracks/lesson-blocks";

function buildRuntimeCourse(): RuntimeCourse {
  return {
    id: "track-1",
    slug: "qa-engineer",
    title: "QA Engineer",
    shortTitle: "QA",
    description: "placeholder",
    shortDescription: "placeholder",
    category: "QA",
    level: "JUNIOR",
    estimatedDuration: 300,
    status: "PUBLISHED",
    visibility: "PUBLIC",
    source: "prisma-track",
    tags: [],
    icon: "",
    color: "",
    modules: Array.from({ length: 5 }, (_, moduleIndex) => ({
      id: `module-${moduleIndex + 1}`,
      courseId: "track-1",
      order: moduleIndex + 1,
      title: `Module ${moduleIndex + 1}`,
      description: `Description ${moduleIndex + 1}`,
      estimatedDuration: 60,
      xpReward: 100,
      status: "PUBLISHED" as const,
      visibility: "PUBLIC" as const,
      content: {},
      lessons: Array.from({ length: 3 }, (_, lessonIndex) => ({
        id: `lesson-${moduleIndex + 1}-${lessonIndex + 1}`,
        moduleId: `module-${moduleIndex + 1}`,
        order: lessonIndex + 1,
        title: `Lesson ${lessonIndex + 1}`,
        description: "",
        body: "placeholder",
        lessonType: lessonIndex === 2 ? "TASK" : "TEXT",
        estimatedDuration: 20,
        status: "PUBLISHED" as const,
        blocks: [],
      })),
      quiz: {
        id: `quiz-${moduleIndex + 1}`,
        moduleId: `module-${moduleIndex + 1}`,
        title: `Quiz ${moduleIndex + 1}`,
        description: "",
        passingScore: 70,
        status: "PUBLISHED" as const,
        questions: Array.from({ length: 5 }, (_, questionIndex) => ({
          id: `question-${moduleIndex + 1}-${questionIndex + 1}`,
          text: `Question ${questionIndex + 1}`,
          type: questionIndex === 1 ? "MULTI" : "SINGLE",
          options: [
            { id: "A", text: "Option A" },
            { id: "B", text: "Option B" },
            { id: "C", text: "Option C" },
            { id: "D", text: "Option D" },
          ],
          correctAnswer: ["A"],
        })),
      },
      missions: [],
      simulations: [],
    })),
  };
}

describe("content overrides", () => {
  it("localizes QA course content in Russian", () => {
    const course = applyTrackContentOverrides(buildRuntimeCourse(), "ru");

    expect(course.description).toContain("ручному тестированию");
    expect(course.modules[0]?.title).toBe("Основы ручного тестирования");
    expect(course.modules[0]?.lessons[0]?.title).toBe("Чем занимается Manual QA");
    expect(course.modules[0]?.quiz?.questions[0]?.options[1]?.text).toContain("Снижать риски");
  });

  it("builds lesson blocks for all lessons in a module", () => {
    const blocks = buildLessonBlocks({
      category: TrackCategory.QA,
      locale: "en",
      moduleTitle: "QA Fundamentals",
      moduleDescription: "Foundation module",
      moduleOverview: "Overview text",
      outcomes: ["Outcome 1", "Outcome 2"],
      resources: ["Resource 1"],
      realWorldExample: "Real example",
      quickChecks: ["Question 1", "Question 2"],
      lessons: [
        { id: "l1", title: "Lesson One", body: "Body one", order: 1 },
        { id: "l2", title: "Lesson Two", body: "Body two", order: 2 },
        { id: "l3", title: "Lesson Three", body: "Body three", order: 3 },
      ],
    });

    const lessonHeadings = blocks.filter((block) => block.type === "heading" && block.title?.includes("Lesson"));
    expect(lessonHeadings).toHaveLength(3);
    expect(blocks.some((block) => block.type === "list" && block.title === "Self-check questions")).toBe(true);
  });
});
