# Levio

Next.js 16 App Router learning and career platform with Prisma + PostgreSQL, SaaS feature gating, analytics, marketplace, and admin studio — plus a versioned API and a React Native (Expo) mobile client.

## Stack
- Next.js 16 (App Router)
- Prisma 5 + PostgreSQL (Supabase-compatible)
- NextAuth — real credential auth (bcrypt), email verification + password reset, Google/GitHub OAuth; plus stateless JWT tokens for the mobile/API clients
- Recharts, Zustand, Framer Motion
- AI mentor (Gemini, optional Anthropic)
- Sentry (opt-in via `SENTRY_DSN`), Upstash Redis rate limiting (opt-in)

## Architecture

- **Versioned API** under `app/api/v1/*` — REST + Zod contracts (`lib/contracts/*`)
  as the single source of truth, served with an OpenAPI 3.0 spec at
  `/api/v1/openapi.json`. Both web and mobile consume the same typed client SDK
  (`lib/api/v1/client.ts`). Auth via NextAuth cookie **or** Bearer token.
- **Mobile app** in `apps/mobile/` (Expo, expo-router) shares the contracts +
  SDK with the web app — no duplicated types. See `apps/mobile/README.md`.
- Docs: `docs/PRODUCTION_READINESS.md`, `docs/ARCHITECTURE_AUDIT_REPORT.md`.

## Testing
- Unit/contract: `npm run test` (vitest).
- E2E: `npm run test:e2e` (Playwright — run `npx playwright install` first; starts the dev server automatically).

## Local Setup
1. Install dependencies:
```bash
npm install
```

2. Create local env:
```bash
cp .env.example .env.local
```

3. Configure database URLs in `.env.local`:
- `DATABASE_URL` should point to your runtime DB (Supabase pooler recommended).
- `DIRECT_URL` should point to direct Postgres for schema operations.

4. Generate Prisma client and sync schema:
```bash
npm run prisma:generate
npx prisma db push
```

5. Seed initial content (tracks, missions, jobs, quests, knowledge map, community):
```bash
npm run db:seed
```

6. Start app:
```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables
Required:
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

Recommended:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `ANTHROPIC_API_KEY` (optional secondary provider)

Optional:
- `ENABLE_DEMO_MODE` (`true`/`false`)
- `NEXT_PUBLIC_ENABLE_DEMO_MODE` (`true`/`false`)
- `DEMO_USER_EMAIL` (required only when demo mode is enabled)
- `DEMO_USER_PASSWORD` (required only when demo mode is enabled)
- `GEMINI_MODEL` (default: `gemini-2.5-flash`)
- `ANTHROPIC_MODEL` (default: `claude-3-5-sonnet-latest`)
- `ANTHROPIC_MAX_TOKENS` (default: `700`)
- `MENTOR_RATE_LIMIT_MAX_REQUESTS` (default: `20`)
- `MENTOR_RATE_LIMIT_WINDOW_MS` (default: `60000`)
- `ADMIN_AI_RATE_LIMIT_MAX_REQUESTS` (default: `30`)
- `ADMIN_AI_RATE_LIMIT_WINDOW_MS` (default: `60000`)
- `DEFAULT_SUBSCRIPTION_PLAN` (`FREE`, `PRO`, `CAREER_ACCELERATOR`, `TEAM`)

## Checks
```bash
npm run check:env
npm run lint
npm run typecheck
npm run build
npm run start
```

## Supabase + Prisma Notes
- `prisma/schema.prisma` uses:
  - `url = env("DATABASE_URL")`
  - `directUrl = env("DIRECT_URL")`
- For Supabase:
  - Use pooler URL for `DATABASE_URL` (runtime).
  - Use direct connection for `DIRECT_URL` (schema/seed tasks).

## Vercel Deployment
1. Connect repo to Vercel.
2. Set all required environment variables in Vercel Project Settings.
3. Set production-safe flags:
- `ENABLE_DEMO_MODE=false`
- `NEXT_PUBLIC_ENABLE_DEMO_MODE=false`
4. Ensure DB schema is applied (`prisma db push` from CI or a controlled release step).
5. Deploy.

Notes:
- `prebuild` runs `prisma generate`.
- Runtime routes now read learning content, missions, jobs, notes, bookmarks, analytics, and community data from DB-backed sources.
