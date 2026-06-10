// @vitest-environment node
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Guard: the shared contract + client layer must stay portable to React Native /
 * Expo, which has no `next/*` runtime. These modules may only depend on `zod`
 * and type-only imports. If a server-only import sneaks in, this test fails.
 */

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

const PORTABLE_FILES = [
  "lib/contracts/params.ts",
  "lib/contracts/auth.ts",
  "lib/contracts/tracks.ts",
  "lib/contracts/bookmarks.ts",
  "lib/api/v1/client.ts",
];

/** Match runtime (non-type) imports from a `next...` module. */
const NEXT_RUNTIME_IMPORT = /^\s*import\s+(?!type\b)[^;]*from\s+["']next[/"]/m;

describe("shared client/contract portability", () => {
  for (const file of PORTABLE_FILES) {
    it(`${file} has no runtime next/* import`, () => {
      const source = readFileSync(resolve(repoRoot, file), "utf8");
      expect(NEXT_RUNTIME_IMPORT.test(source)).toBe(false);
    });
  }
});
