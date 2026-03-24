#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function parseEnvFile(contents) {
  const parsed = {};
  const lines = contents.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalIndex = trimmed.indexOf("=");
    if (equalIndex === -1) {
      continue;
    }

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
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const contents = fs.readFileSync(filePath, "utf8");
    Object.assign(result, parseEnvFile(contents));
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") {
      result[key] = value;
    }
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

function main() {
  const env = readEnvFiles();

  const required = [
    "DATABASE_URL",
    "DIRECT_URL",
    "NEXTAUTH_URL",
    "NEXTAUTH_SECRET",
    "DEMO_USER_EMAIL",
    "DEMO_USER_PASSWORD",
  ];
  const recommended = [
    "ANTHROPIC_API_KEY",
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const missingRequired = required.filter((key) => !env[key]);
  const missingRecommended = recommended.filter((key) => !env[key]);

  if (!isPositiveInt(env.ANTHROPIC_MAX_TOKENS || "700")) {
    console.error("Invalid ANTHROPIC_MAX_TOKENS. It must be a positive integer.");
    process.exit(1);
  }

  if (!isPositiveInt(env.MENTOR_RATE_LIMIT_MAX_REQUESTS || "20")) {
    console.error("Invalid MENTOR_RATE_LIMIT_MAX_REQUESTS. It must be a positive integer.");
    process.exit(1);
  }

  if (!isPositiveInt(env.MENTOR_RATE_LIMIT_WINDOW_MS || "60000")) {
    console.error("Invalid MENTOR_RATE_LIMIT_WINDOW_MS. It must be a positive integer.");
    process.exit(1);
  }

  if (!isHttpUrl(env.NEXTAUTH_URL || "")) {
    console.error("Invalid NEXTAUTH_URL. It must be an absolute http/https URL.");
    process.exit(1);
  }

  if (env.NEXT_PUBLIC_APP_URL && !isHttpUrl(env.NEXT_PUBLIC_APP_URL)) {
    console.error("Invalid NEXT_PUBLIC_APP_URL. It must be an absolute http/https URL.");
    process.exit(1);
  }

  if (env.ENABLE_DEMO_MODE && !isBooleanLike(env.ENABLE_DEMO_MODE)) {
    console.error("Invalid ENABLE_DEMO_MODE. Use 'true' or 'false'.");
    process.exit(1);
  }

  if (env.NEXT_PUBLIC_ENABLE_DEMO_MODE && !isBooleanLike(env.NEXT_PUBLIC_ENABLE_DEMO_MODE)) {
    console.error("Invalid NEXT_PUBLIC_ENABLE_DEMO_MODE. Use 'true' or 'false'.");
    process.exit(1);
  }

  if (missingRequired.length > 0) {
    console.error(`Missing required environment variables: ${missingRequired.join(", ")}`);
    process.exit(1);
  }

  if (missingRecommended.length > 0) {
    console.warn(
      `Warning: missing recommended variables for AI mentor: ${missingRecommended.join(", ")}.`,
    );
  }

  console.log("Environment check passed.");
}

main();
