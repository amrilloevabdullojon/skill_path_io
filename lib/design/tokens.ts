export const designTokens = {
  colors: {
    backgroundPrimary: "hsl(var(--background-primary))",
    backgroundSecondary: "hsl(var(--background-secondary))",
    backgroundElevated: "hsl(var(--background-elevated))",
    textPrimary: "hsl(var(--text-primary))",
    textSecondary: "hsl(var(--text-secondary))",
    textMuted: "hsl(var(--text-muted))",
    success: "hsl(var(--success))",
    warning: "hsl(var(--warning))",
    error: "hsl(var(--destructive))",
    info: "hsl(var(--info))",
    trackQa: "hsl(var(--track-qa))",
    trackBa: "hsl(var(--track-ba))",
    trackDa: "hsl(var(--track-da))",
  },
  typography: {
    hero: "text-4xl sm:text-5xl font-semibold tracking-tight",
    section: "text-2xl sm:text-3xl font-semibold tracking-tight",
    cardTitle: "text-lg font-semibold tracking-tight",
    body: "text-sm leading-7",
    label: "text-xs uppercase tracking-[0.18em]",
  },
  spacing: {
    section: "space-y-8 lg:space-y-10",
    card: "p-5 sm:p-6",
    compact: "p-4",
  },
  radius: {
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)",
    x2: "var(--radius-2xl)",
  },
  shadows: {
    soft: "var(--shadow-soft)",
    card: "var(--shadow-card)",
    elevated: "var(--shadow-elevated)",
  },
  borders: {
    subtle: "1px solid hsl(var(--border-subtle) / 1)",
    strong: "1px solid hsl(var(--border-strong) / 1)",
  },
  motion: {
    fast: "180ms cubic-bezier(0.22, 1, 0.36, 1)",
    normal: "260ms cubic-bezier(0.22, 1, 0.36, 1)",
  },
} as const;

export type DesignTokens = typeof designTokens;
