"use client";

import { useEffect } from "react";
import { Maximize2, Minimize2, Square } from "lucide-react";

import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/use-ui-store";

const options = [
  { id: "compact", label: "Compact", icon: Minimize2 },
  { id: "comfortable", label: "Comfortable", icon: Square },
  { id: "spacious", label: "Spacious", icon: Maximize2 },
] as const;

export function DensityToggle({ className }: { className?: string }) {
  const density = useUiStore((s) => s.density);
  const setDensity = useUiStore((s) => s.setDensity);

  // Apply attribute on first mount in case it wasn't set before hydration.
  useEffect(() => {
    document.documentElement.setAttribute("data-density", density);
  }, [density]);

  return (
    <div className={cn("lang-switcher inline-flex items-center gap-0.5 p-0.5", className)} role="radiogroup" aria-label="Плотность интерфейса">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = density === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setDensity(option.id)}
            className={cn(
              "lang-btn focus-ring inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
              isActive && "lang-btn-active",
            )}
            title={option.label}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
