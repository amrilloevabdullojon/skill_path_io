import { z } from "zod";

/**
 * Contract for `/api/v1/auth/*` — token-based authentication for API clients.
 * Zod schemas are the single source of truth for request/response shapes.
 */

const AppRoleSchema = z.enum(["ADMIN", "STUDENT", "PRO_STUDENT", "MENTOR", "RECRUITER"]);

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RefreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshRequest = z.infer<typeof RefreshRequestSchema>;

export const TokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.literal("Bearer"),
  expiresIn: z.number().int().positive(),
});
export type TokenPairResponse = z.infer<typeof TokenPairSchema>;

export const SessionUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: AppRoleSchema,
});

export const MeResponseSchema = z.object({
  user: SessionUserSchema,
});
export type MeResponse = z.infer<typeof MeResponseSchema>;
