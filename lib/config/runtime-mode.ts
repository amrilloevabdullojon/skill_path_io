/**
 * Demo-mode flag.
 *
 * Demo mode enables in-browser login without real credentials, seed-data
 * fallbacks, and relaxed validation.  It must be EXPLICITLY enabled — the
 * default is always OFF so staging and production environments are safe even
 * when no env var is set.
 *
 * Set ENABLE_DEMO_MODE=true  (server-side only, e.g. .env.local)
 * Set NEXT_PUBLIC_ENABLE_DEMO_MODE=true  (client components reading the flag)
 *
 * IMPORTANT: never rely on NODE_ENV as a proxy for demo mode.  A CI build
 * or Docker image built with NODE_ENV=development would otherwise silently
 * activate demo mode in production.
 */
export function isDemoModeEnabled(): boolean {
  const serverFlag = process.env.ENABLE_DEMO_MODE;
  if (serverFlag === "true") return true;
  if (serverFlag === "false") return false;

  const clientFlag = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE;
  if (clientFlag === "true") return true;
  if (clientFlag === "false") return false;

  // Default: OFF.  Must be explicitly enabled.
  return false;
}
