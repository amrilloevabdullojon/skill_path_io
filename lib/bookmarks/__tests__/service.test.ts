// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userBookmark: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { listBookmarks, createBookmark, deleteBookmark } from "@/lib/bookmarks/service";
import { prisma } from "@/lib/prisma";

const row = {
  id: "b1",
  title: "Test plans 101",
  href: "/tracks/qa/lesson-1",
  type: "lesson",
  tag: "QA",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-02T00:00:00Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("bookmarks service", () => {
  it("maps rows to ISO-string DTOs", async () => {
    vi.mocked(prisma.userBookmark.findMany).mockResolvedValue([row] as never);
    const result = await listBookmarks("user-1");
    expect(result).toEqual([
      {
        id: "b1",
        title: "Test plans 101",
        href: "/tracks/qa/lesson-1",
        type: "lesson",
        tag: "QA",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
    ]);
    expect(prisma.userBookmark.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { updatedAt: "desc" },
      take: 120,
    });
  });

  it("coerces an unknown stored type to lesson", async () => {
    vi.mocked(prisma.userBookmark.findMany).mockResolvedValue([{ ...row, type: "legacy" }] as never);
    const [dto] = await listBookmarks("user-1");
    expect(dto.type).toBe("lesson");
  });

  it("returns the existing bookmark without creating a duplicate", async () => {
    vi.mocked(prisma.userBookmark.findFirst).mockResolvedValue(row as never);
    const result = await createBookmark("user-1", {
      title: row.title,
      href: row.href,
      type: "lesson",
      tag: "QA",
    });
    expect(result.created).toBe(false);
    expect(prisma.userBookmark.create).not.toHaveBeenCalled();
  });

  it("creates a new bookmark when none exists", async () => {
    vi.mocked(prisma.userBookmark.findFirst).mockResolvedValue(null as never);
    vi.mocked(prisma.userBookmark.create).mockResolvedValue(row as never);
    const result = await createBookmark("user-1", {
      title: row.title,
      href: row.href,
      type: "lesson",
      tag: "QA",
    });
    expect(result.created).toBe(true);
    expect(result.bookmark.id).toBe("b1");
  });

  it("scopes deletion to the owner", async () => {
    vi.mocked(prisma.userBookmark.deleteMany).mockResolvedValue({ count: 1 } as never);
    await deleteBookmark("user-1", "b1");
    expect(prisma.userBookmark.deleteMany).toHaveBeenCalledWith({
      where: { id: "b1", userId: "user-1" },
    });
  });
});
