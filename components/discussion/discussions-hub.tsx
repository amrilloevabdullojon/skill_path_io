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
                <p className="text-sm font-semibold text-foreground">{thread.title}</p>
                <p className="text-xs text-muted-foreground">{thread.moduleTitle} | {thread.author}</p>
              </div>
              <span className="chip-neutral px-2 py-0.5 text-[11px]">
                {thread.lastActivity}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {thread.tags.map((tag) => (
                <span key={tag} className="chip-neutral px-2 py-0.5 text-[10px]">
                  {tag}
                </span>
              ))}
            </div>

            <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <MessageCircleMore className="h-3.5 w-3.5" />
              {thread.replies} replies
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
