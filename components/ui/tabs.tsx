"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export type TabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export function Tabs({
  items,
  defaultTabId,
  className,
}: {
  items: TabItem[];
  defaultTabId?: string;
  className?: string;
}) {
  const [active, setActive] = useState(defaultTabId ?? items[0]?.id ?? "");
  const current = items.find((item) => item.id === active) ?? items[0];

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item.id)}
            className={cn(
              "focus-ring rounded-xl px-3 py-2 text-sm font-medium transition-all",
              item.id === current?.id ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:text-slate-200",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="animate-in fade-in duration-300">{current?.content}</div>
    </section>
  );
}
