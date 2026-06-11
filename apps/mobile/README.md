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
# Align native module versions with the installed Expo SDK (recommended — this
# rewrites the expo-router / react-native-* versions in package.json to the
# exact SDK-compatible ones):
npx expo install expo-router react-native-safe-area-context react-native-screens \
  expo-linking expo-constants react-native-gesture-handler expo-secure-store

# Point the app at your running web API (defaults to http://localhost:3000).
# On a physical device, use your machine's LAN IP, not localhost:
export EXPO_PUBLIC_API_URL="http://192.168.x.x:3000"

npm run ios      # or: npm run android / npm run web
```

The web API must be running (`npm run dev` in the repo root) with demo mode
enabled so the demo login works: `student@levio.local` / `local`.

## Navigation (expo-router)

Routing is file-based under `app/` (entry is `expo-router/entry`):

```
app/_layout.tsx                  AuthProvider + Stack
app/index.tsx                    gate → /login, /onboarding, or /tracks
app/(auth)/                      login, register, forgot-password (redirects out when authed)
app/onboarding.tsx
app/(app)/_layout.tsx            auth guard
app/(app)/tracks/index.tsx       catalog
app/(app)/tracks/[slug]/         track detail
  .../modules/[moduleId]/        module detail
    quiz.tsx                     quiz
    missions/[missionId].tsx     mission
app/(app)/profile.tsx · bookmarks.tsx
```

Route files are thin wrappers that read params via `useLocalSearchParams` and
render the screen components in `src/screens/`. Those screens are unchanged: they
still call `useNavigation()` from `src/navigation.tsx`, which is now a shim that
maps the old `navigate({ name, ... })` calls onto expo-router hrefs.

Imports use two aliases: `@/…` → repo root (shared `lib/contracts`, `lib/api/v1`)
and `~/…` → `apps/mobile/src`.

> ⚠️ This expo-router migration was written without a local RN run. Verify it
> boots and navigates on a simulator/device, and run `npx expo install` to lock
> SDK-correct native versions before building.

## Next

- Native: push notifications, offline cache (Phase 3C), EAS store builds (3D).
- Mobile OAuth (expo-auth-session) and reset/verify deep links.
