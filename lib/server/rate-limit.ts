type RateLimitOptions = {
  key: string;
  maxRequests: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var skillPathRateLimitStore: Map<string, Bucket> | undefined;
}

const store = global.skillPathRateLimitStore ?? new Map<string, Bucket>();

if (!global.skillPathRateLimitStore) {
  global.skillPathRateLimitStore = store;
}

function cleanup(now: number) {
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function applyRateLimit({ key, maxRequests, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();

  // Keep in-memory state small in long-running local dev sessions.
  if (store.size > 5000) {
    cleanup(now);
  }

  const current = store.get(key);
  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit: maxRequests,
      remaining: Math.max(maxRequests - 1, 0),
      resetAt,
      retryAfterMs: 0,
    };
  }

  if (current.count >= maxRequests) {
    const retryAfterMs = Math.max(current.resetAt - now, 0);
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfterMs,
    };
  }

  current.count += 1;
  store.set(key, current);

  return {
    allowed: true,
    limit: maxRequests,
    remaining: Math.max(maxRequests - current.count, 0),
    resetAt: current.resetAt,
    retryAfterMs: 0,
  };
}
