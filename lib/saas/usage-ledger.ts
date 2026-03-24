import { MeterUsageCheck, UsageLimit, UsageMeter, UsageSnapshot, UsageWindow } from "@/types/saas";

type UsageBucket = {
  count: number;
  touchedAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var skillPathUsageLedger: Map<string, UsageBucket> | undefined;
}

const ledger = global.skillPathUsageLedger ?? new Map<string, UsageBucket>();

if (!global.skillPathUsageLedger) {
  global.skillPathUsageLedger = ledger;
}

function windowKey(window: UsageWindow, now = new Date()) {
  if (window === "DAILY") {
    return now.toISOString().slice(0, 10);
  }

  if (window === "WEEKLY") {
    const copy = new Date(now);
    const day = copy.getUTCDay();
    copy.setUTCDate(copy.getUTCDate() - day);
    return copy.toISOString().slice(0, 10);
  }

  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function bucketId(userId: string, meter: UsageMeter, window: UsageWindow, now = new Date()) {
  return `${userId}:${meter}:${window}:${windowKey(window, now)}`;
}

function cleanup(maxEntries = 5000) {
  if (ledger.size < maxEntries) {
    return;
  }

  const oldest = [...ledger.entries()].sort((a, b) => a[1].touchedAt - b[1].touchedAt).slice(0, 1000);
  for (const [key] of oldest) {
    ledger.delete(key);
  }
}

export function incrementUsage(userId: string, meter: UsageMeter, window: UsageWindow, amount = 1) {
  cleanup();
  const key = bucketId(userId, meter, window);
  const current = ledger.get(key);

  if (!current) {
    ledger.set(key, {
      count: Math.max(amount, 0),
      touchedAt: Date.now(),
    });
    return;
  }

  current.count += Math.max(amount, 0);
  current.touchedAt = Date.now();
  ledger.set(key, current);
}

export function getUsageCount(userId: string, meter: UsageMeter, window: UsageWindow) {
  const key = bucketId(userId, meter, window);
  return ledger.get(key)?.count ?? 0;
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
