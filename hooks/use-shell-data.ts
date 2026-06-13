"use client";

import { useEffect, useState } from "react";

import { touchUserStreakAction } from "@/app/actions/streak";

type ShellData = {
  notificationCount: number;
  streakCount: number | null;
};

const TTL_MS = 90_000;

const cache: { data: ShellData; ts: number } | null = (globalThis as { __shellDataCache?: { data: ShellData; ts: number } | null }).__shellDataCache ?? null;
function readCache() {
  return (globalThis as { __shellDataCache?: { data: ShellData; ts: number } | null }).__shellDataCache ?? cache;
}
function writeCache(data: ShellData) {
  (globalThis as { __shellDataCache?: { data: ShellData; ts: number } | null }).__shellDataCache = { data, ts: Date.now() };
}

let inFlight: Promise<ShellData> | null = null;

async function fetchNotificationCount(): Promise<number> {
  try {
    const response = await fetch("/api/notifications");
    if (!response.ok) return 0;
    const data = (await response.json()) as { notifications?: Array<{ id: string }> };
    return Array.isArray(data.notifications) ? data.notifications.length : 0;
  } catch {
    return 0;
  }
}

async function fetchShellData(isAuthenticated: boolean): Promise<ShellData> {
  const [notificationCount, streakResult] = await Promise.all([
    fetchNotificationCount(),
    isAuthenticated
      ? touchUserStreakAction(new Date().getTimezoneOffset()).catch(() => null)
      : Promise.resolve(null),
  ]);

  const streakCount =
    streakResult && streakResult.success && typeof streakResult.streak === "number"
      ? streakResult.streak
      : null;

  return { notificationCount, streakCount };
}

/**
 * Cached shell data (notifications + streak) with TTL and in-flight de-duplication.
 * Avoids the previous behavior of re-fetching both on every AppShell mount + visibilitychange.
 */
export function useShellData(isAuthenticated: boolean) {
  const [data, setData] = useState<ShellData>(() => readCache()?.data ?? { notificationCount: 0, streakCount: null });

  useEffect(() => {
    let mounted = true;

    async function refresh(force = false) {
      const cached = readCache();
      const fresh = cached && Date.now() - cached.ts < TTL_MS;
      if (fresh && !force) {
        if (mounted) setData(cached.data);
        return;
      }

      if (!inFlight) {
        inFlight = fetchShellData(isAuthenticated).finally(() => {
          inFlight = null;
        });
      }
      const result = await inFlight;
      writeCache(result);
      if (mounted) setData(result);
    }

    void refresh();

    function onVisibility() {
      if (document.visibilityState === "visible") {
        void refresh(true);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isAuthenticated]);

  return data;
}
