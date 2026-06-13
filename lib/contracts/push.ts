import { z } from "zod";

/** Contract for `POST /api/v1/me/push-token`. */

export const RegisterPushTokenSchema = z.object({
  token: z.string().trim().min(1, "token is required").max(500),
  platform: z.enum(["expo", "ios", "android"]).default("expo"),
});
export type RegisterPushTokenInput = z.infer<typeof RegisterPushTokenSchema>;

export const PushTokenResponseSchema = z.object({ ok: z.boolean() });
