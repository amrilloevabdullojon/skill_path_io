import { z } from "zod";

/** Contracts for `/api/v1/auth/*` account recovery + verification flows. */

export const RequestPasswordResetSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});
export type RequestPasswordReset = z.infer<typeof RequestPasswordResetSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "token is required"),
  password: z.string().min(8, "password must be at least 8 characters").max(200),
});
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, "token is required"),
});
export type VerifyEmail = z.infer<typeof VerifyEmailSchema>;

export const OkResponseSchema = z.object({ ok: z.boolean() });
export type OkResponse = z.infer<typeof OkResponseSchema>;
