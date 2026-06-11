# Production Readiness

Use this checklist before launching Levio outside a local demo environment.

## Required Preflight

Run:

```bash
npm run check:release
```

This runs production env validation, lint, typecheck, tests, build, and production dependency audit.

## Launch Blockers

- Demo mode must be disabled in production (`validateEnv` enforces this):
  - `ENABLE_DEMO_MODE=false`
  - `NEXT_PUBLIC_ENABLE_DEMO_MODE=false`
- `NEXTAUTH_SECRET` must be a strong random value with at least 32 characters.
  If `AUTH_TOKEN_SECRET` is set, it must also be ≥32 characters.
- `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` must use `https://` in production.
- Apply the database migration that adds `User.passwordHash` and
  `User.emailVerified` before promoting (see Database below).

## Database

The credential-auth columns (`passwordHash`, `emailVerified`) require a schema
migration. Generate and apply it from the new `prisma/schema.prisma`:

```bash
# Create the migration (against a dev/shadow DB):
npx prisma migrate dev --name add_user_credentials
# In CI/CD, apply committed migrations to the runtime DB:
npx prisma migrate deploy
```

## Auth, email & OAuth

- Real accounts use bcrypt password hashes. Registration is `POST /api/v1/auth/register`.
- Password reset and email verification use stateless action tokens; no extra
  table is required. Configure email delivery, or links are only logged:
  - `RESEND_API_KEY`, `EMAIL_FROM` — without a key, emails print to the server log (dev only).
- OAuth (optional) is enabled per provider when its env pair is set:
  - `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
  - `GITHUB_ID` + `GITHUB_SECRET`
  - Redirect URI: `${NEXTAUTH_URL}/api/auth/callback/<provider>`

## Rate limiting

- For multi-instance production set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
  to share limits across instances. Without them, limiting is in-memory per node
  (`validateEnv` warns). If Redis is unreachable at request time, the limiter
  fails open to in-memory rather than blocking traffic.

## Runtime Requirements

- Store all secrets in the deployment provider secret manager. Do not bake `.env`, `.env.local`, or `.env.*.local` into images.
- Run database migrations (`prisma migrate deploy`) before the app is promoted.
- Use `/api/health` as the readiness check. It returns `503` when the database check fails.
- Keep `NODE_ENV=production` in the runtime container.

## Security Notes

- The rate limiter uses Upstash Redis when configured (see Rate limiting above) and falls back to in-memory otherwise. In-memory is only safe for single-instance deployments.
- Public AI endpoints are rate-limited and input-bounded, but they can still consume paid AI quota. Monitor usage and set conservative `ADMIN_AI_RATE_LIMIT_*` / `MENTOR_RATE_LIMIT_*` values.
- Security headers are configured in `next.config.mjs`, including CSP, HSTS, frame denial, content-type sniffing protection, and permissions policy.
- Public portfolio pages under `/p/[slug]` are intentionally anonymous. All other app routes are protected by middleware unless explicitly whitelisted.

## Deployment Smoke

After deployment:

1. Open `/api/health` and confirm `status: "ok"`.
2. Verify unauthenticated users are redirected from `/dashboard` to `/login`.
3. Verify a student cannot access `/admin/dashboard`.
4. Verify an admin can access `/admin/dashboard`.
5. Complete one flow: `/skill-test` -> `/onboarding` -> track -> module -> quiz -> mission -> portfolio.
6. Confirm demo login is unavailable when demo mode is disabled.

## UX Launch Smoke

Before calling the product launch-ready, verify the core learner loop as a connected journey:

1. `/dashboard` clearly shows the current focus and next learning action.
2. `/tracks` and a module page lead the learner from theory to practice, artifact, and quiz.
3. `/review` surfaces weak questions and recovery actions after quiz mistakes.
4. `/bookmarks` and `/notes` behave as reusable study material, not passive archives.
5. `/missions` turns study material into a working artifact and can save a strong result to portfolio.
6. `/portfolio` explains readiness evidence and routes back to missions, review, and career.
7. `/career` identifies the next career action and links to interview/jobs.
8. `/interview` gives an interview result with follow-up actions.
9. `/jobs` explains whether to apply now, rehearse, or close gaps first.
10. `/planner` turns the whole loop into a weekly plan.
11. `/analytics` explains why progress is moving or stuck and points to the next corrective step.

Run this smoke on desktop and a narrow mobile viewport. The page should have a single visible `h1`, no runtime error, no console errors, and all primary CTAs should stay visible without text overlap.
