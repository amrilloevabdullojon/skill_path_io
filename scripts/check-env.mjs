#!/usr/bin/env node
/**
 * Pre-flight environment variable checker.
 *
 * Usage:
 *   node scripts/check-env.mjs          # checks .env + .env.local + process.env
 *   node scripts/check-env.mjs --prod   # additional production-mode checks
 *
 * Run automatically via `npm run check:env` and `npm run prestart`.
 */

import fs from "node:fs";
import path from "node:path";

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseEnvFile(contents) {
  const parsed = {};
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalIndex = trimmed.indexOf("=");
    if (equalIndex === -1) continue;

    const key = trimmed.slice(0, equalIndex).trim();
    let value = trimmed.slice(equalIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }
  return parsed;
}

function readEnvFiles() {
  const root = process.cwd();
  const result = {};

  for (const filename of [".env", ".env.local"]) {
    const filePath = path.join(root, filename);
    if (!fs.existsSync(filePath)) continue;
    Object.assign(result, parseEnvFile(fs.readFileSync(filePath, "utf8")));
  }

  // process.env overrides file values (e.g. CI/CD injected secrets)
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") result[key] = value;
  }

  return result;
}

function isPositiveInt(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isBooleanLike(value) {
  return value === "true" || value === "false";
}

const KNOWN_WEAK_SECRETS = new Set([
  "secret",
  "skillpath-local-secret",
  "replace-with-strong-secret",
  "changeme",
  "password",
]);

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const prodMode =
    args.includes("--prod") || process.env.NODE_ENV === "production";

  const env = readEnvFiles();

  let hasError = false;

  function error(msg) {
    console.error(`  ✗ ${msg}`);
    hasError = true;
  }

  function warn(msg) {
    console.warn(`  ⚠  ${msg}`);
  }

  function ok(msg) {
    console.log(`  ✓ ${msg}`);
  }

  console.log(`\nSkillPath Academy — env check${prodMode ? " [production mode]" : ""}\n`);

  // ── Required for all modes ────────────────────────────────────────────────

  const required = ["DATABASE_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET"];

  for (const key of required) {
    if (!env[key]) {
      error(`${key} is required`);
    } else {
      ok(key);
    }
  }

  // URL format checks
  if (env.NEXTAUTH_URL && !isHttpUrl(env.NEXTAUTH_URL)) {
    error("NEXTAUTH_URL must be a valid http/https URL");
  }
  if (env.NEXT_PUBLIC_APP_URL && !isHttpUrl(env.NEXT_PUBLIC_APP_URL)) {
    error("NEXT_PUBLIC_APP_URL must be a valid http/https URL");
  }

  // Numeric format checks
  for (const [key, fallback] of [
    ["ANTHROPIC_MAX_TOKENS", "700"],
    ["MENTOR_RATE_LIMIT_MAX_REQUESTS", "20"],
    ["MENTOR_RATE_LIMIT_WINDOW_MS", "60000"],
    ["ADMIN_AI_RATE_LIMIT_MAX_REQUESTS", "30"],
    ["ADMIN_AI_RATE_LIMIT_WINDOW_MS", "60000"],
  ]) {
    const val = env[key] || fallback;
    if (!isPositiveInt(val)) {
      error(`${key} must be a positive integer (got "${env[key]}")`);
    }
  }

  // Boolean flags
  for (const flag of ["ENABLE_DEMO_MODE", "NEXT_PUBLIC_ENABLE_DEMO_MODE"]) {
    if (env[flag] && !isBooleanLike(env[flag])) {
      error(`${flag} must be "true" or "false" (got "${env[flag]}")`);
    }
  }

  // ── Demo-mode conditional requirements ───────────────────────────────────

  const demoOn = env.ENABLE_DEMO_MODE === "true" || env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true";

  if (demoOn) {
    console.log("\n  [demo mode is ON]");
    if (!env.DEMO_USER_EMAIL) {
      error("DEMO_USER_EMAIL is required when ENABLE_DEMO_MODE=true");
    } else {
      ok("DEMO_USER_EMAIL");
    }
    if (!env.DEMO_USER_PASSWORD) {
      error("DEMO_USER_PASSWORD is required when ENABLE_DEMO_MODE=true");
    } else {
      ok("DEMO_USER_PASSWORD");
    }
  }

  // ── Production-specific checks ────────────────────────────────────────────

  if (prodMode) {
    console.log("\n  [production checks]");

    if (demoOn) {
      warn("DEMO MODE is enabled — disable for production (set ENABLE_DEMO_MODE=false)");
    }

    // Secret strength
    const secret = env.NEXTAUTH_SECRET ?? "";
    if (secret.length < 32) {
      error(
        `NEXTAUTH_SECRET is too short (${secret.length} chars, need ≥32). ` +
          "Generate with: openssl rand -base64 32",
      );
    } else if (KNOWN_WEAK_SECRETS.has(secret)) {
      error(
        `NEXTAUTH_SECRET is a known-weak placeholder. ` +
          "Generate with: openssl rand -base64 32",
      );
    } else {
      ok("NEXTAUTH_SECRET strength OK");
    }

    // HTTPS required in production
    if (env.NEXTAUTH_URL && env.NEXTAUTH_URL.startsWith("http://")) {
      warn("NEXTAUTH_URL uses http:// — HTTPS is strongly recommended in production");
    }
    if (env.NEXT_PUBLIC_APP_URL && env.NEXT_PUBLIC_APP_URL.startsWith("http://")) {
      warn("NEXT_PUBLIC_APP_URL uses http:// — HTTPS is strongly recommended in production");
    }
  }

  // ── AI providers (recommended, not required) ──────────────────────────────

  console.log("\n  [AI providers — optional but needed for AI features]");
  const hasGemini = Boolean(env.GEMINI_API_KEY);
  const hasAnthropic = Boolean(env.ANTHROPIC_API_KEY);

  if (!hasGemini && !hasAnthropic) {
    warn("Neither GEMINI_API_KEY nor ANTHROPIC_API_KEY is set — AI features will be disabled");
  } else {
    if (hasGemini) ok("GEMINI_API_KEY");
    if (hasAnthropic) ok("ANTHROPIC_API_KEY");
  }

  // ── Other recommended vars ────────────────────────────────────────────────

  console.log("\n  [recommended vars]");
  for (const key of [
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]) {
    if (!env[key]) {
      warn(`${key} is not set`);
    } else {
      ok(key);
    }
  }

  // ── Result ────────────────────────────────────────────────────────────────

  console.log("");
  if (hasError) {
    console.error("Environment check FAILED. Fix the errors above before starting the app.\n");
    process.exit(1);
  }

  console.log("Environment check passed.\n");
}

main();
