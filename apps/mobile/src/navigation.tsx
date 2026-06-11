import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Minimal stack navigation with zero native dependencies, kept deliberately
 * small for the first screens. Swap for expo-router / react-navigation once the
 * screen count and deep-linking needs grow.
 */

export type Route =
  | { name: "Tracks" }
  | { name: "Profile" }
  | { name: "TrackDetail"; slug: string; title?: string }
  | { name: "ModuleDetail"; slug: string; moduleId: string; title?: string }
  | { name: "Quiz"; slug: string; moduleId: string; title?: string }
  | { name: "Mission"; slug: string; moduleId: string; missionId: string; title?: string };

type Navigation = {
  route: Route;
  canGoBack: boolean;
  navigate: (route: Route) => void;
  goBack: () => void;
};

const NavigationContext = createContext<Navigation | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Route[]>([{ name: "Tracks" }]);

  const navigate = useCallback((route: Route) => {
    setStack((prev) => [...prev, route]);
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const value = useMemo<Navigation>(
    () => ({
      route: stack[stack.length - 1],
      canGoBack: stack.length > 1,
      navigate,
      goBack,
    }),
    [stack, navigate, goBack],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): Navigation {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within a NavigationProvider");
  return ctx;
}
