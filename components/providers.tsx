"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";

import { initTheme, useUiStore } from "@/store/use-ui-store";

function ThemeInitializer() {
  const setTheme = useUiStore((s) => s.setTheme);

  useEffect(() => {
    const detected = initTheme();
    setTheme(detected);
  }, [setTheme]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeInitializer />
      {children}
    </SessionProvider>
  );
}
