"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useIsClient } from "@/hooks/use-is-client";

export function ThemeToggle() {
  const mounted = useIsClient();
  const { resolvedTheme, setTheme } = useTheme();

  if (!mounted) {
    return (
      <button className="btn-secondary h-10 w-10 p-0" aria-label="Загрузка темы…" disabled>
        <div className="h-4 w-4 bg-muted animate-pulse rounded-full" aria-hidden />
      </button>
    );
  }

  const isDark = resolvedTheme !== "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="btn-secondary h-10 w-10 p-0"
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-muted-foreground" aria-hidden />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground" aria-hidden />
      )}
    </button>
  );
}
