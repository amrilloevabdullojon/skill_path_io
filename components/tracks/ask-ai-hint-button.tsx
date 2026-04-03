"use client";

import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";

export const OPEN_MENTOR_EVENT = "skillpath:open-mentor";

type AskAiHintButtonProps = {
  question: string;
};

export function AskAiHintButton({ question }: AskAiHintButtonProps) {
  const [justSent, setJustSent] = useState(false);

  function handleAskMentor() {
    window.dispatchEvent(
      new CustomEvent(OPEN_MENTOR_EVENT, {
        detail: {
          question,
        },
      }),
    );
    setJustSent(true);
    window.setTimeout(() => setJustSent(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleAskMentor}
      className="btn-secondary inline-flex items-center gap-2"
    >
      {justSent ? <Sparkles className="h-4 w-4 text-sky-300" /> : <Bot className="h-4 w-4 text-sky-300" />}
      {justSent ? "ИИ открыт" : "Спросить ИИ-ментора"}
    </button>
  );
}
