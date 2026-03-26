"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";

import { ReviewCard } from "@/features/review/speed-review";

export function SpeedReviewMode({ cards }: { cards: ReviewCard[] }) {
  const [index, setIndex] = useState(0);
  const current = cards[index] ?? null;

  if (!current) {
    return (
      <section className="surface-elevated p-5">
        <p className="text-sm text-muted-foreground">No review cards yet.</p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-2 p-5 sm:p-6">
        <p className="kicker">Speed Review</p>
        <h1 className="page-title">Fast revision mode</h1>
        <p className="section-description">Key ideas, common mistakes, quick questions, and bookmarked content in one place.</p>
      </header>

      <article className="surface-elevated space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">Card {index + 1}/{cards.length}</p>
          <span className="chip-neutral px-2.5 py-1 text-xs">
            {current.type}
          </span>
        </div>

        <div className="surface-subtle space-y-2 p-4">
          <p className="text-lg font-semibold text-foreground">{current.title}</p>
          <p className="text-sm text-muted-foreground">{current.detail}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev + 1) % cards.length)}
            className="btn-primary inline-flex items-center gap-2"
          >
            Next card
            <ArrowRight className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setIndex(0)} className="btn-secondary inline-flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Restart
          </button>
          <Link href="/bookmarks" className="btn-secondary">
            Open bookmarks
          </Link>
        </div>
      </article>
    </section>
  );
}
