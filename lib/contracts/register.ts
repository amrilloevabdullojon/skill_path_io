import { z } from "zod";

/** Contract for `POST /api/v1/auth/register`. */

export const RegisterRequestSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "password must be at least 8 characters").max(200),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const RegisterResultSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.enum(["ADMIN", "STUDENT", "PRO_STUDENT", "MENTOR", "RECRUITER"]),
  }),
});
export type RegisterResult = z.infer<typeof RegisterResultSchema>;
