// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    quizAttempt: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { listLearnerProgress } from "@/lib/learning/quiz-history";
import { prisma } from "@/lib/prisma";

const row = {
  id: "att1",
  trackSlug: "qa",
  trackTitle: "QA Foundations",
  moduleTitle: "Test design",
  quizTitle: "Quiz",
  score: 80,
  passingScore: 70,
  passed: true,
  totalQuestions: 5,
  correctAnswers: 4,
  submittedAt: new Date("2026-02-01T10:00:00Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listLearnerProgress", () => {
  it("returns ISO-string DTOs and aggregate stats", async () => {
    vi.mocked(prisma.quizAttempt.findMany).mockResolvedValue([row] as never);
    vi.mocked(prisma.quizAttempt.aggregate).mockResolvedValue({
      _count: { _all: 3 },
      _avg: { score: 76.6 },
    } as never);
    vi.mocked(prisma.quizAttempt.count).mockResolvedValue(2 as never);

    const result = await listLearnerProgress("user-1");

    expect(result.stats).toEqual({ totalAttempts: 3, passedAttempts: 2, averageScore: 77 });
    expect(result.attempts).toHaveLength(1);
    expect(result.attempts[0].submittedAt).toBe("2026-02-01T10:00:00.000Z");
    expect(result.attempts[0].passed).toBe(true);
    expect(prisma.quizAttempt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" }, orderBy: { submittedAt: "desc" } }),
    );
  });

  it("handles a learner with no attempts", async () => {
    vi.mocked(prisma.quizAttempt.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.quizAttempt.aggregate).mockResolvedValue({
      _count: { _all: 0 },
      _avg: { score: null },
    } as never);
    vi.mocked(prisma.quizAttempt.count).mockResolvedValue(0 as never);

    const result = await listLearnerProgress("user-1");
    expect(result.stats).toEqual({ totalAttempts: 0, passedAttempts: 0, averageScore: 0 });
    expect(result.attempts).toEqual([]);
  });
});
