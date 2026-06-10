# Production Readiness

Use this checklist before launching Levio outside a local demo environment.

## Required Preflight

Run:

```bash
npm run check:release
```

This runs production env validation, lint, typecheck, tests, build, and production dependency audit.

## Launch Blockers

- `npm audit --omit=dev` currently reports upstream advisories in `next`, `next-auth`, `monaco-editor` / `dompurify`, and related transitive packages. Do not treat the app as production-ready until the upgrade path is tested and applied or the deployment surface is explicitly accepted.
- Demo mode must be disabled in production:
  - `ENABLE_DEMO_MODE=false`
  - `NEXT_PUBLIC_ENABLE_DEMO_MODE=false`
- `NEXTAUTH_SECRET` must be a strong random value with at least 32 characters.
- `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` must use `https://` in production.

## Runtime Requirements

- Store all secrets in the deployment provider secret manager. Do not bake `.env`, `.env.local`, or `.env.*.local` into images.
- Run database migrations before the app is promoted.
- Use `/api/health` as the readiness check. It returns `503` when the database check fails.
- Keep `NODE_ENV=production` in the runtime container.

## Security Notes

- The default rate limiter is in-memory and is suitable for local/demo use. For multi-instance production, replace it with a shared backend such as Redis.
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
