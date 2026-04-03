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
  check(options: RateLimitOptions): RateLimitResult;
}

// ─── In-memory adapter (default) ─────────────────────────────────────────────

type Bucket = {
  count: number;
  resetAt: number;
};

declare global {
  // eslint-disable-next-line no-var
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

// ─── Active adapter (swap here to change backend) ────────────────────────────

/**
 * The active rate-limiter backend.
 * Replace with `new RedisRateLimiterAdapter(redisClient)` to enable
 * distributed rate limiting across multiple Node processes.
 */
export const rateLimiterAdapter: RateLimiterAdapter = new InMemoryRateLimiterAdapter();

// ─── Public API (unchanged signature — zero call-site changes needed) ─────────

/**
 * Apply a rate limit check for the given key.
 * Delegates to `rateLimiterAdapter` so the backend is swappable.
 */
export function applyRateLimit(options: RateLimitOptions): RateLimitResult {
  return rateLimiterAdapter.check(options);
}
