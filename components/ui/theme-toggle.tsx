"use client";

import { Moon, Sun } from "lucide-react";

import { useUiStore } from "@/store/use-ui-store";

export function ThemeToggle() {
  const { theme, toggleTheme } = useUiStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn-secondary h-10 w-10 p-0"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-muted-foreground" />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}
