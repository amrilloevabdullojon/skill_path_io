"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider, useTheme } from "next-themes";
import { MotionConfig } from "framer-motion";

import { ToastProvider } from "@/components/ui/toast";
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

// Applies the persisted density attribute on first render to avoid layout flash.
function DensityInit() {
  const density = useUiStore((s) => s.density);
  useEffect(() => {
    document.documentElement.setAttribute("data-density", density);
  }, [density]);
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
        <DensityInit />
        {/* reducedMotion="user" — respects OS-level prefers-reduced-motion globally. */}
        <MotionConfig reducedMotion="user">
          <ToastProvider>{children}</ToastProvider>
        </MotionConfig>
      </ThemeProvider>
    </SessionProvider>
  );
}
