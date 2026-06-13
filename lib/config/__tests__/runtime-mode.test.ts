import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { isDemoModeEnabled } from "../runtime-mode";

const savedEnv: Record<string, string | undefined> = {};
const keys = ["ENABLE_DEMO_MODE", "NEXT_PUBLIC_ENABLE_DEMO_MODE"];

function setEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

describe("isDemoModeEnabled", () => {
  beforeEach(() => {
    for (const key of keys) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of keys) {
      setEnv(key, savedEnv[key]);
    }
  });

  it("defaults to disabled", () => {
    expect(isDemoModeEnabled()).toBe(false);
  });

  it("uses the explicit server flag first", () => {
    process.env.ENABLE_DEMO_MODE = "false";
    process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE = "true";

    expect(isDemoModeEnabled()).toBe(false);
  });

  it("allows the public flag when the server flag is absent", () => {
    process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE = "true";

    expect(isDemoModeEnabled()).toBe(true);
  });
});
