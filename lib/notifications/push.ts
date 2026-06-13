import "server-only";

import { prisma } from "@/lib/prisma";
import type { PollReceiptsResult, SendPushResult } from "@/lib/contracts/push";

/**
 * Server-side Expo push delivery.
 *
 * Posts to the Expo Push API (https://exp.host/--/api/v2/push/send), which is
 * free and needs no key; an optional `EXPO_ACCESS_TOKEN` is sent when present
 * (required only for accounts with "enhanced security"). When no tokens exist
 * for a user the call is a no-op, so this is inert until devices register.
 *
 * Two-phase error handling, matching Expo's model:
 *  1. `sendPushToUser` reads the synchronous *tickets* — it prunes tokens Expo
 *     rejects immediately and stores a `PushReceipt` for each accepted ticket.
 *  2. `pollPushReceipts` later reads the asynchronous *receipts* (where
 *     `DeviceNotRegistered` and most deferred failures actually surface) and
 *     prunes those dead tokens too.
 */

const EXPO_SEND_ENDPOINT = "https://exp.host/--/api/v2/push/send";
const EXPO_RECEIPTS_ENDPOINT = "https://exp.host/--/api/v2/push/getReceipts";
/** Expo accepts at most 100 messages per send request. */
const EXPO_SEND_BATCH_SIZE = 100;
/** Expo accepts at most 1000 receipt ids per getReceipts request. */
const EXPO_RECEIPTS_BATCH_SIZE = 1000;
/** Expo asks callers to wait before polling; receipts are kept ~24h on their side. */
const DEFAULT_RECEIPT_MIN_AGE_MS = 15 * 60 * 1000;

export type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

/** Outgoing message: payload plus delivery defaults that make it surface on-device. */
type ExpoMessage = ExpoOutgoingDefaults & PushPayload & { to: string };
type ExpoOutgoingDefaults = {
  sound: "default";
  priority: "high";
  channelId: string;
};

/** A send ticket: `ok` carries a receipt `id`; `error` carries `details.error`. */
type ExpoTicket = {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
};

/** A receipt resolves a previously accepted ticket. */
type ExpoReceipt = {
  status: "ok" | "error";
  message?: string;
  details?: { error?: string };
};

/** Light validation mirroring Expo's own `isExpoPushToken`. */
function isExpoPushToken(token: string): boolean {
  return token.startsWith("ExponentPushToken[") || token.startsWith("ExpoPushToken[");
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const accessToken = process.env.EXPO_ACCESS_TOKEN;
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

function logPushWarning(message: string, error?: unknown): void {
  console.warn(`[push] ${message}`, error ?? "");
  if (process.env.SENTRY_DSN) {
    void import("@sentry/nextjs")
      .then((Sentry) => Sentry.captureMessage(`[push] ${message}`, "warning"))
      .catch(() => {});
  }
}

const OUTGOING_DEFAULTS: ExpoOutgoingDefaults = {
  sound: "default", // iOS plays no sound without this
  priority: "high", // Android heads-up delivery
  channelId: "default", // Android 8+ requires a channel; the app registers "default"
};

/**
 * Send one payload to a set of Expo tokens. Returns per-token tickets in the
 * same order as the input tokens (Expo guarantees positional correspondence).
 */
async function postSend(tokens: string[], payload: PushPayload): Promise<ExpoTicket[]> {
  const tickets: ExpoTicket[] = [];

  for (let i = 0; i < tokens.length; i += EXPO_SEND_BATCH_SIZE) {
    const batch = tokens.slice(i, i + EXPO_SEND_BATCH_SIZE);
    const messages: ExpoMessage[] = batch.map((to) => ({ to, ...OUTGOING_DEFAULTS, ...payload }));

    try {
      const response = await fetch(EXPO_SEND_ENDPOINT, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(messages),
      });
      const json = (await response.json().catch(() => null)) as { data?: ExpoTicket[] } | null;
      const data = json?.data;
      if (Array.isArray(data) && data.length === batch.length) {
        tickets.push(...data);
      } else {
        // Malformed response or transport-level failure: count the whole batch as failed.
        logPushWarning(`send batch returned an unexpected response (status ${response.status})`);
        tickets.push(...batch.map(() => ({ status: "error" as const })));
      }
    } catch (error) {
      logPushWarning("send batch threw a transport error", error);
      tickets.push(...batch.map(() => ({ status: "error" as const })));
    }
  }

  return tickets;
}

