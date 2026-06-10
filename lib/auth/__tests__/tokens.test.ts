// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";

import {
  issueTokenPair,
  readBearerToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  type TokenIdentity,
} from "@/lib/auth/tokens";

const identity: TokenIdentity = {
  id: "user-1",
  email: "student@levio.local",
  role: "STUDENT",
};

beforeAll(() => {
  process.env.AUTH_TOKEN_SECRET = "test-secret-at-least-32-characters-long-xxxx";
});

describe("auth tokens", () => {
  it("issues a verifiable access/refresh pair", async () => {
    const pair = await issueTokenPair(identity);
    expect(pair.tokenType).toBe("Bearer");
    expect(pair.expiresIn).toBeGreaterThan(0);

    const access = await verifyAccessToken(pair.accessToken);
    expect(access).toEqual(identity);

    const refresh = await verifyRefreshToken(pair.refreshToken);
    expect(refresh).toEqual(identity);
  });

  it("does not accept an access token where a refresh token is required (and vice versa)", async () => {
    const pair = await issueTokenPair(identity);
    expect(await verifyRefreshToken(pair.accessToken)).toBeNull();
    expect(await verifyAccessToken(pair.refreshToken)).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const refresh = await signRefreshToken(identity);
    process.env.AUTH_TOKEN_SECRET = "a-completely-different-secret-value-yyyy";
    expect(await verifyRefreshToken(refresh)).toBeNull();
    process.env.AUTH_TOKEN_SECRET = "test-secret-at-least-32-characters-long-xxxx";
  });

  it("rejects garbage tokens", async () => {
    expect(await verifyAccessToken("not-a-jwt")).toBeNull();
  });
});

describe("readBearerToken", () => {
  it("extracts the token from an Authorization header", () => {
    expect(readBearerToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(readBearerToken("bearer abc")).toBe("abc");
  });

  it("returns null for missing or malformed headers", () => {
    expect(readBearerToken(null)).toBeNull();
    expect(readBearerToken("")).toBeNull();
    expect(readBearerToken("Token abc")).toBeNull();
  });
});
