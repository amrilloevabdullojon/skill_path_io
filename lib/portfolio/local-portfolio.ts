import { PortfolioEntry } from "@/types/personalization";

export const PORTFOLIO_STORAGE_KEY = "skillpath:portfolio:entries";

function safeParse(raw: string | null) {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as PortfolioEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item) => {
      return (
        typeof item.id === "string"
        && typeof item.title === "string"
        && typeof item.description === "string"
        && Array.isArray(item.skillsUsed)
        && typeof item.resultSummary === "string"
        && typeof item.source === "string"
        && typeof item.sourceRef === "string"
        && typeof item.createdAt === "string"
      );
    });
  } catch {
    return [];
  }
}

export function readPortfolioEntriesFromLocal(): PortfolioEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  return safeParse(window.localStorage.getItem(PORTFOLIO_STORAGE_KEY));
}

export function writePortfolioEntriesToLocal(entries: PortfolioEntry[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(entries));
}

export function upsertPortfolioEntry(entry: PortfolioEntry) {
  const current = readPortfolioEntriesFromLocal();
  const exists = current.some((item) => item.id === entry.id);
  const next = exists
    ? current.map((item) => (item.id === entry.id ? entry : item))
    : [entry, ...current];
  writePortfolioEntriesToLocal(next);
  return next;
}

export function removePortfolioEntry(entryId: string) {
  const current = readPortfolioEntriesFromLocal();
  const next = current.filter((item) => item.id !== entryId);
  writePortfolioEntriesToLocal(next);
  return next;
}

