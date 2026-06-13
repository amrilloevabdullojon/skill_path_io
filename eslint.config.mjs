import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  // Accessibility audit surface. eslint-config-next already enforces a few
  // jsx-a11y rules as errors; this layer adds the *full* recommended set as
  // warnings so the remaining issues stay visible (and regressions surface)
  // without blocking CI. A static pass found 78: mostly unassociated <label>s
  // in admin forms, a few keyboard-interaction gaps, and one false positive on
  // the CardTitle wrapper — they need a visually-verified sweep to fix. The
  // plugin is already registered by eslint-config-next, so we only set rules.
  {
    files: ["app/**/*.{ts,tsx,jsx}", "components/**/*.{ts,tsx,jsx}"],
    rules: Object.fromEntries(
      Object.entries(jsxA11y.flatConfigs.recommended.rules)
        // Keep only rules the recommended set actually enables, preserving any
        // options, but downgrade the severity to "warn".
        .map(([rule, value]) => {
          const opts = Array.isArray(value) ? value.slice(1) : [];
          const severity = Array.isArray(value) ? value[0] : value;
          return [rule, severity === "off" || severity === 0 ? "off" : ["warn", ...opts]];
        }),
    ),
  },
  {
    ignores: [
      ".next/**",
      "coverage/**",
      "node_modules/**",
      "apps/**",
      "tsconfig.tsbuildinfo",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@next/next/no-html-link-for-pages": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "no-restricted-syntax": [
        "warn",
        {
          selector: "Literal[value=/text-(3xl|4xl|5xl|6xl) font-(bold|extrabold)/]",
          message:
            "Use .page-title / .hero-title / .metric-value utility class instead of ad-hoc 'text-Nxl font-bold'. Heading scale is governed by the design system — see styles/globals.css.",
        },
      ],
    },
  },
  {
    files: ["**/__tests__/**/*.{ts,tsx}", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: [
      "app/api/**/*.{ts,tsx}",
      "app/actions/**/*.{ts,tsx}",
      "app/**/actions.ts",
      "lib/auth.ts",
      "lib/admin-auth.ts",
      "lib/ai/**/*.ts",
      "lib/env.ts",
      "proxy.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];

export default eslintConfig;
