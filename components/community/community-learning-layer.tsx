import { MessageSquareQuote } from "lucide-react";

import { CommunityDiscussion, PeerFeedbackItem } from "@/types/saas";

type CommunityLearningLayerProps = {
  discussions: CommunityDiscussion[];
  feedback: PeerFeedbackItem[];
};

export function CommunityLearningLayer({ discussions, feedback }: CommunityLearningLayerProps) {
  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-2 p-5 sm:p-6">
        <p className="kicker">Community Learning</p>
        <h1 className="page-title">Track and mission discussions with peer feedback</h1>
        <p className="section-description">Discuss missions, join track groups, and improve outcomes through peer review.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-elevated space-y-3 p-4">
          <h2 className="section-title">Discussion threads</h2>
          {discussions.map((thread) => (
            <article key={thread.id} className="surface-subtle space-y-2 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{thread.title}</p>
                  <p className="text-xs text-slate-500">{thread.author} | {thread.scope}</p>
                </div>
                <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[11px] text-slate-300">
                  {thread.replyCount} replies
                </span>
              </div>
              <p className="text-xs text-slate-400">{thread.body}</p>
            </article>
          ))}
        </section>

        <section className="surface-elevated space-y-3 p-4">
          <h2 className="section-title">Peer feedback</h2>
          {feedback.map((item) => (
            <article key={item.id} className="surface-subtle space-y-2 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Mission: {item.missionId}</p>
              <p className="text-sm text-slate-200">{item.summary}</p>
              <p className="inline-flex items-center gap-2 text-xs text-slate-400">
                <MessageSquareQuote className="h-3.5 w-3.5" />
                Reviewer: {item.reviewer} | Helpful votes: {item.helpfulVotes}
              </p>
            </article>
          ))}
        </section>
      </div>
    </section>
  );
}
