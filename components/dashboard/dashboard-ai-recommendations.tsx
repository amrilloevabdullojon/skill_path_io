import Link from "next/link";
import { ArrowUpRight, Bot, BrainCircuit, GraduationCap, Lightbulb, Sparkles } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import type { DashboardRecommendation } from "@/lib/dashboard/data";

type DashboardAiRecommendationsProps = {
  recommendations: DashboardRecommendation[];
};

function recommendationIcon(tag: DashboardRecommendation["tag"]) {
  if (tag === "Quiz") {
    return <BrainCircuit className="h-4 w-4 text-sky-300" />;
  }
  if (tag === "Simulation") {
    return <Sparkles className="h-4 w-4 text-violet-300" />;
  }
  if (tag === "Career") {
    return <GraduationCap className="h-4 w-4 text-emerald-300" />;
  }
  if (tag === "Mentor") {
    return <Bot className="h-4 w-4 text-cyan-300" />;
  }
  return <Lightbulb className="h-4 w-4 text-amber-300" />;
}

export function DashboardAiRecommendationsSection({ recommendations }: DashboardAiRecommendationsProps) {
  return (
    <DashboardSection
      id="ai"
      title="AI Recommendations"
      description="Adaptive guidance based on your progress, quiz performance, and skill gaps."
    >
      <div className="grid gap-3">
        {recommendations.map((item) => (
          <article key={item.id} className="surface-panel-hover rounded-xl border border-slate-800 bg-slate-950/75 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {recommendationIcon(item.tag)}
                  <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                </div>
                <p className="text-xs text-slate-400">{item.description}</p>
              </div>
              <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                {item.tag}
              </span>
            </div>

            <Link
              href={item.href}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-300 transition-colors hover:text-sky-200"
            >
              Open recommendation
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </article>
        ))}
      </div>
    </DashboardSection>
  );
}
