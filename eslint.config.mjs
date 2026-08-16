import js from "@eslint/js"
import tsPlugin from "typescript-eslint"
import nextPlugin from "@next/eslint-plugin-next"
import reactHooks from "eslint-plugin-react-hooks"

const eslintConfig = [
  // Base JS recommendations
  js.configs.recommended,

  // TypeScript plugin (non-type-checked recommended config)
  ...tsPlugin.configs.recommended,

  // Next.js plugin rules
  {
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  // React Hooks plugin
  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Project-wide rule relaxations (matches the existing codebase style)
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
    },
  },

  // Apply React/JSX parser options to source files
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },

  // Don't lint generated/vendored code
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "skills/**",
      "scripts/**",
      "public/**",
      "db/**",
      "prisma/migrations/**",
    ],
  },
]

export default eslintConfig
