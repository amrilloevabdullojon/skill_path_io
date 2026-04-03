/**
 * Typed environment variable access with runtime validation.
 *
 * Call `validateEnv()` once at server startup (via instrumentation.ts).
 * Use the exported `env` constants throughout the codebase instead of raw
 * `process.env` to keep a single source of truth and fail-fast on misconfiguration.
 */

const REQUIRED_VARS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
] as const;

type RequiredVar = (typeof REQUIRED_VARS)[number];

function str(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function strOrNull(key: string): string | null {
  const v = process.env[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function positiveInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Env var ${key} must be a positive integer, got: "${raw}"`);
  }
  return parsed;
}

function httpUrl(key: string, fallback: string): string {
  const value = process.env[key] ?? fallback;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
  } catch {
    throw new Error(`Env var ${key} must be a valid http/https URL, got: "${value}"`);
  }
  return value;
}

const KNOWN_WEAK_SECRETS = new Set([
  "secret",
  "skillpath-local-secret",
  "replace-with-strong-secret",
  "changeme",
  "password",
]);

/**
 * Validates all required environment variables and format constraints.
 * Throws with a descriptive message on the first failure.
 * Call once during server startup via instrumentation.ts.
 */
export function validateEnv(): void {
  const missing = (REQUIRED_VARS as readonly string[]).filter((key) => !process.env[key]) as RequiredVar[];

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        `Copy .env.example to .env.local and fill in the values.`,
    );
  }

  // Format checks (throw if set to invalid value)
  positiveInt("ANTHROPIC_MAX_TOKENS", 700);
  positiveInt("MENTOR_RATE_LIMIT_MAX_REQUESTS", 20);
  positiveInt("MENTOR_RATE_LIMIT_WINDOW_MS", 60_000);
  positiveInt("ADMIN_AI_RATE_LIMIT_MAX_REQUESTS", 30);
  positiveInt("ADMIN_AI_RATE_LIMIT_WINDOW_MS", 60_000);
  httpUrl("NEXTAUTH_URL", "http://localhost:3000");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) httpUrl("NEXT_PUBLIC_APP_URL", appUrl);

  for (const flag of ["ENABLE_DEMO_MODE", "NEXT_PUBLIC_ENABLE_DEMO_MODE"]) {
    const v = process.env[flag];
    if (v !== undefined && v !== "true" && v !== "false") {
      throw new Error(`Env var ${flag} must be "true" or "false", got: "${v}"`);
    }
  }

  // Warn when demo mode is on — helpful reminder that was not accidentally enabled.
  const demoOn =
    process.env.ENABLE_DEMO_MODE === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true";
  if (demoOn) {
    console.warn(
      "[startup] DEMO MODE is ENABLED. This allows login without real credentials. " +
        "Set ENABLE_DEMO_MODE=false for production.",
    );
  }

  // In production, reject known-weak NEXTAUTH_SECRET values.
  if (process.env.NODE_ENV === "production") {
    const secret = process.env.NEXTAUTH_SECRET ?? "";
    if (secret.length < 32) {
      throw new Error(
        "NEXTAUTH_SECRET must be at least 32 characters in production. " +
          "Generate one with: openssl rand -base64 32",
      );
    }
    if (KNOWN_WEAK_SECRETS.has(secret)) {
      throw new Error(
        `NEXTAUTH_SECRET is set to a known-weak value ("${secret}"). ` +
          "Generate a strong secret with: openssl rand -base64 32",
      );
    }
  }

  // Demo-mode conditional requirements.
  if (demoOn) {
    if (!process.env.DEMO_USER_EMAIL) {
      throw new Error(
        "DEMO_USER_EMAIL is required when ENABLE_DEMO_MODE=true.",
      );
    }
    if (!process.env.DEMO_USER_PASSWORD) {
      throw new Error(
        "DEMO_USER_PASSWORD is required when ENABLE_DEMO_MODE=true.",
      );
    }
  }
}

// ── Typed exports ──────────────────────────────────────────────────────────────

export const env = {
  // Database
  DATABASE_URL: str("DATABASE_URL", ""),
  DIRECT_URL: str("DIRECT_URL", ""),

  // Auth
  NEXTAUTH_SECRET: str("NEXTAUTH_SECRET", ""),
  NEXTAUTH_URL: str("NEXTAUTH_URL", "http://localhost:3000"),

  // App
  APP_URL: str("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),

  // AI — Gemini
  GEMINI_API_KEY: strOrNull("GEMINI_API_KEY"),
  GEMINI_MODEL: str("GEMINI_MODEL", "gemini-2.5-flash"),

  // AI — Anthropic (optional alternative)
  ANTHROPIC_API_KEY: strOrNull("ANTHROPIC_API_KEY"),
  ANTHROPIC_MODEL: str("ANTHROPIC_MODEL", "claude-3-5-sonnet-latest"),
  ANTHROPIC_MAX_TOKENS: positiveInt("ANTHROPIC_MAX_TOKENS", 700),

  // Rate limits
  MENTOR_RATE_LIMIT_MAX_REQUESTS: positiveInt("MENTOR_RATE_LIMIT_MAX_REQUESTS", 20),
  MENTOR_RATE_LIMIT_WINDOW_MS: positiveInt("MENTOR_RATE_LIMIT_WINDOW_MS", 60_000),
  ADMIN_AI_RATE_LIMIT_MAX_REQUESTS: positiveInt("ADMIN_AI_RATE_LIMIT_MAX_REQUESTS", 30),
  ADMIN_AI_RATE_LIMIT_WINDOW_MS: positiveInt("ADMIN_AI_RATE_LIMIT_WINDOW_MS", 60_000),

  // Demo — only meaningful when demo mode is explicitly enabled.
  // Default to empty string (not a hardcoded credential) so production
  // deployments don't carry implicit backdoor accounts.
  ENABLE_DEMO_MODE: str("ENABLE_DEMO_MODE", "false") === "true",
  DEMO_USER_EMAIL: strOrNull("DEMO_USER_EMAIL"),
  DEMO_USER_PASSWORD: strOrNull("DEMO_USER_PASSWORD"),

  // SaaS
  DEFAULT_SUBSCRIPTION_PLAN: str("DEFAULT_SUBSCRIPTION_PLAN", "FREE"),
} as const;
