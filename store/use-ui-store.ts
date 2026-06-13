"use client";

import { create } from "zustand";

type Theme = "dark" | "light";
type Density = "compact" | "comfortable" | "spacious";

type UiState = {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  isCommandPaletteOpen: boolean;
  theme: Theme;
  density: Density;
  openSidebar: () => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setDensity: (density: Density) => void;
};

function getInitialDensity(): Density {
  if (typeof window === "undefined") return "comfortable";
  const stored = localStorage.getItem("sp-density") as Density | null;
  if (stored === "compact" || stored === "comfortable" || stored === "spacious") {
    return stored;
  }
  return "comfortable";
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: false,
  isSidebarCollapsed: false,
  isCommandPaletteOpen: false,
  theme: "dark",
  density: typeof window === "undefined" ? "comfortable" : getInitialDensity(),
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
  setDensity: (density) => {
    localStorage.setItem("sp-density", density);
    document.documentElement.setAttribute("data-density", density);
    set({ density });
  },
}));
