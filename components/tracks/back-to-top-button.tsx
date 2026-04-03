"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 2000);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Наверх"
      className={cn(
        "fixed bottom-24 right-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/90 text-muted-foreground shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-sky-400/40 hover:text-sky-400 lg:bottom-8",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none",
      )}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
