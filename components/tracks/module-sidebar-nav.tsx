"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type NavLink = { id: string; label: string };

export function ModuleSidebarNav({ links }: { links: NavLink[] }) {
  const [activeId, setActiveId] = useState<string>(links[0]?.id ?? "");

  useEffect(() => {
    if (links.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost intersecting entry
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topmost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
          );
          setActiveId(topmost.target.id);
        }
      },
      { rootMargin: "-10% 0px -60% 0px", threshold: 0 },
    );

    links.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [links]);

  return (
    <div className="space-y-0.5 rounded-2xl border border-border bg-card/55 p-2">
      {links.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={cn(
            "block rounded-lg px-3 py-1.5 text-sm transition-all duration-150",
            activeId === item.id
              ? "bg-sky-500/15 font-medium text-sky-400"
              : "text-muted-foreground hover:bg-muted/20 hover:text-foreground",
          )}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
