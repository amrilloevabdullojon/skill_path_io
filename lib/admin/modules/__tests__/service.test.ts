import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma before importing the service
vi.mock("@/lib/prisma", () => ({
  prisma: {
    module: {
      update: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      findUnique: vi.fn(),
      aggregate: vi.fn(),
    },
    $transaction: vi.fn((calls: unknown[]) => Promise.all(calls)),
  },
}));

import { prisma } from "@/lib/prisma";
import {
  moduleUpdate,
  moduleCreate,
  moduleDelete,
  moduleBulkDelete,
  moduleReorder,
  moduleDuplicate,
} from "@/lib/admin/modules/service";

// Typed helpers to access vi mocks without casting Prisma delegates
const mockUpdate = vi.mocked(prisma.module.update);
const mockCreate = vi.mocked(prisma.module.create);
const mockDelete = vi.mocked(prisma.module.delete);
const mockDeleteMany = vi.mocked(prisma.module.deleteMany);
const mockFindUnique = vi.mocked(prisma.module.findUnique);
const mockAggregate = vi.mocked(prisma.module.aggregate);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("moduleUpdate", () => {
  it("calls prisma.module.update with correct args", async () => {
    mockUpdate.mockResolvedValue({ id: "m1" } as any);
    await moduleUpdate("m1", { title: "New Title", duration: 60, order: 1 });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "m1" },
      data: { title: "New Title", description: undefined, duration: 60, order: 1 },
    });
  });

  it("maps null description to undefined", async () => {
    mockUpdate.mockResolvedValue({ id: "m1" } as any);
    await moduleUpdate("m1", { title: "T", description: null, duration: 30, order: 2 });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ description: undefined }) }),
    );
  });
});

describe("moduleCreate", () => {
  it("includes content: {} in the created record", async () => {
    mockCreate.mockResolvedValue({ id: "m2" } as any);
    await moduleCreate({ trackId: "t1", title: "Mod", description: "Desc", duration: 45, order: 1 });
    expect(mockCreate).toHaveBeenCalledWith({
      data: { trackId: "t1", title: "Mod", description: "Desc", duration: 45, order: 1, content: {} },
    });
  });
});

describe("moduleDelete", () => {
  it("deletes by id", async () => {
    mockDelete.mockResolvedValue({ id: "m3" } as any);
    await moduleDelete("m3");
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "m3" } });
  });
});

describe("moduleBulkDelete", () => {
  it("deletes all given ids", async () => {
    mockDeleteMany.mockResolvedValue({ count: 2 });
    await moduleBulkDelete(["m1", "m2"]);
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { id: { in: ["m1", "m2"] } } });
  });
});

describe("moduleReorder", () => {
  it("runs an update for each entry inside a transaction", async () => {
    mockUpdate.mockResolvedValue({} as any);
    await moduleReorder([
      { id: "m1", order: 1 },
      { id: "m2", order: 2 },
    ]);
    expect(mockUpdate).toHaveBeenCalledTimes(2);
    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: "m1" }, data: { order: 1 } });
    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: "m2" }, data: { order: 2 } });
  });
});

describe("moduleDuplicate", () => {
  it("returns null when source module is not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await moduleDuplicate("missing-id");
    expect(result).toBeNull();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("creates a copy with '(copy)' suffix at next order position", async () => {
    mockFindUnique.mockResolvedValue({
      id: "m1",
      trackId: "t1",
      title: "Module One",
      description: "Desc",
      duration: 60,
      order: 1,
      content: {},
      lessons: [{ order: 1, title: "Lesson A", body: "body", type: "TEXT" }],
    } as any);
    mockAggregate.mockResolvedValue({ _max: { order: 3 }, _count: null, _avg: null, _sum: null, _min: null } as any);
    mockCreate.mockResolvedValue({ id: "m-copy" } as any);

    const result = await moduleDuplicate("m1");

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Module One (copy)",
          order: 4,
          trackId: "t1",
          lessons: {
            create: [{ order: 1, title: "Lesson A", body: "body", type: "TEXT" }],
          },
        }),
      }),
    );
    expect(result).toEqual({ id: "m-copy" });
  });
});