/**
 * Send a push notification to every device registered for `userId`.
 *
 * Prunes tokens Expo rejects in the synchronous ticket, and records a
 * `PushReceipt` for each accepted ticket so deferred failures can be reconciled
 * later by {@link pollPushReceipts}. Sending to a user with no tokens yields
 * all-zero counts.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<SendPushResult> {
  const rows = await prisma.pushToken.findMany({
    where: { userId },
    select: { token: true },
  });

  const tokens = rows.map((r) => r.token).filter(isExpoPushToken);
  if (tokens.length === 0) {
    return { sent: 0, failed: 0, removed: 0 };
  }

  const tickets = await postSend(tokens, payload);

  let sent = 0;
  let failed = 0;
  const deadTokens: string[] = [];
  const receipts: { id: string; token: string }[] = [];

  tickets.forEach((ticket, index) => {
    if (ticket.status === "ok") {
      sent += 1;
      if (ticket.id) receipts.push({ id: ticket.id, token: tokens[index] });
      return;
    }
    if (ticket.details?.error === "DeviceNotRegistered") {
      deadTokens.push(tokens[index]);
    } else {
      failed += 1;
    }
  });

  let removed = 0;
  if (deadTokens.length > 0) {
    const result = await prisma.pushToken.deleteMany({ where: { token: { in: deadTokens } } });
    removed = result.count;
  }

  if (receipts.length > 0) {
    await prisma.pushReceipt.createMany({ data: receipts, skipDuplicates: true });
  }

  return { sent, failed, removed };
}

async function postReceipts(ids: string[]): Promise<Record<string, ExpoReceipt> | null> {
  try {
    const response = await fetch(EXPO_RECEIPTS_ENDPOINT, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ ids }),
    });
    const json = (await response.json().catch(() => null)) as {
      data?: Record<string, ExpoReceipt>;
    } | null;
    if (!json?.data) {
      logPushWarning(`getReceipts returned an unexpected response (status ${response.status})`);
      return null;
    }
    return json.data;
  } catch (error) {
    logPushWarning("getReceipts threw a transport error", error);
    return null;
  }
}

/**
 * Reconcile pending push receipts with Expo.
 *
 * Reads stored `PushReceipt` rows older than `minAgeMs` (Expo asks callers to
 * wait before polling), asks Expo for their status, prunes tokens reported as
 * `DeviceNotRegistered`, and deletes every receipt Expo resolved. Receipts not
 * yet available are left for the next run. Safe to call repeatedly (cron/admin).
 */
export async function pollPushReceipts(
  options: { minAgeMs?: number; limit?: number } = {},
): Promise<PollReceiptsResult> {
  const minAgeMs = options.minAgeMs ?? DEFAULT_RECEIPT_MIN_AGE_MS;
  const limit = Math.min(options.limit ?? EXPO_RECEIPTS_BATCH_SIZE, EXPO_RECEIPTS_BATCH_SIZE);
  const cutoff = new Date(Date.now() - minAgeMs);

  const pending = await prisma.pushReceipt.findMany({
    where: { createdAt: { lte: cutoff } },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { id: true, token: true },
  });

  if (pending.length === 0) {
    return { checked: 0, removed: 0, pending: 0 };
  }

  const tokenByReceiptId = new Map(pending.map((r) => [r.id, r.token]));
  const data = await postReceipts(pending.map((r) => r.id));
  if (!data) {
    return { checked: 0, removed: 0, pending: pending.length };
  }

  const resolvedIds: string[] = [];
  const deadTokens = new Set<string>();

  for (const [receiptId, receipt] of Object.entries(data)) {
    resolvedIds.push(receiptId);
    if (receipt.status === "error" && receipt.details?.error === "DeviceNotRegistered") {
      const token = tokenByReceiptId.get(receiptId);
      if (token) deadTokens.add(token);
    }
  }

  let removed = 0;
  if (deadTokens.size > 0) {
    const result = await prisma.pushToken.deleteMany({
      where: { token: { in: [...deadTokens] } },
    });
    removed = result.count;
  }

  if (resolvedIds.length > 0) {
    await prisma.pushReceipt.deleteMany({ where: { id: { in: resolvedIds } } });
  }

  return {
    checked: resolvedIds.length,
    removed,
    pending: pending.length - resolvedIds.length,
  };
}
