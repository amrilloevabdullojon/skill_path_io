import { KnowledgeNode } from "@/types/personalization";

export function groupKnowledgeByCategory(nodes: KnowledgeNode[]) {
  return nodes.reduce<Record<string, KnowledgeNode[]>>((acc, node) => {
    const key = node.category;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(node);
    return acc;
  }, {});
}

export function nextRecommendedNode(nodes: KnowledgeNode[]) {
  return nodes.find((node) => node.recommended && !node.completed && !node.locked) ?? null;
}

export function knowledgeCompletion(nodes: KnowledgeNode[]) {
  const completed = nodes.filter((node) => node.completed).length;
  const total = nodes.length;
  return {
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
