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
        <p className="text-sm font-semibold text-foreground">Mock interview trainer</p>
        <p className="text-xs text-muted-foreground">
          Practice QA, BA, and DA interview questions, evaluate weak zones, and get next modules.
        </p>
        <div className="grid gap-2 text-xs sm:grid-cols-2">
          <p className="data-pill inline-flex items-center gap-1 p-2">
            <Timer className="select-chevron h-3.5 w-3.5" />
            10-15 min session
          </p>
          <p className="data-pill inline-flex items-center gap-1 p-2">
            <MessageSquare className="select-chevron h-3.5 w-3.5" />
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
