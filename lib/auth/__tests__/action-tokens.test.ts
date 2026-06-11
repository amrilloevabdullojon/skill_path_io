// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";

import {
  passwordFingerprint,
  signActionToken,
  verifyActionToken,
} from "@/lib/auth/action-tokens";

beforeAll(() => {
  process.env.AUTH_TOKEN_SECRET = "action-token-secret-at-least-32-characters";
});

describe("action tokens", () => {
  it("signs and verifies a token of the matching type", async () => {
    const token = await signActionToken("user-1", "emailverify", 3600);
    const result = await verifyActionToken(token, "emailverify");
    expect(result?.userId).toBe("user-1");
  });

  it("rejects a token used for the wrong action type", async () => {
    const token = await signActionToken("user-1", "pwreset", 3600);
    expect(await verifyActionToken(token, "emailverify")).toBeNull();
  });

  it("carries extra claims (password fingerprint)", async () => {
    const pwh = passwordFingerprint("hash-abc");
    const token = await signActionToken("user-1", "pwreset", 3600, { pwh });
    const result = await verifyActionToken(token, "pwreset");
    expect(result?.claims.pwh).toBe(pwh);
  });

  it("changes the fingerprint when the password hash changes (one-shot reset)", () => {
    expect(passwordFingerprint("old-hash")).not.toBe(passwordFingerprint("new-hash"));
    expect(passwordFingerprint("old-hash")).toBe(passwordFingerprint("old-hash"));
  });

  it("rejects garbage", async () => {
    expect(await verifyActionToken("not-a-token", "pwreset")).toBeNull();
  });
});
