# Levio Mobile (Expo)

Native iOS/Android client for Levio, built with Expo (SDK 56, React Native 0.85).
It consumes the web project's versioned `/api/v1` API through the **shared, typed
client SDK** (`lib/api/v1/client.ts`) — no duplicated request/response types.

## How code is shared with the web app

The mobile app reuses the web project's portable API layer directly:

- `lib/contracts/*` — Zod request/response schemas (single source of truth)
- `lib/api/v1/client.ts` — the typed client SDK

These are imported via the same `@/...` alias the web app uses:

- `babel.config.js` rewrites `@/...` to the repo root at transform time
  (`babel-plugin-module-resolver`).
- `metro.config.js` adds the repo root `lib/` and `types/` to metro's
  `watchFolders` so the bundler can read them.
- `tsconfig.json` maps `@/*` to `../../*` for type checking.

The shared layer is guaranteed free of `next/*` runtime imports by a portability
guard test in the web project (`lib/api/v1/__tests__/portability.test.ts`).

## Run it

```bash
cd apps/mobile
npm install
# Align native module versions with the Expo SDK:
npx expo install expo-secure-store

# Point the app at your running web API (defaults to http://localhost:3000).
# On a physical device, use your machine's LAN IP, not localhost:
export EXPO_PUBLIC_API_URL="http://192.168.x.x:3000"

npm run ios      # or: npm run android / npm run web
```

The web API must be running (`npm run dev` in the repo root) with demo mode
enabled so the demo login works: `student@levio.local` / `local`.

## What's implemented

- Token auth against `/api/v1/auth/*` (access + refresh) with secure-store
  persistence and transparent refresh-on-401 (`src/api.ts`).
- Login screen → Tracks catalog screen, wired end-to-end through the SDK.

## Next

- Add `expo-router` navigation and the remaining screens (track detail, module,
  quiz, mission, portfolio).
- Migrate the API routes each new screen needs onto `/api/v1` (demand-driven),
  following the `tracks` / `bookmarks` reference slices.
- Push notifications, offline cache, store builds (EAS).
