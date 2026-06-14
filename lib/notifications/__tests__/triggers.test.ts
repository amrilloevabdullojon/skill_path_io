// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/notifications/push", () => ({ sendPushToUser: vi.fn() }));

import { notifyCertificateEarned, notifyModuleCompleted } from "@/lib/notifications/triggers";
import { sendPushToUser } from "@/lib/notifications/push";

const send = vi.mocked(sendPushToUser);

beforeEach(() => {
  vi.clearAllMocks();
  send.mockResolvedValue({ sent: 1, failed: 0, removed: 0 });
});

describe("notifyCertificateEarned", () => {
  it("sends a certificate push with the track title and a dashboard deep link", async () => {
    await notifyCertificateEarned("u1", "Backend Basics");

    expect(send).toHaveBeenCalledTimes(1);
    const [userId, payload] = send.mock.calls[0];
    expect(userId).toBe("u1");
    expect(payload.body).toContain("Backend Basics");
    expect(payload.data).toMatchObject({ type: "certificate", href: "/dashboard?tab=skills#xp" });
  });

  it("never throws when delivery fails (must not block issuance)", async () => {
    send.mockRejectedValue(new Error("expo down"));
    await expect(notifyCertificateEarned("u1", "X")).resolves.toBeUndefined();
  });
});

describe("notifyModuleCompleted", () => {
  it("sends a module push with the module title and a track deep link", async () => {
    await notifyModuleCompleted("u1", "SQL Joins", "data-analysis");

    expect(send).toHaveBeenCalledTimes(1);
    const [userId, payload] = send.mock.calls[0];
    expect(userId).toBe("u1");
    expect(payload.body).toContain("SQL Joins");
    expect(payload.data).toMatchObject({ type: "module", href: "/tracks/data-analysis" });
  });

  it("never throws when delivery fails (must not block grading)", async () => {
    send.mockRejectedValue(new Error("expo down"));
    await expect(notifyModuleCompleted("u1", "M", "t")).resolves.toBeUndefined();
  });
});
