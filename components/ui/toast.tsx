"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info" | "warning";

type ToastItem = {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
};

type ToastContextValue = {
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
  };
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 3800;

const VARIANT_STYLES: Record<ToastVariant, { Icon: typeof CheckCircle2; className: string; iconClass: string }> = {
  success: {
    Icon: CheckCircle2,
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
    iconClass: "text-emerald-500 dark:text-emerald-400",
  },
  error: {
    Icon: XCircle,
    className: "border-rose-500/40 bg-rose-500/10 text-rose-900 dark:text-rose-100",
    iconClass: "text-rose-500 dark:text-rose-400",
  },
  warning: {
    Icon: AlertTriangle,
    className: "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100",
    iconClass: "text-amber-500 dark:text-amber-400",
  },
  info: {
    Icon: Info,
    className: "border-sky-500/40 bg-sky-500/10 text-sky-900 dark:text-sky-100",
    iconClass: "text-sky-500 dark:text-sky-400",
  },
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (variant: ToastVariant, title: string, description?: string) => {
      const id = createId();
      setItems((prev) => [...prev, { id, variant, title, description }]);
      const timer = setTimeout(() => dismiss(id), DEFAULT_DURATION_MS);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: {
        success: (title, description) => push("success", title, description),
        error: (title, description) => push("error", title, description),
        info: (title, description) => push("info", title, description),
        warning: (title, description) => push("warning", title, description),
      },
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 sm:bottom-6 sm:right-6"
        aria-live="polite"
        aria-atomic="false"
      >
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const { Icon, className, iconClass } = VARIANT_STYLES[item.variant];
            return (
              <motion.div
                key={item.id}
                role="status"
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className={cn(
                  "pointer-events-auto flex items-start gap-3 rounded-2xl border bg-card/90 px-4 py-3 shadow-[0_8px_30px_rgba(2,6,23,0.35)] backdrop-blur-md",
                  className,
                )}
              >
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconClass)} aria-hidden />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  {item.description ? (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  aria-label="Закрыть уведомление"
                  className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Graceful fallback: no provider mounted → toast calls become no-ops.
    return {
      toast: {
        success: () => {},
        error: () => {},
        info: () => {},
        warning: () => {},
      },
      dismiss: () => {},
    };
  }
  return ctx;
}
