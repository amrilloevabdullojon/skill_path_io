// Ambient types for process.env — mirror the variables read in lib/env.ts.
// Runtime validation lives in validateEnv() in lib/env.ts; this file only
// provides TypeScript autocomplete. Required variables stay optional here
// because runtime validation, tests, and CI deliberately exercise missing-env
// states.

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // ── Required (validated at startup) ───────────────────────────────────
      DATABASE_URL?: string;
      DIRECT_URL?: string;
      NEXTAUTH_SECRET?: string;
      NEXTAUTH_URL?: string;

      // ── App ───────────────────────────────────────────────────────────────
      NEXT_PUBLIC_APP_URL?: string;
      NODE_ENV: "development" | "production" | "test";

      // ── AI providers ──────────────────────────────────────────────────────
      GEMINI_API_KEY?: string;
      GEMINI_MODEL?: string;
      ANTHROPIC_API_KEY?: string;
      ANTHROPIC_MODEL?: string;
      ANTHROPIC_MAX_TOKENS?: string;

      // ── Rate limits ───────────────────────────────────────────────────────
      MENTOR_RATE_LIMIT_MAX_REQUESTS?: string;
      MENTOR_RATE_LIMIT_WINDOW_MS?: string;
      ADMIN_AI_RATE_LIMIT_MAX_REQUESTS?: string;
      ADMIN_AI_RATE_LIMIT_WINDOW_MS?: string;

      // ── Demo mode ─────────────────────────────────────────────────────────
      ENABLE_DEMO_MODE?: string;
      NEXT_PUBLIC_ENABLE_DEMO_MODE?: string;
      DEMO_USER_EMAIL?: string;
      DEMO_USER_PASSWORD?: string;

      // ── SaaS ──────────────────────────────────────────────────────────────
      DEFAULT_SUBSCRIPTION_PLAN?: string;
    }
  }
}

export {};
