"use client";

import { useCallback, useSyncExternalStore } from "react";

type BrowserStorageArea = "local" | "session";

const getServerSnapshot = () => null;

function getStorage(area: BrowserStorageArea) {
  if (typeof window === "undefined") return null;
  return area === "local" ? window.localStorage : window.sessionStorage;
}

export function useBrowserStorageItem(area: BrowserStorageArea, key: string) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined") return () => {};

      const handleStorage = (event: StorageEvent) => {
        if (event.storageArea === getStorage(area) && event.key === key) {
          onStoreChange();
        }
      };

      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    },
    [area, key],
  );

  const getSnapshot = useCallback(() => getStorage(area)?.getItem(key) ?? null, [area, key]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
