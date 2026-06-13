import { MessageSquare, MessageSquareQuote } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { CommunityDiscussion, PeerFeedbackItem } from "@/types/saas";

type CommunityLearningLayerProps = {
  discussions: CommunityDiscussion[];
  feedback: PeerFeedbackItem[];
};

export function CommunityLearningLayer({ discussions, feedback }: CommunityLearningLayerProps) {
  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-2 p-5 sm:p-6">
        <p className="kicker">Обучение в сообществе</p>
        <h1 className="page-title">Обсуждения треков и миссий с обратной связью</h1>
        <p className="section-description">Обсуждай миссии, вступай в группы по трекам и улучшай результаты через взаимную проверку.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-elevated space-y-3 p-4">
          <h2 className="section-title">Темы обсуждений</h2>
          {discussions.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              size="sm"
              title="Пока нет обсуждений"
              description="Начните первую тему — задайте вопрос или поделитесь решением миссии."
              actionLabel="Открыть миссии"
              actionHref="/missions"
            />
          ) : (
            discussions.map((thread) => (
              <article key={thread.id} className="surface-subtle space-y-2 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{thread.title}</p>
                    <p className="text-xs text-muted-foreground">{thread.author} | {thread.scope}</p>
                  </div>
                  <span className="chip-neutral px-2 py-0.5 text-[11px]">
                    {thread.replyCount} ответов
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{thread.body}</p>
              </article>
            ))
          )}
        </section>

        <section className="surface-elevated space-y-3 p-4">
          <h2 className="section-title">Обратная связь от коллег</h2>
          {feedback.length === 0 ? (
            <EmptyState
              icon={MessageSquareQuote}
              size="sm"
              title="Очередь рецензий пуста"
              description="Завершите миссию и отправьте артефакт на peer review — обратная связь появится здесь."
              actionLabel="К миссиям"
              actionHref="/missions"
            />
          ) : (
            feedback.map((item) => (
              <article key={item.id} className="surface-subtle space-y-2 p-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Миссия: {item.missionId}</p>
                <p className="text-sm text-muted-foreground">{item.summary}</p>
                <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <MessageSquareQuote className="h-3.5 w-3.5" aria-hidden />
                  Рецензент: {item.reviewer} · Полезных оценок: {item.helpfulVotes}
                </p>
              </article>
            ))
          )}
        </section>
      </div>
    </section>
  );
}
