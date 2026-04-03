/**
 * Centralized application limits registry.
 *
 * All hardcoded take/skip/page-size values and in-memory size caps live here
 * so they can be tuned in one place — and, when needed, promoted to env vars
 * via the `getServerEnv()` pattern.
 *
 * Convention:
 *   PAGE_*   — server-side pagination page sizes (user-facing lists)
 *   MAX_*    — hard safety caps (unbounded queries, in-memory stores)
 *   RATE_*   — rate-limit defaults (overridable via env vars)
 *   CACHE_*  — cache TTLs in seconds
 *   SSE_*    — Server-Sent Events timing
 */

// ─── Pagination page sizes ────────────────────────────────────────────────────

/** Admin: lessons, modules list pages. */
export const PAGE_SIZE_ADMIN_LIST = 50;

/** Dashboard: learning missions shown to the learner. */
export const PAGE_SIZE_MISSIONS = 24;

/** Dashboard: job postings shown to the learner. */
export const PAGE_SIZE_JOBS = 30;

/** Dashboard: weekly quests shown to the learner. */
export const PAGE_SIZE_WEEKLY_QUESTS = 8;

/** Command palette: missions and jobs combined. */
export const PAGE_SIZE_COMMAND = 60;

/** Community: discussion threads per page. */
export const PAGE_SIZE_DISCUSSIONS = 24;

/** Community: mission submissions per page. */
export const PAGE_SIZE_SUBMISSIONS = 12;

/** Marketplace: job postings per page. */
export const PAGE_SIZE_MARKETPLACE_JOBS = 40;

/** Notes / bookmarks API: maximum records returned per call. */
export const PAGE_SIZE_NOTES_BOOKMARKS = 120;

/** Admin activity log page: records shown in the UI. */
export const PAGE_SIZE_ACTIVITY_LOG = 100;

// ─── Hard safety caps ────────────────────────────────────────────────────────

/**
 * Leaderboard: maximum users fetched for ranking.
 * Prevents full-table scans as the user base grows.
 */
export const MAX_LEADERBOARD_USERS = 200;

/**
 * Knowledge graph: maximum edges returned in a single GET.
 * The graph is rendered client-side; beyond this the browser struggles anyway.
 */
export const MAX_KNOWLEDGE_GRAPH_EDGES = 2000;

/**
 * Admin CSV export: maximum activity log rows per download.
 * Use date filtering to get older data in multiple batches.
 */
export const MAX_EXPORT_ACTIVITY_ROWS = 10_000;

/**
 * Admin CSV export: maximum user rows per download.
 * Set to a high but finite value — avoids unbounded full-table scans.
 */
export const MAX_EXPORT_USER_ROWS = 50_000;

/**
 * In-memory rate-limit store: maximum number of buckets before cleanup runs.
 * At 1000 concurrent users × a few routes each this stays well under 5 k.
 */
export const MAX_RATE_LIMIT_STORE_ENTRIES = 5_000;

/**
 * In-memory usage-ledger store: maximum number of buckets before cleanup.
 * Each bucket is `userId:meter:window:windowKey` — grows with DAU × meter count.
 */
export const MAX_USAGE_LEDGER_ENTRIES = 5_000;

/** Number of oldest usage-ledger entries pruned in a single cleanup pass. */
export const USAGE_LEDGER_CLEANUP_BATCH = 1_000;

/**
 * Marketplace applications stored in-memory.
 * Once the threshold is reached the oldest entries are evicted (FIFO).
 */
export const MAX_MARKETPLACE_APPLICATIONS = 1_000;

// ─── Rate-limit defaults (overridable via env vars) ──────────────────────────

/** AI mentor: requests per window per IP. */
export const RATE_MENTOR_MAX_REQUESTS = 20;
export const RATE_MENTOR_WINDOW_MS = 60_000;

/** Admin AI generation: requests per window per IP. */
export const RATE_ADMIN_AI_MAX_REQUESTS = 30;
export const RATE_ADMIN_AI_WINDOW_MS = 60_000;

// ─── Cache TTLs ───────────────────────────────────────────────────────────────

/**
 * Course catalog (tracks + modules) is essentially static between deployments.
 * Cache for 60 s to absorb burst traffic without hammering the DB.
 * Tag: "catalog" — can be invalidated on track/module mutations.
 */
export const CACHE_TTL_CATALOG_S = 60;

// ─── SSE timing ───────────────────────────────────────────────────────────────

/** How often the SSE notification stream polls the DB. */
export const SSE_POLL_INTERVAL_MS = 15_000;

/** Maximum SSE connection lifetime before asking the client to reconnect. */
export const SSE_MAX_DURATION_MS = 55_000;
