import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  // Accessibility guardrail. The full jsx-a11y recommended set is enabled at its
  // native severity (errors) on top of the subset eslint-config-next ships. The
  // codebase was swept clean against it (associated every admin-form <label>,
  // made the interview-preview controls keyboard-accessible), so this now blocks
  // regressions in CI. Dynamic checks (contrast, keyboard flows, screen readers)
  // still need a running app. The plugin is already registered by
  // eslint-config-next, so we only set rules here.
  {
    files: ["app/**/*.{ts,tsx,jsx}", "components/**/*.{ts,tsx,jsx}"],
    rules: jsxA11y.flatConfigs.recommended.rules,
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
