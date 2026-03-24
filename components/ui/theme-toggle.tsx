"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";

import { initTheme, useUiStore } from "@/store/use-ui-store";

export function ThemeToggle() {
  const { theme, toggleTheme, setTheme } = useUiStore();

  useEffect(() => {
    const detected = initTheme();
    setTheme(detected);
  }, [setTheme]);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn-secondary h-10 w-10 p-0"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-slate-300" />
      ) : (
        <Moon className="h-4 w-4 text-slate-600" />
      )}
    </button>
  );
}
