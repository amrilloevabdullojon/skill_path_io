import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "background-primary": "hsl(var(--background-primary))",
        "background-secondary": "hsl(var(--background-secondary))",
        "background-elevated": "hsl(var(--background-elevated))",
        "text-primary": "hsl(var(--text-primary))",
        "text-secondary": "hsl(var(--text-secondary))",
        "text-muted": "hsl(var(--text-muted))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--surface-foreground))",
        },
        elevated: "hsl(var(--elevated))",
        glass: "hsl(var(--glass))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
        destructive: "hsl(var(--destructive))",
        track: {
          qa: "hsl(var(--track-qa))",
          ba: "hsl(var(--track-ba))",
          da: "hsl(var(--track-da))",
        },
        border: "hsl(var(--border))",
        "border-subtle": "hsl(var(--border-subtle))",
        "border-strong": "hsl(var(--border-strong))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        /* Phase 6: semantic accent palette (supports opacity modifier) */
        "accent-primary": {
          DEFAULT: "hsl(var(--accent-primary) / <alpha-value>)",
          fg: "hsl(var(--accent-primary-fg) / <alpha-value>)",
        },
        "accent-success": {
          DEFAULT: "hsl(var(--accent-success) / <alpha-value>)",
          fg: "hsl(var(--accent-success-fg) / <alpha-value>)",
        },
        "accent-warning": {
          DEFAULT: "hsl(var(--accent-warning) / <alpha-value>)",
          fg: "hsl(var(--accent-warning-fg) / <alpha-value>)",
        },
        "accent-danger": {
          DEFAULT: "hsl(var(--accent-danger) / <alpha-value>)",
          fg: "hsl(var(--accent-danger-fg) / <alpha-value>)",
        },
        "accent-info": {
          DEFAULT: "hsl(var(--accent-info) / <alpha-value>)",
          fg: "hsl(var(--accent-info-fg) / <alpha-value>)",
        },
        /* Phase 6: 2-level surface hierarchy */
        "surface-raised": {
          DEFAULT: "hsl(var(--surface-raised) / <alpha-value>)",
          border: "hsl(var(--surface-raised-border) / <alpha-value>)",
        },
      },
      fontSize: {
        /* Phase 6: 5-size typography scale */
        display: ["2.75rem", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "800" }],
        "heading-1": ["2rem", { lineHeight: "1.1", letterSpacing: "-0.015em", fontWeight: "700" }],
        "heading-2": ["1.375rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "600" }],
        body: ["0.9375rem", { lineHeight: "1.6" }],
        caption: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.02em" }],
      },
      fontFamily: {
        sans: ["var(--font-manrope, 'Segoe UI')", "Helvetica Neue", "Arial", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.75rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 14px 42px rgba(2, 6, 23, 0.36)",
        card: "0 10px 30px rgba(2, 6, 23, 0.28)",
        glow: "0 0 0 1px rgba(148, 163, 184, 0.08), 0 12px 28px rgba(2, 6, 23, 0.44)",
      },
      transitionDuration: {
        fast: "180ms",
        normal: "260ms",
        slow: "400ms",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      letterSpacing: {
        kicker: "0.18em",
      },
      zIndex: {
        base: "var(--z-base)",
        raised: "var(--z-raised)",
        sticky: "var(--z-sticky)",
        overlay: "var(--z-overlay)",
        drawer: "var(--z-drawer)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
        tooltip: "var(--z-tooltip)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
