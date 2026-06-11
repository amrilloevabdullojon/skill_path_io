// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userNote: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { createNote, deleteNote, listNotes } from "@/lib/notes/service";
import { prisma } from "@/lib/prisma";

const row = {
  id: "n1",
  title: "Boundary values",
  content: "Edges of partitions",
  moduleRef: "track:BA",
  lessonRef: "Lesson 2",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-02T00:00:00Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("notes service", () => {
  it("maps rows to DTOs, parsing track from moduleRef", async () => {
    vi.mocked(prisma.userNote.findMany).mockResolvedValue([row] as never);
    const [note] = await listNotes("user-1");
    expect(note).toEqual({
      id: "n1",
      title: "Boundary values",
      content: "Edges of partitions",
      track: "BA",
      lessonRef: "Lesson 2",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    });
  });

  it("defaults an unknown stored track to QA", async () => {
    vi.mocked(prisma.userNote.findMany).mockResolvedValue([{ ...row, moduleRef: "track:ZZ" }] as never);
    const [note] = await listNotes("user-1");
    expect(note.track).toBe("QA");
  });

  it("stores the track as a moduleRef on create", async () => {
    vi.mocked(prisma.userNote.create).mockResolvedValue(row as never);
    await createNote("user-1", {
      title: "t",
      content: "c",
      track: "BA",
      lessonRef: "Manual note",
    });
    expect(prisma.userNote.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ moduleRef: "track:BA" }) }),
    );
  });

  it("scopes deletion to the owner", async () => {
    vi.mocked(prisma.userNote.deleteMany).mockResolvedValue({ count: 1 } as never);
    await deleteNote("user-1", "n1");
    expect(prisma.userNote.deleteMany).toHaveBeenCalledWith({ where: { id: "n1", userId: "user-1" } });
  });
});
