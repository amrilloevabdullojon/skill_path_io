import { NextResponse } from "next/server";

import { buildUnifiedAiRecommendations } from "@/lib/ai";
import { ensureFeature, resolveApiSubscriptionContext } from "@/lib/saas/api-access";
import { buildSmartRecommendations } from "@/lib/saas/recommendations";
import { AdaptiveSignal } from "@/types/personalization";

// Backward-compatible endpoint. Preferred endpoint: /api/ai/recommendations
export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AdaptiveSignal>;
  const accessContext = await resolveApiSubscriptionContext();
  const analyticsGate = ensureFeature(accessContext, "analytics.advanced");
  const adaptive = buildUnifiedAiRecommendations(body);

  const smart = buildSmartRecommendations({
    careerTarget: "Junior role readiness",
    learningProgressPercent: Math.max(0, Math.min(body.completedModules ?? 0, 100)),
    skillGaps: body.frequentMistakes?.slice(0, 3) ?? [],
    weakestSkills: body.frequentMistakes?.slice(0, 3) ?? [],
    upcomingModules: [{ title: "Targeted remediation module", href: "/tracks" }],
    missionSuggestions: [{ title: "Applied mission practice", href: "/missions" }],
  });

  return NextResponse.json(
    {
      ...adaptive,
      smartRecommendations: analyticsGate.allowed ? smart : smart.slice(0, 2),
      locked: !analyticsGate.allowed,
      upgradePlanId: analyticsGate.allowed ? null : analyticsGate.upgradePlanId,
    },
    { status: 200 },
  );
}
