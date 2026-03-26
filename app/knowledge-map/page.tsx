import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { KnowledgeMapView } from "@/components/knowledge-map/knowledge-map-view";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Knowledge Map — SkillPath Academy",
  description: "Visual map of your acquired skills and remaining learning objectives.",
  robots: { index: false },
};
import { getDashboardData } from "@/lib/dashboard/data";
import { resolveRuntimeCatalog } from "@/lib/learning/content-resolver";
import { prisma } from "@/lib/prisma";
import { KnowledgeNode } from "@/types/personalization";

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

export const dynamic = "force-dynamic";

export default async function KnowledgeMapPage() {
  const session = await getServerSession(authOptions);
  const [dashboard, nodeRows, edgeRows, runtimeCatalog] = await Promise.all([
    getDashboardData({
      preferredEmail: session?.user?.email,
      sessionRole: session?.user?.role,
    }),
    prisma.knowledgeNode.findMany({
      orderBy: [{ category: "asc" }, { title: "asc" }],
      take: 160,
    }),
    // Load edges from KnowledgeEdge table (graceful fallback)
    prisma.knowledgeEdge
      .findMany({ select: { fromNodeId: true, toNodeId: true, edgeType: true } })
      .catch(() => [] as Array<{ fromNodeId: string; toNodeId: string; edgeType: string }>),
    resolveRuntimeCatalog({ includeCourseEntities: true }),
  ]);

  const runtimeFallbackNodes: Array<{
    id: string;
    key: string;
    title: string;
    category: string;
    dependencies: string[];
  }> = runtimeCatalog.courses.flatMap((course) =>
    course.modules.map((moduleItem, index) => ({
      id: moduleItem.id,
      key: moduleItem.id,
      title: moduleItem.title,
      category: `${course.category} Track`,
      dependencies: index > 0 ? [course.modules[index - 1].id] : [],
    })),
  );

  // Build dependency map from real KnowledgeEdge rows, falling back to JSON field
  const edgeDepsById = new Map<string, string[]>();
  for (const edge of edgeRows) {
    const existing = edgeDepsById.get(edge.toNodeId) ?? [];
    existing.push(edge.fromNodeId);
    edgeDepsById.set(edge.toNodeId, existing);
  }

  const baseNodes =
    nodeRows.length > 0
      ? nodeRows.map((node) => ({
          id: node.id,
          key: node.slug,
          title: node.title,
          category: node.category,
          // Prefer real edge data over legacy JSON field
          dependencies: edgeDepsById.get(node.id) ?? parseStringArray(node.dependencies),
        }))
      : runtimeFallbackNodes;

  const completedQuota = Math.max(0, Math.min(baseNodes.length, dashboard?.hero.completedModules ?? 0));
  const completedKeys = new Set(baseNodes.slice(0, completedQuota).flatMap((node) => [node.id, node.key]));

  let recommendedAssigned = false;
  const nodes: KnowledgeNode[] = baseNodes.map((node) => {
    const completed = completedKeys.has(node.id) || completedKeys.has(node.key);
    const locked = node.dependencies.some((dependencyId) => !completedKeys.has(dependencyId));
    const recommended = !recommendedAssigned && !completed && !locked;

    if (recommended) {
      recommendedAssigned = true;
    }

    return {
      id: node.id,
      title: node.title,
      category: node.category,
      dependencies: node.dependencies,
      completed,
      recommended,
      locked,
    };
  });

  return (
    <section className="page-shell">
      <KnowledgeMapView nodes={nodes} />
    </section>
  );
}
