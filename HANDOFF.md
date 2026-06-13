# Levio — Session Handoff

> Resume point for the Phase 1–4 architecture overhaul. Read this top-to-bottom
> and you can continue without re-deriving context.

_Last updated: 2026-06-12 · branch `phase2/architecture-cleanup`_

---

## TL;DR — current state

- **Branch:** `phase2/architecture-cleanup` (105 commits ahead of `main`, working tree clean).
- **Green:** `tsc --noEmit` ✅ · `eslint` ✅ · `vitest` 184 tests ✅ · `next build` ✅.
- **API:** 32 routes under `app/api/v1/*` (REST + Zod + OpenAPI + typed SDK).
- **Mobile:** Expo app in `apps/mobile/` — 13 screens, expo-router. **Code-only: not runnable/typecheckable in the dev container** (see Constraints).
- **PRs (stacked):** [#1](https://github.com/amrilloevabdullojon/skill_path_io/pull/1) `codex/stabilize-runtime-learning → main` · [#2](https://github.com/amrilloevabdullojon/skill_path_io/pull/2) `phase2/architecture-cleanup → codex/stabilize-runtime-learning`.

## The roadmap (16/16 done) + extras

| Phase | What |
|---|---|
| 1A–1E | Real auth: bcrypt registration, email verify + password reset (pages live), Google/GitHub OAuth, JWT tokens for mobile; Upstash Redis rate-limit; prod-config hardening + readiness runbook |
| 2A | 12 domains migrated to `/api/v1` (tracks set, bookmarks, notes, portfolio, planner, jobs, interview, simulation, knowledge-graph, marketplace, subscriptions, command, reports) |
| 2B / 2C / 2D / 2E | AI route metering · strip quiz answers from tracks · removed dead mock-data · skill-radar dedup + `/community` hub (redirects from `/groups`,`/discussions`) |
| 3A–3D | expo-router migration · career/account screens · push (backend `PushToken` + endpoint) · `eas.json` |
| 4A / 4B | jest-expo scaffold · Sentry (opt-in) + Playwright e2e + docs |
| extra | AI cost monitoring: `/api/v1/admin/ai-usage` + `logAiUsage` in all AI routes |

## ✅ Handoff checklist (do these in your environment)

1. **Merge PRs** — #1 first; GitHub auto-retargets #2 to `main`, then merge #2.
2. **DB migrations** — apply Prisma migrations for `User.passwordHash`, `User.emailVerified`, the `PushToken` model, and the `PushReceipt` model (added for the push receipt poller):
   ```bash
   npx prisma migrate dev --name add_user_credentials_and_push   # dev
   npx prisma migrate deploy                                      # prod
   ```
3. **Prod secrets (all opt-in, inert without)** — `RESEND_API_KEY`/`EMAIL_FROM`, `GOOGLE_*`/`GITHUB_*`, `UPSTASH_REDIS_REST_URL`/`TOKEN`, `SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN`, optionally `AUTH_TOKEN_SECRET`. See `.env.example` + `docs/PRODUCTION_READINESS.md`.
4. **Mobile** — `cd apps/mobile && npm install && npx expo install …` (command in `apps/mobile/README.md`) → `npm test` (jest), `npm run ios`, `eas build`.
5. **Web e2e** — `npx playwright install && npm run test:e2e`.

## Open follow-ups (additive — core is complete)

- **Server-side push send** — ✅ delivery layer done: `sendPushToUser()` in `lib/notifications/push.ts` (Expo Push API, batching, sound/channelId defaults, ticket-level token pruning + `PushReceipt` storage), `pollPushReceipts()` for deferred `DeviceNotRegistered` cleanup, admin endpoints `POST /api/v1/admin/push` (rate-limited) and `POST /api/v1/admin/push/receipts`, SDK `client.admin.sendPush()/pollPushReceipts()`. **Still a product decision:** the *automated* trigger — when to call `sendPushToUser` (in-app notifications are computed, not stored events). **Ops:** schedule `POST /api/v1/admin/push/receipts` on a cron (~every 15–30 min) so dead tokens get pruned.
- **Complete via UI** — no admin UI yet for `/api/v1/admin/ai-usage` (endpoint only).
- **Mobile** — OAuth (expo-auth-session + redirect scheme), offline cache (react-query persistence), custom icon/splash art, reset/verify deep links.
- **a11y audit** — static pass done: `eslint-plugin-jsx-a11y` recommended set is now enabled as **warnings** (`eslint.config.mjs`), surfacing **76** real findings without blocking CI. Breakdown: **70** `label-has-associated-control` (admin form `<label>`s lacking `htmlFor`/nested control), **3** `click-events-have-key-events` + **2** `no-static-element-interactions` + **1** `no-noninteractive-element-interactions` (keyboard gaps on clickable `<div>`s in interview-preview / structure-tree). Two false-positive/intentional cases (CardTitle wrapper, command-palette autofocus) are suppressed inline. **Remaining:** fix the 76 with a visually-verified sweep; dynamic checks (contrast, keyboard flows, screen readers) still need a running app.
- **AiUsageLog** now covers all AI routes; older `recordMeterUsage` (SaaS ledger) is separate — don't conflate.

## Architecture quick-reference

- **API contracts are the source of truth:** `lib/contracts/*` (Zod) → validation (`lib/api/v1/http.ts`), OpenAPI (`lib/api/v1/openapi.ts`, served at `/api/v1/openapi.json`), and the typed client (`lib/api/v1/client.ts`, shared with mobile).
- **Auth:** NextAuth cookie OR Bearer token; resolved in `lib/api/v1/identity.ts` (`requireIdentity`). Middleware `proxy.ts` (Next 16 renamed `middleware.ts`→`proxy.ts`) gates routes; public paths are whitelisted there.
- **Adding a route (the pattern):** contract in `lib/contracts/x.ts` → service in `lib/<domain>/service.ts` (returns DTOs) → thin handler in `app/api/v1/x/route.ts` → SDK method in `client.ts` → register in `openapi.ts` → contract/service test. Each domain = its own green commit.
- **Mobile shares the web layer** via aliases: `@/…` → repo root (`lib/contracts`, `lib/api/v1`), `~/…` → `apps/mobile/src`. Screens are unchanged React components; `apps/mobile/src/navigation.tsx` is a shim mapping `navigate({name})` onto expo-router hrefs. Route tree under `apps/mobile/app/`.

## ⚠️ Constraints in the dev container

- **Mobile (apps/mobile) can't run or typecheck here** — no RN runtime. All mobile work is code-only; verify on device/simulator.
- **`apps/` is excluded from web tooling** (`tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`) — so web `typecheck`/`lint`/`test` do NOT cover mobile code. Don't assume green web checks validate mobile.
- **E2E and full pages need a database**; the Playwright smokes are intentionally DB-independent (health, OpenAPI, unauth redirect).

## Verify everything is still green

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```
