// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    aiUsageLog: { count: vi.fn(), groupBy: vi.fn() },
  },
}));

import { buildAiUsageSummary } from "@/lib/admin/ai-usage";
import { prisma } from "@/lib/prisma";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("buildAiUsageSummary", () => {
  it("aggregates totals, windows, and a feature breakdown sorted by count", async () => {
    vi.mocked(prisma.aiUsageLog.count)
      .mockResolvedValueOnce(100 as never) // total
      .mockResolvedValueOnce(12 as never) // last 7d
      .mockResolvedValueOnce(40 as never); // last 30d
    vi.mocked(prisma.aiUsageLog.groupBy).mockResolvedValue([
      { feature: "RESUME_SCAN", _count: { _all: 30 } },
      { feature: "AI_INTERVIEW", _count: { _all: 70 } },
    ] as never);

    const summary = await buildAiUsageSummary();

    expect(summary.totalCalls).toBe(100);
    expect(summary.last7Days).toBe(12);
    expect(summary.last30Days).toBe(40);
    expect(summary.byFeature).toEqual([
      { feature: "AI_INTERVIEW", count: 70 },
      { feature: "RESUME_SCAN", count: 30 },
    ]);
  });
});
