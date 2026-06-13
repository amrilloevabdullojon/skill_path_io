import { withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { parseBody, respond } from "@/lib/api/v1/http";
import {
  CreateEdgeResponseSchema,
  CreateEdgeSchema,
  ListEdgesResponseSchema,
} from "@/lib/contracts/knowledge-graph";
import { MAX_KNOWLEDGE_GRAPH_EDGES } from "@/lib/config/limits";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const edgeSelect = {
  id: true,
  fromNodeId: true,
  toNodeId: true,
  edgeType: true,
  weight: true,
} as const;

/** GET /api/v1/knowledge-graph/edges — list knowledge graph edges (capped). */
export const GET = withErrorHandler(async () => {
  const edges = await prisma.knowledgeEdge.findMany({
    take: MAX_KNOWLEDGE_GRAPH_EDGES,
    select: edgeSelect,
    orderBy: { createdAt: "asc" },
  });
  return respond(ListEdgesResponseSchema, { edges });
});

/** POST /api/v1/knowledge-graph/edges — create or update an edge. */
export const POST = withErrorHandler(async (request: Request) => {
  await requireIdentity(request);
  const input = await parseBody(request, CreateEdgeSchema);

  const edge = await prisma.knowledgeEdge.upsert({
    where: { fromNodeId_toNodeId: { fromNodeId: input.fromNodeId, toNodeId: input.toNodeId } },
    create: {
      fromNodeId: input.fromNodeId,
      toNodeId: input.toNodeId,
      edgeType: input.edgeType,
      weight: input.weight,
    },
    update: { edgeType: input.edgeType, weight: input.weight },
    select: edgeSelect,
  });

  return respond(CreateEdgeResponseSchema, { edge }, 201);
});
