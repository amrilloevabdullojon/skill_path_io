import { MessageCircleMore } from "lucide-react";

import { DiscussionThread } from "@/types/personalization";

export function DiscussionsHub({ threads }: { threads: DiscussionThread[] }) {
  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-2 p-5 sm:p-6">
        <p className="kicker">Discussions</p>
        <h1 className="page-title">Module threads and peer comments</h1>
        <p className="section-description">First local version of discussions layer. Ready for future API/DB integration.</p>
      </header>

      <div className="space-y-3">
        {threads.map((thread) => (
          <article key={thread.id} className="surface-elevated space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-100">{thread.title}</p>
                <p className="text-xs text-slate-500">{thread.moduleTitle} | {thread.author}</p>
              </div>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-300">
                {thread.lastActivity}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {thread.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-300">
                  {tag}
                </span>
              ))}
            </div>

            <p className="inline-flex items-center gap-2 text-xs text-slate-400">
              <MessageCircleMore className="h-3.5 w-3.5" />
              {thread.replies} replies
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
