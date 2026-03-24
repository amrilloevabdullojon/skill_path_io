/**
 * Generates a deterministic HSL hue from a track slug.
 * Known tracks (qa, ba, da) return their branded colors;
 * new tracks get a unique hue derived from the slug hash.
 */

const KNOWN_TRACK_HUES: Record<string, number> = {
  qa: 154,   // emerald
  ba: 30,    // orange
  da: 262,   // violet
  dev: 213,  // blue
  pm: 48,    // amber
  ds: 190,   // cyan
};

function hashSlug(slug: string): number {
  let hash = 5381;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) + hash) ^ slug.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash % 360;
}

export function getTrackHue(slug: string): number {
  const normalized = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
  return KNOWN_TRACK_HUES[normalized] ?? hashSlug(normalized);
}

export type TrackColorSet = {
  /** Tailwind-compatible inline styles for bg, border, text */
  bg: string;
  border: string;
  text: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
};

export function getTrackColors(slug: string): TrackColorSet {
  const hue = getTrackHue(slug);
  return {
    bg: `hsl(${hue} 70% 30% / 0.15)`,
    border: `hsl(${hue} 60% 55% / 0.3)`,
    text: `hsl(${hue} 80% 70%)`,
    badgeBg: `hsl(${hue} 65% 25% / 0.2)`,
    badgeBorder: `hsl(${hue} 55% 50% / 0.35)`,
    badgeText: `hsl(${hue} 75% 72%)`,
  };
}
