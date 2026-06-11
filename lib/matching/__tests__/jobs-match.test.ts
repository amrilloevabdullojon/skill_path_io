// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { jobPosting: { findMany: vi.fn(async () => []) } },
}));
vi.mock("@/lib/saas/api-access", () => ({
  ensureFeature: vi.fn(),
  resolveApiSubscriptionContext: vi.fn(),
}));
vi.mock("@/lib/saas/marketplace", () => ({ listMarketplaceRoles: vi.fn(async () => []) }));
vi.mock("@/lib/saas/matching", () => ({ buildSaasJobMatches: vi.fn(() => []) }));
vi.mock("@/lib/matching/jobs", () => ({ buildJobMatches: vi.fn() }));

import { buildJobMatches } from "@/lib/matching/jobs";
import { buildJobMatchResult } from "@/lib/matching/jobs-match";
import { ensureFeature } from "@/lib/saas/api-access";

const sampleMatches = [
  { roleId: "r1", title: "QA", company: "A", matchPercent: 90, missingSkills: [], evidenceSignals: [] },
  { roleId: "r2", title: "QA", company: "B", matchPercent: 80, missingSkills: [], evidenceSignals: [] },
  { roleId: "r3", title: "QA", company: "C", matchPercent: 70, missingSkills: [], evidenceSignals: [] },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(buildJobMatches).mockReturnValue(sampleMatches as never);
});

describe("buildJobMatchResult", () => {
  it("returns full matches + marketplace matches when the plan allows it", async () => {
    vi.mocked(ensureFeature).mockReturnValue({ allowed: true } as never);
    const result = await buildJobMatchResult({} as never, { skills: ["SQL"] });
    expect(result.locked).toBe(false);
    expect(result.matches).toHaveLength(3);
    expect(result.marketplaceMatches).toEqual([]);
  });

  it("locks to a 2-match teaser with an upgrade prompt when not allowed", async () => {
    vi.mocked(ensureFeature).mockReturnValue({ allowed: false, upgradePlanId: "career" } as never);
    const result = await buildJobMatchResult({} as never, { skills: [] });
    expect(result.locked).toBe(true);
    expect(result.matches).toHaveLength(2);
    expect(result.upgradePlanId).toBe("career");
    expect(result.message).toContain("Upgrade");
  });
});
