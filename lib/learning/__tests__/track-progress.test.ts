// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/learning/progress", () => ({
  findRuntimeModuleProgress: vi.fn(),
}));

import type { RuntimeCourse } from "@/lib/learning/content-types";
import { findRuntimeModuleProgress } from "@/lib/learning/progress";
import { buildTrackProgress } from "@/lib/learning/track-progress";

const course = {
  slug: "qa",
  source: "prisma-track",
  modules: [{ id: "m1" }, { id: "m2" }, { id: "m3" }],
} as unknown as RuntimeCourse;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("buildTrackProgress", () => {
  it("merges progress records and counts completed modules", async () => {
    vi.mocked(findRuntimeModuleProgress).mockResolvedValue([
      { moduleId: "m1", status: "COMPLETED", score: 90, completedAt: new Date("2026-03-01T00:00:00Z") },
      { moduleId: "m2", status: "IN_PROGRESS", score: 40, completedAt: null },
    ] as never);

    const result = await buildTrackProgress("u1", course);

    expect(result.totalModules).toBe(3);
    expect(result.completedModules).toBe(1);
    expect(result.modules).toEqual([
      { moduleId: "m1", status: "COMPLETED", score: 90, completedAt: "2026-03-01T00:00:00.000Z" },
      { moduleId: "m2", status: "IN_PROGRESS", score: 40, completedAt: null },
      { moduleId: "m3", status: "NOT_STARTED", score: null, completedAt: null },
    ]);
  });

  it("defaults every module to NOT_STARTED when there is no progress", async () => {
    vi.mocked(findRuntimeModuleProgress).mockResolvedValue([] as never);
    const result = await buildTrackProgress("u1", course);
    expect(result.completedModules).toBe(0);
    expect(result.modules.every((m) => m.status === "NOT_STARTED")).toBe(true);
  });
});
