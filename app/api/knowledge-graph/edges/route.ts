import { apiOk, Errors, withErrorHandler } from "@/lib/api/error-handler";
import { prisma } from "@/lib/prisma";

export const GET = withErrorHandler(async () => {
  const edges = await prisma.knowledgeEdge.findMany({
    select: {
      id: true,
      fromNodeId: true,
      toNodeId: true,
      edgeType: true,
      weight: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return apiOk({ edges });
});

export const POST = withErrorHandler(async (request: Request) => {
  const body = (await request.json()) as {
    fromNodeId?: string;
    toNodeId?: string;
    edgeType?: string;
    weight?: number;
  };

  if (!body.fromNodeId || !body.toNodeId) {
    throw Errors.validation("fromNodeId and toNodeId are required");
  }

  if (body.fromNodeId === body.toNodeId) {
    throw Errors.validation("Cannot create self-referencing edge");
  }

  const edge = await prisma.knowledgeEdge.upsert({
    where: {
      fromNodeId_toNodeId: {
        fromNodeId: body.fromNodeId,
        toNodeId: body.toNodeId,
      },
    },
    create: {
      fromNodeId: body.fromNodeId,
      toNodeId: body.toNodeId,
      edgeType: body.edgeType ?? "REQUIRES",
      weight: body.weight ?? 1,
    },
    update: {
      edgeType: body.edgeType ?? "REQUIRES",
      weight: body.weight ?? 1,
    },
  });

  return apiOk({ edge }, 201);
});
