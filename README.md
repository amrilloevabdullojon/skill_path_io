# SkillPath Academy

Next.js 14 App Router learning and career platform with Prisma + PostgreSQL, SaaS feature gating, analytics, marketplace, and admin studio.

## Stack
- Next.js 14 (App Router)
- Prisma 5 + PostgreSQL (Supabase-compatible)
- NextAuth (credentials demo flow preserved)
- Recharts, Zustand, Framer Motion
- Anthropic API (AI mentor)

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
- `DEMO_USER_EMAIL`
- `DEMO_USER_PASSWORD`

Recommended:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`

Optional:
- `ENABLE_DEMO_MODE` (`true`/`false`)
- `NEXT_PUBLIC_ENABLE_DEMO_MODE` (`true`/`false`)
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
