"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="page-shell flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10">
        <AlertTriangle className="h-6 w-6 text-rose-400" />
      </span>
      <div>
        <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred in the admin panel."}
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-xs text-muted-foreground/60">
            digest: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/admin/dashboard" className="btn-secondary">
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}
