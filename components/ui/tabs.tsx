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
      <div className="tab-list flex flex-wrap gap-1 p-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item.id)}
            className={cn(
              "focus-ring rounded-xl px-3 py-2 text-sm font-medium transition-all",
              item.id === current?.id ? "tab-trigger-active" : "tab-trigger",
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
