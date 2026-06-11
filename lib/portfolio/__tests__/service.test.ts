// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    portfolio: { upsert: vi.fn() },
    portfolioProject: { count: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
  },
}));

import { addProject, deleteProject, getOrCreatePortfolio } from "@/lib/portfolio/service";
import { prisma } from "@/lib/prisma";

const portfolioRow = {
  id: "p1",
  headline: "QA Engineer",
  summary: "",
  isPublic: false,
  publicSlug: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-02T00:00:00Z"),
  projects: [
    {
      id: "pr1",
      title: "Test plan",
      description: "",
      skillsUsed: ["testing"],
      source: "manual",
      sourceRef: "",
      resultSummary: "",
      isPublic: true,
      order: 0,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("portfolio service", () => {
  it("returns a DTO with ISO dates and mapped projects", async () => {
    vi.mocked(prisma.portfolio.upsert).mockResolvedValue(portfolioRow as never);
    const portfolio = await getOrCreatePortfolio("user-1");
    expect(portfolio.id).toBe("p1");
    expect(portfolio.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(portfolio.projects[0]).toMatchObject({ id: "pr1", title: "Test plan", order: 0 });
  });

  it("appends a project with the next order index", async () => {
    vi.mocked(prisma.portfolio.upsert).mockResolvedValue({ id: "p1" } as never);
    vi.mocked(prisma.portfolioProject.count).mockResolvedValue(2 as never);
    vi.mocked(prisma.portfolioProject.create).mockResolvedValue(portfolioRow.projects[0] as never);

    await addProject("user-1", {
      title: "New",
      description: "",
      skillsUsed: [],
      source: "manual",
      sourceRef: "",
      resultSummary: "",
      isPublic: true,
    });
    expect(prisma.portfolioProject.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ portfolioId: "p1", order: 2 }) }),
    );
  });

  it("scopes project deletion to the owning user", async () => {
    vi.mocked(prisma.portfolioProject.deleteMany).mockResolvedValue({ count: 1 } as never);
    await deleteProject("user-1", "pr1");
    expect(prisma.portfolioProject.deleteMany).toHaveBeenCalledWith({
      where: { id: "pr1", portfolio: { userId: "user-1" } },
    });
  });
});
