import { afterEach, beforeEach, describe, expect, it } from "vitest";

// We import validateEnv fresh each time by manipulating process.env before import
// (module is stateless — only validateEnv reads process.env at call time)
import { validateEnv } from "../env";

const VALID_ENV: Record<string, string> = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  DIRECT_URL: "postgresql://user:pass@localhost:5432/db",
  NEXTAUTH_SECRET: "supersecretvalue",
  NEXTAUTH_URL: "http://localhost:3000",
};

function setEnv(overrides: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

describe("validateEnv", () => {
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    // Save and clear all relevant keys
    const allKeys = [...Object.keys(VALID_ENV), "ANTHROPIC_MAX_TOKENS", "ENABLE_DEMO_MODE", "NEXT_PUBLIC_APP_URL"];
    for (const key of allKeys) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
    setEnv(VALID_ENV);
  });

  afterEach(() => {
    setEnv(savedEnv as Record<string, string>);
  });

  it("passes with all required vars set", () => {
    expect(() => validateEnv()).not.toThrow();
  });

  it("throws when DATABASE_URL is missing", () => {
    delete process.env.DATABASE_URL;
    expect(() => validateEnv()).toThrow(/DATABASE_URL/);
  });

  it("throws when DIRECT_URL is missing", () => {
    delete process.env.DIRECT_URL;
    expect(() => validateEnv()).toThrow(/DIRECT_URL/);
  });

  it("throws when NEXTAUTH_SECRET is missing", () => {
    delete process.env.NEXTAUTH_SECRET;
    expect(() => validateEnv()).toThrow(/NEXTAUTH_SECRET/);
  });

  it("throws when NEXTAUTH_URL is not a valid http URL", () => {
    process.env.NEXTAUTH_URL = "not-a-url";
    expect(() => validateEnv()).toThrow(/NEXTAUTH_URL/);
  });

  it("throws when ANTHROPIC_MAX_TOKENS is not a positive integer", () => {
    process.env.ANTHROPIC_MAX_TOKENS = "-5";
    expect(() => validateEnv()).toThrow(/ANTHROPIC_MAX_TOKENS/);
  });

  it("throws when ANTHROPIC_MAX_TOKENS is zero", () => {
    process.env.ANTHROPIC_MAX_TOKENS = "0";
    expect(() => validateEnv()).toThrow(/ANTHROPIC_MAX_TOKENS/);
  });

  it("throws when ANTHROPIC_MAX_TOKENS is non-numeric", () => {
    process.env.ANTHROPIC_MAX_TOKENS = "abc";
    expect(() => validateEnv()).toThrow(/ANTHROPIC_MAX_TOKENS/);
  });

  it("accepts ANTHROPIC_MAX_TOKENS as valid positive integer", () => {
    process.env.ANTHROPIC_MAX_TOKENS = "1000";
    expect(() => validateEnv()).not.toThrow();
  });

  it("throws when ENABLE_DEMO_MODE is not boolean-like", () => {
    process.env.ENABLE_DEMO_MODE = "yes";
    expect(() => validateEnv()).toThrow(/ENABLE_DEMO_MODE/);
  });

  it("accepts ENABLE_DEMO_MODE as 'true'", () => {
    process.env.ENABLE_DEMO_MODE = "true";
    expect(() => validateEnv()).not.toThrow();
  });

  it("accepts ENABLE_DEMO_MODE as 'false'", () => {
    process.env.ENABLE_DEMO_MODE = "false";
    expect(() => validateEnv()).not.toThrow();
  });

  it("throws when NEXT_PUBLIC_APP_URL is set to invalid URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "ftp://invalid";
    expect(() => validateEnv()).toThrow(/NEXT_PUBLIC_APP_URL/);
  });

  it("accepts valid NEXT_PUBLIC_APP_URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://skillpath.io";
    expect(() => validateEnv()).not.toThrow();
  });

  it("reports multiple missing vars in one error", () => {
    delete process.env.DATABASE_URL;
    delete process.env.DIRECT_URL;
    expect(() => validateEnv()).toThrow(/DATABASE_URL/);
  });
});
