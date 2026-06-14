// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { isValidCronSecret } from "@/lib/auth/cron";

const ORIGINAL = process.env.CRON_SECRET;

beforeEach(() => {
  process.env.CRON_SECRET = "s3cret-token";
});

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = ORIGINAL;
});

describe("isValidCronSecret", () => {
  it("accepts a matching Bearer token", () => {
    expect(isValidCronSecret("Bearer s3cret-token")).toBe(true);
  });

  it("rejects a wrong token", () => {
    expect(isValidCronSecret("Bearer nope")).toBe(false);
  });

  it("rejects a missing or malformed header", () => {
    expect(isValidCronSecret(null)).toBe(false);
    expect(isValidCronSecret("s3cret-token")).toBe(false); // no "Bearer " prefix
  });

  it("is disabled (rejects everything) when CRON_SECRET is unset", () => {
    delete process.env.CRON_SECRET;
    expect(isValidCronSecret("Bearer s3cret-token")).toBe(false);
  });
});
