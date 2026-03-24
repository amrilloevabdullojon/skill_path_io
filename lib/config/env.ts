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
  demoUserEmail: string;
  demoUserPassword: string;
  anthropicApiKey: string | null;
  anthropicModel: string;
  anthropicMaxTokens: number;
  mentorRateLimitMaxRequests: number;
  mentorRateLimitWindowMs: number;
};

let cachedEnv: ServerEnv | null = null;

function readString(name: string) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
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
  const supabaseUrl = readString("NEXT_PUBLIC_SUPABASE_URL") || null;
  const supabaseAnonKey = readString("NEXT_PUBLIC_SUPABASE_ANON_KEY") || null;
  const supabaseServiceRoleKey = readString("SUPABASE_SERVICE_ROLE_KEY") || null;
  const demoUserEmail = readString("DEMO_USER_EMAIL");
  const demoUserPassword = readString("DEMO_USER_PASSWORD");
  const anthropicApiKeyRaw = readString("ANTHROPIC_API_KEY");

  const missing = [
    !databaseUrl ? "DATABASE_URL" : "",
    !nextAuthUrl ? "NEXTAUTH_URL" : "",
    !nextAuthSecret ? "NEXTAUTH_SECRET" : "",
    !demoUserEmail ? "DEMO_USER_EMAIL" : "",
    !demoUserPassword ? "DEMO_USER_PASSWORD" : "",
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
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
    demoUserEmail,
    demoUserPassword,
    anthropicApiKey: anthropicApiKeyRaw || null,
    anthropicModel: readString("ANTHROPIC_MODEL") || "claude-3-5-sonnet-latest",
    anthropicMaxTokens: readPositiveInt("ANTHROPIC_MAX_TOKENS", 700),
    mentorRateLimitMaxRequests: readPositiveInt("MENTOR_RATE_LIMIT_MAX_REQUESTS", 20),
    mentorRateLimitWindowMs: readPositiveInt("MENTOR_RATE_LIMIT_WINDOW_MS", 60_000),
  };

  return cachedEnv;
}
