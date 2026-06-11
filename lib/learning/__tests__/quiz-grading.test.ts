// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/learning/runtime-content", () => ({
  resolveRuntimeCourseBySlug: vi.fn(),
}));
vi.mock("@/lib/tracks/content-overrides", () => ({
  applyTrackContentOverrides: (track: unknown) => track,
  normalizeLearningLocale: () => "en",
}));
vi.mock("@/lib/learning-user", () => ({
  resolveLearningUser: vi.fn(async () => ({ id: "u1", email: "student@levio.local" })),
}));
vi.mock("@/lib/learning/progress", () => ({
  findRuntimeModuleProgressById: vi.fn(async () => null),
  findRuntimeModuleProgress: vi.fn(async () => []),
  upsertRuntimeModuleProgress: vi.fn(async () => undefined),
}));
vi.mock("@/lib/ai/quiz-generator", () => ({
  getCachedAiQuizQuestions: vi.fn(() => []),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    quizAttempt: { create: vi.fn(async () => ({ id: "att1" })) },
    certificate: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    courseCertificate: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    course: { findUnique: vi.fn() },
  },
}));

import { resolveRuntimeCourseBySlug } from "@/lib/learning/runtime-content";
import { gradeAndRecordQuizAttempt } from "@/lib/learning/quiz-grading";
import { prisma } from "@/lib/prisma";

const track = {
  id: "t1",
  slug: "qa",
  title: "QA Foundations",
  source: "seed-track",
  modules: [
    {
      id: "m1",
      title: "Test design",
      quiz: {
        id: "q1",
        title: "Quiz",
        passingScore: 70,
        questions: [
          {
            id: "qq1",
            text: "Boundary value?",
            type: "SINGLE",
            options: [
              { id: "a", text: "Edge of a partition" },
              { id: "b", text: "Random value" },
            ],
            correctAnswer: ["a"],
          },
          {
            id: "qq2",
            text: "Equivalence partition?",
            type: "SINGLE",
            options: [
              { id: "a", text: "Group with same behavior" },
              { id: "b", text: "A single value" },
            ],
            correctAnswer: ["a"],
          },
        ],
      },
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(resolveRuntimeCourseBySlug).mockResolvedValue(track as never);
});

describe("gradeAndRecordQuizAttempt", () => {
  it("grades a fully correct submission and records the attempt", async () => {
    const result = await gradeAndRecordQuizAttempt({
      userEmail: "student@levio.local",
      payload: {
        trackSlug: "qa",
        moduleId: "m1",
        quizId: "q1",
        answers: { qq1: ["a"], qq2: ["a"] },
      },
    });

    expect(result.ok).toBe(true);
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.correctAnswers).toBe(2);
    expect(result.totalQuestions).toBe(2);
    expect(result.wrongAnswers).toHaveLength(0);
    expect(result.attemptId).toBe("att1");
    expect(prisma.quizAttempt.create).toHaveBeenCalledTimes(1);
  });

  it("marks wrong answers and fails below the passing score", async () => {
    const result = await gradeAndRecordQuizAttempt({
      userEmail: "student@levio.local",
      payload: {
        trackSlug: "qa",
        moduleId: "m1",
        quizId: "q1",
        answers: { qq1: ["b"], qq2: ["b"] },
      },
    });

    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.wrongAnswers).toHaveLength(2);
    expect(result.wrongAnswers[0]).toMatchObject({ questionId: "qq1", correctAnswers: ["a"] });
  });

  it("returns 'Quiz not found.' when the quizId does not match the module", async () => {
    const result = await gradeAndRecordQuizAttempt({
      userEmail: "student@levio.local",
      payload: { trackSlug: "qa", moduleId: "m1", quizId: "wrong", answers: {} },
    });
    expect(result.ok).toBe(false);
    expect(result.message).toBe("Quiz not found.");
    expect(prisma.quizAttempt.create).not.toHaveBeenCalled();
  });
});
