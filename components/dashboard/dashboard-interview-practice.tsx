import Link from "next/link";
import { MessageSquare, Timer } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";

export function DashboardInterviewPracticeSection() {
  return (
    <DashboardSection
      id="interview-practice"
      title="Interview practice"
      description="Simulate role interviews and get structured AI feedback."
      actionLabel="Start interview"
      actionHref="/interview"
    >
      <article className="surface-subtle space-y-3 p-4">
        <p className="text-sm font-semibold text-slate-100">Mock interview trainer</p>
        <p className="text-xs text-slate-400">
          Practice QA, BA, and DA interview questions, evaluate weak zones, and get next modules.
        </p>
        <div className="grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
          <p className="rounded-xl border border-slate-800 bg-slate-900/70 p-2 inline-flex items-center gap-1">
            <Timer className="h-3.5 w-3.5 text-slate-500" />
            10-15 min session
          </p>
          <p className="rounded-xl border border-slate-800 bg-slate-900/70 p-2 inline-flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
            Instant AI feedback
          </p>
        </div>
        <Link href="/interview" className="btn-secondary inline-flex">
          Open interview trainer
        </Link>
      </article>
    </DashboardSection>
  );
}
