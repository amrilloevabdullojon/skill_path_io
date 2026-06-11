import { z } from "zod";

/** Contract for `/api/v1/portfolio` and `/api/v1/portfolio/projects`. */

export const PortfolioProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  skillsUsed: z.array(z.string()),
  source: z.string(),
  sourceRef: z.string(),
  resultSummary: z.string(),
  isPublic: z.boolean(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PortfolioProject = z.infer<typeof PortfolioProjectSchema>;

export const PortfolioSchema = z.object({
  id: z.string(),
  headline: z.string(),
  summary: z.string(),
  isPublic: z.boolean(),
  publicSlug: z.string().nullable(),
  projects: z.array(PortfolioProjectSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Portfolio = z.infer<typeof PortfolioSchema>;

export const PortfolioResponseSchema = z.object({ portfolio: PortfolioSchema });

export const UpdatePortfolioSchema = z.object({
  headline: z.string().trim().max(200).optional(),
  summary: z.string().trim().max(5_000).optional(),
  isPublic: z.boolean().optional(),
  publicSlug: z
    .string()
    .trim()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "slug may contain lowercase letters, digits and hyphens")
    .nullable()
    .optional(),
});
export type UpdatePortfolioInput = z.infer<typeof UpdatePortfolioSchema>;

export const CreateProjectSchema = z.object({
  title: z.string().trim().min(1, "title is required").max(200),
  description: z.string().trim().max(5_000).default(""),
  skillsUsed: z.array(z.string().trim().min(1)).max(20).default([]),
  source: z.string().trim().max(60).default("manual"),
  sourceRef: z.string().trim().max(200).default(""),
  resultSummary: z.string().trim().max(2_000).default(""),
  isPublic: z.boolean().default(true),
});
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const CreateProjectResponseSchema = z.object({ project: PortfolioProjectSchema });

export const DeleteProjectQuerySchema = z.object({ id: z.string().min(1, "id is required") });
export const DeleteProjectResponseSchema = z.object({ ok: z.boolean() });
