/**
 * Rate-limiting infrastructure.
 *
 * Architecture: thin adapter interface so the storage backend can be swapped
 * without touching call sites.
 *
 *   Current default → InMemoryRateLimiterAdapter  (single-process, dev/MVP)
 *   Drop-in upgrade → RedisRateLimiterAdapter     (see comment below)
 *
 * To plug in Redis:
 *   1. Install `ioredis` and create RedisRateLimiterAdapter implementing RateLimiterAdapter.
 *   2. Replace `defaultAdapter` below with `new RedisRateLimiterAdapter(redisClient)`.
 *   3. No changes required at call sites.
 */

import { MAX_RATE_LIMIT_STORE_ENTRIES } from "@/lib/config/limits";

// ─── Public types ─────────────────────────────────────────────────────────────

export type RateLimitOptions = {
  key: string;
  maxRequests: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
};

// ─── Adapter interface ────────────────────────────────────────────────────────

/**
 * Implement this interface to swap the rate-limit storage backend.
 * The contract is identical to the original `applyRateLimit` signature so
 * existing call sites require zero changes.
 */
export interface RateLimiterAdapter {
  check(options: RateLimitOptions): RateLimitResult | Promise<RateLimitResult>;
}

// ─── In-memory adapter (default) ─────────────────────────────────────────────

type Bucket = {
  count: number;
  resetAt: number;
};

declare global {
  var skillPathRateLimitStore: Map<string, Bucket> | undefined;
}

class InMemoryRateLimiterAdapter implements RateLimiterAdapter {
  private readonly store: Map<string, Bucket>;

  constructor() {
    // Reuse the global map across hot-reloads in Next.js dev mode so the
    // in-process state survives module re-evaluation.
    if (!global.skillPathRateLimitStore) {
      global.skillPathRateLimitStore = new Map<string, Bucket>();
    }
    this.store = global.skillPathRateLimitStore;
  }

  private cleanup(now: number): void {
    for (const [key, bucket] of this.store.entries()) {
      if (bucket.resetAt <= now) {
        this.store.delete(key);
      }
    }
  }

  check({ key, maxRequests, windowMs }: RateLimitOptions): RateLimitResult {
    const now = Date.now();

    // Prune expired buckets when the store grows large.
    if (this.store.size > MAX_RATE_LIMIT_STORE_ENTRIES) {
      this.cleanup(now);
    }

    const current = this.store.get(key);

    // New window or expired window → start fresh.
    if (!current || current.resetAt <= now) {
      const resetAt = now + windowMs;
      this.store.set(key, { count: 1, resetAt });
      return {
        allowed: true,
        limit: maxRequests,
        remaining: Math.max(maxRequests - 1, 0),
        resetAt,
        retryAfterMs: 0,
      };
    }

    // Over the limit.
    if (current.count >= maxRequests) {
      return {
        allowed: false,
        limit: maxRequests,
        remaining: 0,
        resetAt: current.resetAt,
        retryAfterMs: Math.max(current.resetAt - now, 0),
      };
    }

    // Increment within the current window.
    current.count += 1;
    this.store.set(key, current);

    return {
      allowed: true,
      limit: maxRequests,
      remaining: Math.max(maxRequests - current.count, 0),
      resetAt: current.resetAt,
      retryAfterMs: 0,
    };
  }
}

// ─── Upstash Redis adapter (distributed, multi-instance) ─────────────────────

/**
 * Fixed-window counter via a single atomic Upstash REST EVAL.
 * Falls open to the in-memory adapter if Redis is unreachable, so a Redis
 * outage degrades to per-instance limiting rather than blocking all traffic.
 */
class UpstashRateLimiterAdapter implements RateLimiterAdapter {
  // INCR the key; set the window TTL on first hit; report count + remaining TTL.
  private static readonly SCRIPT =
    'local c = redis.call("INCR", KEYS[1]) ' +
    'if c == 1 then redis.call("PEXPIRE", KEYS[1], ARGV[1]) end ' +
    'local t = redis.call("PTTL", KEYS[1]) return {c, t}';

  constructor(
    private readonly url: string,
    private readonly token: string,
    private readonly fallback: RateLimiterAdapter,
  ) {}

  async check(options: RateLimitOptions): Promise<RateLimitResult> {
    const { key, maxRequests, windowMs } = options;
    const now = Date.now();
    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
        body: JSON.stringify([
          "EVAL",
          UpstashRateLimiterAdapter.SCRIPT,
          "1",
          key,
          String(windowMs),
        ]),
      });
      if (!response.ok) throw new Error(`Upstash ${response.status}`);
      const data = (await response.json()) as { result: [number, number] };
      const [count, ttl] = data.result;
      const resetAt = now + (ttl > 0 ? ttl : windowMs);
      const allowed = count <= maxRequests;
      return {
        allowed,
        limit: maxRequests,
        remaining: Math.max(maxRequests - count, 0),
        resetAt,
        retryAfterMs: allowed ? 0 : Math.max(resetAt - now, 0),
      };
    } catch {
      return this.fallback.check(options);
    }
  }
}

// ─── Active adapter (Redis when configured, else in-memory) ──────────────────

const inMemoryAdapter = new InMemoryRateLimiterAdapter();

export const rateLimiterAdapter: RateLimiterAdapter =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new UpstashRateLimiterAdapter(
        process.env.UPSTASH_REDIS_REST_URL,
        process.env.UPSTASH_REDIS_REST_TOKEN,
        inMemoryAdapter,
      )
    : inMemoryAdapter;

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Apply a rate limit check for the given key. Async to support a distributed
 * backend; resolves immediately for the in-memory adapter.
 */
export async function applyRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  return rateLimiterAdapter.check(options);
}
