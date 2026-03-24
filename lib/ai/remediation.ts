import { buildRecoveryPlan } from "@/features/adaptive-learning/engine";
import { AdaptiveSignal } from "@/types/personalization";

export function buildAiRemediation(signal: AdaptiveSignal) {
  return {
    title: "AI Remediation Plan",
    items: buildRecoveryPlan(signal),
  };
}
