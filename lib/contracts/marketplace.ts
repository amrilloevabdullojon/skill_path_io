import { z } from "zod";

/** Contract for `POST /api/v1/marketplace/apply`. */

export const RoleApplicationSchema = z.object({
  id: z.string(),
  roleId: z.string(),
  candidateUserId: z.string(),
  portfolioUrl: z.string(),
  createdAt: z.string(),
  status: z.enum(["SUBMITTED", "REVIEWING", "SHORTLISTED"]),
});

export const ApplyRequestSchema = z.object({
  roleId: z.string().min(1, "roleId is required"),
  portfolioUrl: z.string().trim().min(1, "portfolioUrl is required").max(500),
});
export type ApplyRequest = z.infer<typeof ApplyRequestSchema>;

export const ApplyResponseSchema = z.object({
  application: RoleApplicationSchema,
});
