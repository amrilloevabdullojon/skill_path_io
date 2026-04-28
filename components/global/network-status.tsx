"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";

export function NetworkStatus() {
  // Assume online by default during SSR to avoid hydration mismatch
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showBackOnline, setShowBackOnline] = useState<boolean>(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
    setIsOnline(navigator.onLine);

    let hideTimerId: ReturnType<typeof setTimeout> | null = null;

    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      if (hideTimerId) clearTimeout(hideTimerId);
      hideTimerId = setTimeout(() => setShowBackOnline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
      if (hideTimerId) {
        clearTimeout(hideTimerId);
        hideTimerId = null;
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (hideTimerId) clearTimeout(hideTimerId);
    };
  }, []);

  if (!hasHydrated) return null;

  return (
    <AnimatePresence>
      {(!isOnline || showBackOnline) && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-2 left-0 w-full z-[9999] flex justify-center pointer-events-none px-4"
        >
          <div 
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg border backdrop-blur-md pointer-events-auto ${
              isOnline 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                : "bg-rose-500/10 border-rose-500/20 text-rose-500"
            }`}
          >
            {isOnline ? (
              <Wifi className="w-4 h-4 animate-pulse" />
            ) : (
              <WifiOff className="w-4 h-4 animate-pulse" />
            )}
            <span className="text-sm font-bold tracking-wide">
              {isOnline ? "Соединение восстановлено" : "Отсутствует подключение к сети"}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
