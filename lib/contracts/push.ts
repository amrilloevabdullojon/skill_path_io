import { z } from "zod";

/** Contract for `POST /api/v1/me/push-token`. */

export const RegisterPushTokenSchema = z.object({
  token: z.string().trim().min(1, "token is required").max(500),
  platform: z.enum(["expo", "ios", "android"]).default("expo"),
});
export type RegisterPushTokenInput = z.infer<typeof RegisterPushTokenSchema>;

export const PushTokenResponseSchema = z.object({ ok: z.boolean() });

/** Contract for `POST /api/v1/admin/push` — send a push to one user's devices. */
export const SendPushSchema = z.object({
  userId: z.string().trim().min(1, "userId is required"),
  title: z.string().trim().min(1, "title is required").max(120),
  body: z.string().trim().min(1, "body is required").max(500),
  /** Optional arbitrary payload delivered alongside the notification (e.g. a deep link). */
  data: z.record(z.string(), z.unknown()).optional(),
});
export type SendPushInput = z.infer<typeof SendPushSchema>;

export const SendPushResultSchema = z.object({
  /** Tickets Expo accepted for delivery. */
  sent: z.number().int().nonnegative(),
  /** Tickets Expo rejected (excluding pruned dead tokens). */
  failed: z.number().int().nonnegative(),
  /** Dead tokens removed because the device is no longer registered. */
  removed: z.number().int().nonnegative(),
});
export type SendPushResult = z.infer<typeof SendPushResultSchema>;

/** Result of `POST /api/v1/admin/push/receipts` — reconciling deferred receipts. */
export const PollReceiptsResultSchema = z.object({
  /** Receipts Expo resolved (and we deleted) this run. */
  checked: z.number().int().nonnegative(),
  /** Dead tokens pruned because a receipt reported DeviceNotRegistered. */
  removed: z.number().int().nonnegative(),
  /** Receipts still awaiting a verdict, left for the next run. */
  pending: z.number().int().nonnegative(),
});
export type PollReceiptsResult = z.infer<typeof PollReceiptsResultSchema>;
