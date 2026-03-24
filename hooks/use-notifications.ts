"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { NotificationItem } from "@/types/saas";

type NotificationState = {
  notifications: NotificationItem[];
  unreadCount: number;
  isConnected: boolean;
};

const RECONNECT_DELAY_MS = 3_000;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Hook that streams real-time notifications via SSE.
 *
 * Falls back to a single REST fetch when SSE is not available.
 */
export function useNotifications(): NotificationState & {
  markAllRead: () => void;
  refresh: () => void;
} {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource("/api/notifications/stream");
    eventSourceRef.current = es;

    es.addEventListener("notifications", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as { notifications: NotificationItem[] };
        setNotifications(data.notifications ?? []);
        setIsConnected(true);
        reconnectAttempts.current = 0;
      } catch {
        // Malformed payload — ignore
      }
    });

    es.addEventListener("close", () => {
      es.close();
      scheduleReconnect();
    });

    es.onerror = () => {
      setIsConnected(false);
      es.close();
      scheduleReconnect();
    };
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      // Fall back to REST
      fetchOnce();
      return;
    }
    reconnectAttempts.current += 1;
    const delay = RECONNECT_DELAY_MS * reconnectAttempts.current;
    reconnectTimer.current = setTimeout(connect, delay);
  }, [connect]);

  const fetchOnce = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = (await res.json()) as { notifications: NotificationItem[] };
        setNotifications(data.notifications ?? []);
      }
    } catch {
      // Silently ignore
    }
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const refresh = useCallback(() => {
    fetchOnce();
  }, [fetchOnce]);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connect]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount, isConnected, markAllRead, refresh };
}
