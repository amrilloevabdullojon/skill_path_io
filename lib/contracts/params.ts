import { z } from "zod";

/**
 * Pure Zod helpers shared by API contracts.
 *
 * This module must stay free of any server-only imports (e.g. next/server) so
 * the contracts — and the typed client built on them — remain portable to
 * non-Node runtimes such as React Native / Expo.
 */

/** Coerce a query-string value into a boolean with a default. Accepts 1/0/true/false/yes/no/on/off. */
export function booleanParam(defaultValue: boolean) {
  return z.preprocess((value) => {
    if (value === undefined || value === null || value === "") return defaultValue;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["1", "true", "yes", "on"].includes(normalized)) return true;
      if (["0", "false", "no", "off"].includes(normalized)) return false;
    }
    return value;
  }, z.boolean());
}
