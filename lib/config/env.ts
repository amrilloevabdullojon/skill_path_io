import "server-only";

type ServerEnv = {
  databaseUrl: string;
  directUrl: string;
  nextAuthUrl: string;
  nextPublicAppUrl: string;
  nextAuthSecret: string;
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  supabaseServiceRoleKey: string | null;
  /**
   * Demo-mode credentials — null when demo mode is disabled.
   * Never use as a fallback in production queries.
   */
  demoUserEmail: string | null;
  demoUserPassword: string | null;
  /** Gemini (primary AI provider). Null when not configured. */
  geminiApiKey: string | null;
  geminiModel: string;
  /** Anthropic (optional secondary provider). Null when not configured. */
  anthropicApiKey: string | null;
  anthropicModel: string;
  anthropicMaxTokens: number;
  /** AI mentor: max requests per window (per IP). */
  mentorRateLimitMaxRequests: number;
  mentorRateLimitWindowMs: number;
  /** Admin AI content generation: max requests per window (per IP). */
  adminAiRateLimitMaxRequests: number;
  adminAiRateLimitWindowMs: number;
};

let cachedEnv: ServerEnv | null = null;

function readString(name: string) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function readNullableString(name: string): string | null {
  const value = process.env[name];
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed || null;
}

function readPositiveInt(name: string, fallback: number) {
  const raw = readString(name);
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const databaseUrl = readString("DATABASE_URL");
  const directUrl = readString("DIRECT_URL") || databaseUrl;
  const nextAuthUrl = readString("NEXTAUTH_URL");
  const nextPublicAppUrl = readString("NEXT_PUBLIC_APP_URL") || nextAuthUrl;
  const nextAuthSecret = readString("NEXTAUTH_SECRET");

  // Core vars are mandatory regardless of mode.
  const missing = [
    !databaseUrl ? "DATABASE_URL" : "",
    !nextAuthUrl ? "NEXTAUTH_URL" : "",
    !nextAuthSecret ? "NEXTAUTH_SECRET" : "",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  cachedEnv = {
    databaseUrl,
    directUrl,
    nextAuthUrl,
    nextPublicAppUrl,
    nextAuthSecret,
    supabaseUrl: readNullableString("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: readNullableString("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    supabaseServiceRoleKey: readNullableString("SUPABASE_SERVICE_ROLE_KEY"),
    // Demo credentials: null unless the vars are explicitly set.
    demoUserEmail: readNullableString("DEMO_USER_EMAIL"),
    demoUserPassword: readNullableString("DEMO_USER_PASSWORD"),
    // AI providers
    geminiApiKey: readNullableString("GEMINI_API_KEY"),
    geminiModel: readString("GEMINI_MODEL") || "gemini-2.5-flash",
    anthropicApiKey: readNullableString("ANTHROPIC_API_KEY"),
    anthropicModel: readString("ANTHROPIC_MODEL") || "claude-3-5-sonnet-latest",
    anthropicMaxTokens: readPositiveInt("ANTHROPIC_MAX_TOKENS", 700),
    // Rate limits
    mentorRateLimitMaxRequests: readPositiveInt("MENTOR_RATE_LIMIT_MAX_REQUESTS", 20),
    mentorRateLimitWindowMs: readPositiveInt("MENTOR_RATE_LIMIT_WINDOW_MS", 60_000),
    adminAiRateLimitMaxRequests: readPositiveInt("ADMIN_AI_RATE_LIMIT_MAX_REQUESTS", 30),
    adminAiRateLimitWindowMs: readPositiveInt("ADMIN_AI_RATE_LIMIT_WINDOW_MS", 60_000),
  };

  return cachedEnv;
}
