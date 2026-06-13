// @vitest-environment node
import { describe, expect, it } from "vitest";

import { RegisterPushTokenSchema } from "@/lib/contracts/push";

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
