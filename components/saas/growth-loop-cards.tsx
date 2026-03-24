import Link from "next/link";

import { GrowthShareCard } from "@/types/saas";

type GrowthLoopCardsProps = {
  cards: GrowthShareCard[];
};

export function GrowthLoopCards({ cards }: GrowthLoopCardsProps) {
  return (
    <section id="growth" className="surface-elevated space-y-4 p-5">
      <h2 className="section-title">Growth loops</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((card) => (
          <article key={card.id} className="surface-subtle space-y-2 p-4">
            <p className="text-sm font-semibold text-slate-100">{card.title}</p>
            <p className="text-xs text-slate-400">{card.description}</p>
            <p className="text-[11px] text-slate-500">Channel: {card.channelHint}</p>
            <Link href={card.shareUrl} className="btn-secondary inline-flex">
              Open share link
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
