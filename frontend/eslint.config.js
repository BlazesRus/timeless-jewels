// eslint.config.js
import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";//Adds support for svelte files
import ts from "@typescript-eslint/eslint-plugin";//Adds support for typescript
import globals from "globals";

export default [
  {
    ignores: [
      ".env",
      ".DS_Store",
      ".env.*",
      ".git",
      ".vercel",
      ".svelte-kit",
      "build",
      "/package",
      "node_modules",
      "postcss.config.js",
      "tsconfig.tsbuildinfo",
    ]
  },
  js.configs.recommended,// Use the ESLint's recommended JavaScript rules as base ruleset
  {
    files: ["**/*.svelte", "**/*.svelte.js", "**/*.svelte.ts"], // Specify Svelte file extensions
    languageOptions: {
      parser: svelteParser, // Set the Svelte parser
      parserOptions: {
        parser: "@typescript-eslint/parser", // Use the TypeScript parser
        svelteFeatures: {
          // Enable features specific to Svelte 5
          experimentalGenerics: true, // Optional: If using generics
        },
        extraFileExtensions: [".svelte", ".svelte.js", ".svelte.ts"],
      },
    },
  },
  // TypeScript recommended rules are not included here because they use 'extends', which is not supported in flat config.
  // You can manually add any @typescript-eslint rules you want below.
  {
    files: ["**/*.svelte", "**/*.svelte.js", "**/*.svelte.ts"],
    rules: {
      'no-undef': 'off',
      'array-callback-return': 'error',
      'no-constant-binary-expression': 'error',
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unreachable-loop': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'block-scoped-var': 'error',
      curly: ['error', 'all'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-var': 'error',
      'one-var': ['error', 'never'],
      'prefer-arrow-callback': 'error',
      'prefer-const': 'error',
      yoda: 'error',
      'array-bracket-newline': [
        'error',
        {
          multiline: true
        }
      ],
      'brace-style': 'error',
      'no-shadow': 'error',
      'no-use-before-define': 'error',
      'dot-notation': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': 'allow-with-description',
          'ts-nocheck': 'allow-with-description',
          'ts-check': true,
          'minimumDescriptionLength': 3
        }
      ]
    },
    plugins: {
      "@typescript-eslint": ts, // Include the TypeScript plugin
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020, // Or your preferred ES version
      },
    },
  }
];
