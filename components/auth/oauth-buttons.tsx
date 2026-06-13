"use client";

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

type ClientProvider = { id: string; name: string; type: string };

/**
 * Renders sign-in buttons for any configured OAuth providers. Returns null when
 * none are configured (e.g. local/demo), so it is safe to always mount.
 */
export function OAuthButtons({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  const [providers, setProviders] = useState<ClientProvider[] | null>(null);

  useEffect(() => {
    getProviders().then((result) => {
      const all = Object.values(result ?? {}) as ClientProvider[];
      setProviders(all.filter((provider) => provider.type === "oauth"));
    });
  }, []);

  if (!providers || providers.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or continue with
        <span className="h-px flex-1 bg-border" />
      </div>
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => signIn(provider.id, { callbackUrl })}
          className="rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-accent"
        >
          Continue with {provider.name}
        </button>
      ))}
    </div>
  );
}
