import { BuilderPersistedSnapshot } from "@/lib/admin/builder-serialization";

export type BuilderSyncStatus = "synced" | "skipped" | "failed";

export type BuilderSyncResult = {
  status: BuilderSyncStatus;
  message: string;
};

export interface BuilderSyncAdapter {
  pull(): Promise<BuilderPersistedSnapshot | null>;
  push(snapshot: BuilderPersistedSnapshot): Promise<BuilderSyncResult>;
}

class LocalOnlyBuilderSyncAdapter implements BuilderSyncAdapter {
  async pull(): Promise<BuilderPersistedSnapshot | null> {
    return null;
  }

  async push(_snapshot: BuilderPersistedSnapshot): Promise<BuilderSyncResult> {
    return {
      status: "skipped",
      message: "Server sync disabled. Local persistence remains source of truth.",
    };
  }
}

class HttpBuilderSyncAdapter implements BuilderSyncAdapter {
  constructor(private readonly endpoint: string) {}

  async pull(): Promise<BuilderPersistedSnapshot | null> {
    const response = await fetch(this.endpoint, { method: "GET" });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as BuilderPersistedSnapshot;
  }

  async push(snapshot: BuilderPersistedSnapshot): Promise<BuilderSyncResult> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(snapshot),
    });

    if (!response.ok) {
      return {
        status: "failed",
        message: "Remote sync request failed.",
      };
    }

    return {
      status: "synced",
      message: "Remote sync completed.",
    };
  }
}

export function resolveBuilderSyncAdapter() {
  const endpoint = process.env.NEXT_PUBLIC_BUILDER_SYNC_ENDPOINT?.trim();
  if (!endpoint) {
    return new LocalOnlyBuilderSyncAdapter();
  }
  return new HttpBuilderSyncAdapter(endpoint);
}

export async function pushBuilderSnapshot(snapshot: BuilderPersistedSnapshot) {
  const adapter = resolveBuilderSyncAdapter();
  return adapter.push(snapshot);
}
