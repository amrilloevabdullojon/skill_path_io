import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Best-effort record of an AI call for cost monitoring (see /api/v1/admin/ai-usage).
 * Never throws — logging must not break the AI response.
 */
export async function logAiUsage(feature: string, userId?: string | null): Promise<void> {
  try {
    await prisma.aiUsageLog.create({ data: { feature, userId: userId ?? null } });
  } catch {
    // ignore
  }
}
