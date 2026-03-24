import {
  BuilderPersistedPayload,
  parseBuilderSnapshot,
  serializeBuilderSnapshot,
} from "@/lib/admin/builder-serialization";

export const BUILDER_PERSIST_KEY = "skillpath-academy-studio";

const memoryStore = new Map<string, string>();

function createMemoryStorage(): Storage {
  return {
    get length() {
      return memoryStore.size;
    },
    clear() {
      memoryStore.clear();
    },
    getItem(key: string) {
      return memoryStore.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(memoryStore.keys())[index] ?? null;
    },
    removeItem(key: string) {
      memoryStore.delete(key);
    },
    setItem(key: string, value: string) {
      memoryStore.set(key, value);
    },
  };
}

export function getBuilderStorage() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return createMemoryStorage();
}

export function saveBuilderSnapshotToLocal(payload: BuilderPersistedPayload) {
  const storage = getBuilderStorage();
  storage.setItem(BUILDER_PERSIST_KEY, serializeBuilderSnapshot(payload));
}

export function loadBuilderSnapshotFromLocal() {
  const storage = getBuilderStorage();
  const raw = storage.getItem(BUILDER_PERSIST_KEY);
  if (!raw) {
    return null;
  }
  return parseBuilderSnapshot(raw);
}

