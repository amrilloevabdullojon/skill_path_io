// @vitest-environment node
import { describe, expect, it } from "vitest";

import { RegisterPushTokenSchema, SendPushSchema } from "@/lib/contracts/push";

describe("push token contract", () => {
  it("defaults platform to expo", () => {
    const result = RegisterPushTokenSchema.safeParse({ token: "ExponentPushToken[abc]" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.platform).toBe("expo");
  });

  it("rejects an empty token and unknown platform", () => {
    expect(RegisterPushTokenSchema.safeParse({ token: "" }).success).toBe(false);
    expect(RegisterPushTokenSchema.safeParse({ token: "x", platform: "web" }).success).toBe(false);
  });
});

describe("send push contract", () => {
  it("accepts a userId, title, body and optional data", () => {
    const result = SendPushSchema.safeParse({
      userId: "u1",
      title: "Hi",
      body: "Your certificate is ready",
      data: { href: "/dashboard" },
    });
    expect(result.success).toBe(true);
  });

  it("requires userId, title and body", () => {
    expect(SendPushSchema.safeParse({ title: "x", body: "y" }).success).toBe(false);
    expect(SendPushSchema.safeParse({ userId: "u1", title: "", body: "y" }).success).toBe(false);
    expect(SendPushSchema.safeParse({ userId: "u1", title: "x", body: "" }).success).toBe(false);
  });
});
