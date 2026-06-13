// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pushToken: { findMany: vi.fn(), deleteMany: vi.fn() },
    pushReceipt: { createMany: vi.fn(), findMany: vi.fn(), deleteMany: vi.fn() },
  },
}));

import { pollPushReceipts, sendPushToUser } from "@/lib/notifications/push";
import { prisma } from "@/lib/prisma";

const findTokens = vi.mocked(prisma.pushToken.findMany);
const deleteTokens = vi.mocked(prisma.pushToken.deleteMany);
const createReceipts = vi.mocked(prisma.pushReceipt.createMany);
const findReceipts = vi.mocked(prisma.pushReceipt.findMany);
const deleteReceipts = vi.mocked(prisma.pushReceipt.deleteMany);

type Ticket = { status: "ok" | "error"; id?: string; details?: { error?: string } };

function mockExpoSend(tickets: Ticket[]) {
  const fetchMock = vi.fn(async () => ({
    status: 200,
    json: async () => ({ data: tickets }),
  })) as unknown as typeof fetch;
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function mockExpoReceipts(data: Record<string, { status: "ok" | "error"; details?: { error?: string } }>) {
  const fetchMock = vi.fn(async () => ({
    status: 200,
    json: async () => ({ data }),
  })) as unknown as typeof fetch;
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.clearAllMocks();
  deleteTokens.mockResolvedValue({ count: 0 });
  createReceipts.mockResolvedValue({ count: 0 });
  deleteReceipts.mockResolvedValue({ count: 0 });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sendPushToUser", () => {
  it("no-ops without hitting Expo when the user has no tokens", async () => {
    findTokens.mockResolvedValue([]);
    const fetchMock = mockExpoSend([]);

    const result = await sendPushToUser("u1", { title: "Hi", body: "There" });

    expect(result).toEqual({ sent: 0, failed: 0, removed: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("skips tokens that are not valid Expo push tokens", async () => {
    findTokens.mockResolvedValue([{ token: "not-an-expo-token" }] as never);
    const fetchMock = mockExpoSend([]);

    const result = await sendPushToUser("u1", { title: "Hi", body: "There" });

    expect(result).toEqual({ sent: 0, failed: 0, removed: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("counts delivered tickets and stores their receipts", async () => {
    findTokens.mockResolvedValue([
      { token: "ExponentPushToken[a]" },
      { token: "ExponentPushToken[b]" },
    ] as never);
    mockExpoSend([
      { status: "ok", id: "r-a" },
      { status: "ok", id: "r-b" },
    ]);

    const result = await sendPushToUser("u1", { title: "Hi", body: "There" });

    expect(result).toEqual({ sent: 2, failed: 0, removed: 0 });
    expect(createReceipts).toHaveBeenCalledWith({
      data: [
        { id: "r-a", token: "ExponentPushToken[a]" },
        { id: "r-b", token: "ExponentPushToken[b]" },
      ],
      skipDuplicates: true,
    });
  });

  it("sends delivery defaults (sound, priority, channelId) to Expo", async () => {
    findTokens.mockResolvedValue([{ token: "ExponentPushToken[a]" }] as never);
    const fetchMock = mockExpoSend([{ status: "ok", id: "r-a" }]);

    await sendPushToUser("u1", { title: "Hi", body: "There", data: { href: "/x" } });

    const init = (fetchMock as unknown as { mock: { calls: [string, { body: string }][] } }).mock
      .calls[0][1];
    const body = JSON.parse(init.body);
    expect(body[0]).toMatchObject({
      to: "ExponentPushToken[a]",
      title: "Hi",
      body: "There",
      sound: "default",
      priority: "high",
      channelId: "default",
      data: { href: "/x" },
    });
  });

  it("prunes DeviceNotRegistered tokens from the ticket and reports them as removed, not failed", async () => {
    findTokens.mockResolvedValue([
      { token: "ExponentPushToken[live]" },
      { token: "ExponentPushToken[dead]" },
      { token: "ExponentPushToken[err]" },
    ] as never);
    mockExpoSend([
      { status: "ok", id: "r-live" },
      { status: "error", details: { error: "DeviceNotRegistered" } },
      { status: "error", details: { error: "MessageTooBig" } },
    ]);
    deleteTokens.mockResolvedValue({ count: 1 });

    const result = await sendPushToUser("u1", { title: "Hi", body: "There" });

    expect(result).toEqual({ sent: 1, failed: 1, removed: 1 });
    expect(deleteTokens).toHaveBeenCalledWith({
      where: { token: { in: ["ExponentPushToken[dead]"] } },
    });
  });

  it("counts the batch as failed when Expo transport throws", async () => {
    findTokens.mockResolvedValue([{ token: "ExponentPushToken[a]" }] as never);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }) as unknown as typeof fetch,
    );

    const result = await sendPushToUser("u1", { title: "Hi", body: "There" });

    expect(result).toEqual({ sent: 0, failed: 1, removed: 0 });
    expect(deleteTokens).not.toHaveBeenCalled();
  });
});

describe("pollPushReceipts", () => {
  it("no-ops without hitting Expo when nothing is pending", async () => {
    findReceipts.mockResolvedValue([]);
    const fetchMock = mockExpoReceipts({});

    const result = await pollPushReceipts();

    expect(result).toEqual({ checked: 0, removed: 0, pending: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("prunes tokens for DeviceNotRegistered receipts and deletes resolved receipts", async () => {
    findReceipts.mockResolvedValue([
      { id: "r-ok", token: "ExponentPushToken[ok]" },
      { id: "r-dead", token: "ExponentPushToken[dead]" },
    ] as never);
    mockExpoReceipts({
      "r-ok": { status: "ok" },
      "r-dead": { status: "error", details: { error: "DeviceNotRegistered" } },
    });
    deleteTokens.mockResolvedValue({ count: 1 });

    const result = await pollPushReceipts();

    expect(result).toEqual({ checked: 2, removed: 1, pending: 0 });
    expect(deleteTokens).toHaveBeenCalledWith({
      where: { token: { in: ["ExponentPushToken[dead]"] } },
    });
    expect(deleteReceipts).toHaveBeenCalledWith({ where: { id: { in: ["r-ok", "r-dead"] } } });
  });

  it("leaves unresolved receipts pending when Expo omits them", async () => {
    findReceipts.mockResolvedValue([
      { id: "r-1", token: "ExponentPushToken[1]" },
      { id: "r-2", token: "ExponentPushToken[2]" },
    ] as never);
    // Expo only returns a verdict for r-1; r-2 is not ready yet.
    mockExpoReceipts({ "r-1": { status: "ok" } });

    const result = await pollPushReceipts();

    expect(result).toEqual({ checked: 1, removed: 0, pending: 1 });
    expect(deleteReceipts).toHaveBeenCalledWith({ where: { id: { in: ["r-1"] } } });
  });

  it("keeps receipts pending and prunes nothing when getReceipts fails", async () => {
    findReceipts.mockResolvedValue([{ id: "r-1", token: "ExponentPushToken[1]" }] as never);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }) as unknown as typeof fetch,
    );

    const result = await pollPushReceipts();

    expect(result).toEqual({ checked: 0, removed: 0, pending: 1 });
    expect(deleteTokens).not.toHaveBeenCalled();
    expect(deleteReceipts).not.toHaveBeenCalled();
  });
});
