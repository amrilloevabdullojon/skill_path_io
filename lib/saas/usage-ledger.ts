/**
 * SaaS usage metering ledger.
 *
 * Architecture: thin adapter interface — the same swap-ready pattern as
 * rate-limit.ts.  Changing the storage backend requires only replacing
 * `usageLedgerAdapter` below; call sites are untouched.
 *
 *   Current default → InMemoryUsageLedgerAdapter   (single-process, dev/MVP)
 *   Drop-in upgrade → RedisUsageLedgerAdapter       (distributed, persistent)
 *
 * To plug in Redis:
 *   1. Create RedisUsageLedgerAdapter implementing UsageLedgerAdapter.
 *   2. Replace `usageLedgerAdapter` below with the Redis instance.
 *   3. No call-site changes required.
 */

import {
  MAX_USAGE_LEDGER_ENTRIES,
  USAGE_LEDGER_CLEANUP_BATCH,
} from "@/lib/config/limits";
import { MeterUsageCheck, UsageLimit, UsageMeter, UsageSnapshot, UsageWindow } from "@/types/saas";

// ─── Adapter interface ────────────────────────────────────────────────────────

export interface UsageLedgerAdapter {
  increment(userId: string, meter: UsageMeter, window: UsageWindow, amount?: number): void;
  getCount(userId: string, meter: UsageMeter, window: UsageWindow): number;
}

// ─── Window-key helpers (shared logic, not storage-specific) ─────────────────

function windowKey(window: UsageWindow, now = new Date()): string {
  if (window === "DAILY") {
    return now.toISOString().slice(0, 10);
  }

  if (window === "WEEKLY") {
    const copy = new Date(now);
    const day = copy.getUTCDay();
    copy.setUTCDate(copy.getUTCDate() - day);
    return copy.toISOString().slice(0, 10);
  }

  // MONTHLY
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function bucketId(userId: string, meter: UsageMeter, window: UsageWindow, now = new Date()): string {
  return `${userId}:${meter}:${window}:${windowKey(window, now)}`;
}

// ─── In-memory adapter (default) ─────────────────────────────────────────────

type UsageBucket = {
  count: number;
  touchedAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var skillPathUsageLedger: Map<string, UsageBucket> | undefined;
}

class InMemoryUsageLedgerAdapter implements UsageLedgerAdapter {
  private readonly ledger: Map<string, UsageBucket>;

  constructor() {
    if (!global.skillPathUsageLedger) {
      global.skillPathUsageLedger = new Map<string, UsageBucket>();
    }
    this.ledger = global.skillPathUsageLedger;
  }

  private cleanup(): void {
    if (this.ledger.size < MAX_USAGE_LEDGER_ENTRIES) {
      return;
    }

    // Evict the oldest USAGE_LEDGER_CLEANUP_BATCH entries by touchedAt.
    const oldest = [...this.ledger.entries()]
      .sort((a, b) => a[1].touchedAt - b[1].touchedAt)
      .slice(0, USAGE_LEDGER_CLEANUP_BATCH);

    for (const [key] of oldest) {
      this.ledger.delete(key);
    }
  }

  increment(userId: string, meter: UsageMeter, window: UsageWindow, amount = 1): void {
    this.cleanup();
    const key = bucketId(userId, meter, window);
    const current = this.ledger.get(key);

    if (!current) {
      this.ledger.set(key, { count: Math.max(amount, 0), touchedAt: Date.now() });
      return;
    }

    current.count += Math.max(amount, 0);
    current.touchedAt = Date.now();
    this.ledger.set(key, current);
  }

  getCount(userId: string, meter: UsageMeter, window: UsageWindow): number {
    const key = bucketId(userId, meter, window);
    return this.ledger.get(key)?.count ?? 0;
  }
}

// ─── Active adapter (swap here to change backend) ────────────────────────────

/**
 * The active usage-ledger backend.
 * Replace with a Redis adapter to persist counters across restarts and
 * share state between horizontally-scaled Node processes.
 */
export const usageLedgerAdapter: UsageLedgerAdapter = new InMemoryUsageLedgerAdapter();

// ─── Public API (unchanged signatures) ───────────────────────────────────────

export function incrementUsage(userId: string, meter: UsageMeter, window: UsageWindow, amount = 1): void {
  usageLedgerAdapter.increment(userId, meter, window, amount);
}

export function getUsageCount(userId: string, meter: UsageMeter, window: UsageWindow): number {
  return usageLedgerAdapter.getCount(userId, meter, window);
}

export function getUsageSnapshot(userId: string, meters: UsageMeter[], window: UsageWindow): UsageSnapshot {
  return meters.reduce<UsageSnapshot>((acc, meter) => {
    acc[meter] = getUsageCount(userId, meter, window);
    return acc;
  }, {
    aiMentorRequests: 0,
    missionSubmissions: 0,
    interviewSessions: 0,
    jobApplications: 0,
    profileShares: 0,
  });
}

export function evaluateUsageAgainstLimits(userId: string, limits: UsageLimit[]): MeterUsageCheck[] {
  return limits.map((limitItem) => {
    const used = getUsageCount(userId, limitItem.meter, limitItem.window);
    const reached = limitItem.limit !== null && used >= limitItem.limit;

    return {
      meter: limitItem.meter,
      used,
      limit: limitItem.limit,
      remaining: limitItem.limit === null ? null : Math.max(limitItem.limit - used, 0),
      window: limitItem.window,
      reached,
    };
  });
}
