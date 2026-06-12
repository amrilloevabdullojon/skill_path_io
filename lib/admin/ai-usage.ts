import "server-only";

import type { AiUsageResponse } from "@/lib/contracts/ai-usage";
import { prisma } from "@/lib/prisma";

/** Aggregate AI call volume from AiUsageLog for cost monitoring. */
export async function buildAiUsageSummary(): Promise<AiUsageResponse["summary"]> {
  const now = Date.now();
  const since7 = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const since30 = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [totalCalls, byFeatureRaw, last7Days, last30Days] = await Promise.all([
    prisma.aiUsageLog.count(),
    prisma.aiUsageLog.groupBy({ by: ["feature"], _count: { _all: true } }),
    prisma.aiUsageLog.count({ where: { createdAt: { gte: since7 } } }),
    prisma.aiUsageLog.count({ where: { createdAt: { gte: since30 } } }),
  ]);

  const byFeature = byFeatureRaw
    .map((row) => ({ feature: row.feature, count: row._count._all }))
    .sort((a, b) => b.count - a.count);

  return { totalCalls, last7Days, last30Days, byFeature };
}
