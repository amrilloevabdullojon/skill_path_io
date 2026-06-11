import { z } from "zod";

/** Contract for `/api/v1/knowledge-graph/edges`. */

export const KnowledgeEdgeSchema = z.object({
  id: z.string(),
  fromNodeId: z.string(),
  toNodeId: z.string(),
  edgeType: z.string(),
  weight: z.number(),
});
export type KnowledgeEdge = z.infer<typeof KnowledgeEdgeSchema>;

export const ListEdgesResponseSchema = z.object({
  edges: z.array(KnowledgeEdgeSchema),
});

export const CreateEdgeSchema = z
  .object({
    fromNodeId: z.string().min(1, "fromNodeId is required"),
    toNodeId: z.string().min(1, "toNodeId is required"),
    edgeType: z.string().trim().max(40).default("REQUIRES"),
    weight: z.number().int().min(1).max(100).default(1),
  })
  .refine((data) => data.fromNodeId !== data.toNodeId, {
    message: "Cannot create a self-referencing edge",
    path: ["toNodeId"],
  });
export type CreateEdgeInput = z.infer<typeof CreateEdgeSchema>;

export const CreateEdgeResponseSchema = z.object({
  edge: KnowledgeEdgeSchema,
});
