"use client";

import { create } from "zustand";

type Theme = "dark" | "light";

type UiState = {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  isCommandPaletteOpen: boolean;
  theme: Theme;
  openSidebar: () => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("sp-theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: false,
  isSidebarCollapsed: false,
  isCommandPaletteOpen: false,
  theme: "dark",
  openSidebar: () => set({ isSidebarOpen: true }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebarCollapsed: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
  toggleCommandPalette: () =>
    set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  setTheme: (theme) => {
    localStorage.setItem("sp-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const next: Theme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("sp-theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return { theme: next };
    }),
}));

export function initTheme() {
  const theme = getInitialTheme();
  document.documentElement.setAttribute("data-theme", theme);
  return theme;
}
