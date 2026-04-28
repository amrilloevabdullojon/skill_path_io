"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider, useTheme } from "next-themes";

import { useUiStore } from "@/store/use-ui-store";

// Keeps Zustand store in sync with next-themes so that the rest of the app
// (AppShell focus-mode banner, ThemeToggle icon) still gets the correct value.
function ThemeStoreSync() {
  const { resolvedTheme } = useTheme();
  const setTheme = useUiStore((s) => s.setTheme);

  useEffect(() => {
    if (resolvedTheme === "light" || resolvedTheme === "dark") {
      setTheme(resolvedTheme);
    }
  }, [resolvedTheme, setTheme]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="dark"
        enableSystem
        storageKey="sp-theme"
      >
        <ThemeStoreSync />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
