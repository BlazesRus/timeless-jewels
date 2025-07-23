// eslint.config.js - Modern Mode (Svelte 5 + ESLint 9.x + Tailwind)

import js from "@eslint/js";
import css from "@eslint/css";
import { tailwind4 } from "tailwind-csstree";
import svelte from "eslint-plugin-svelte";
import prettier from "eslint-config-prettier";
import globals from "globals";
import ts from "typescript-eslint";

// Common rules used across file types
const commonRules = {
  'no-undef': 'off',
  'no-console': 'off',
  'no-var': 'error',
  'prefer-const': 'error',
  'prefer-arrow-callback': 'error'
};

export default [
  // CSS configuration FIRST (Microsoft Copilot recommendation)
  {
    files: ["**/*.css"],
    language: "css/css",
    plugins: { 
      css
    },
    rules: {
      // Only CSS-specific rules - disable no-invalid-properties to allow theme()
      "css/no-invalid-properties": "off", // Microsoft Copilot recommendation for theme()
      "css/no-empty-blocks": "error",
      "css/no-duplicate-imports": "error"
    }
  },  // Base JavaScript/TypeScript configuration for non-CSS, non-Svelte files
  {
    files: ["**/*.js", "**/*.ts"],
    ...js.configs.recommended,
    ...ts.configs.recommended[0],
    languageOptions: {
      parser: ts.parser,
      parserOptions: {
        project: './tsconfig.json'
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      ...commonRules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  // Svelte configuration
  ...svelte.configs['flat/recommended'],
  // Svelte TypeScript configuration
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        extraFileExtensions: ['.svelte']
      }
    },
    rules: {
      ...commonRules,
      // Tailwind-compatible style handling
      'svelte/valid-style-parse': 'off',
      'svelte/no-unused-class-name': 'off',
      // Disable React rules that leak into Svelte
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-key': 'off',
      'react/jsx-no-undef': 'off',
      'react/jsx-uses-vars': 'off',
      // Disable formatting conflicts in Svelte files
      'prettier/prettier': 'off' // Let svelte-eslint handle Svelte formatting
    }
  },
  // Global ignores
  {
    ignores: [
      '**/*.env*',
      '**/.DS_Store',
      '**/.git/**',
      '**/.vercel/**',
      '**/.svelte-kit/**',
      '**/build/**',
      '**/package/**',
      '**/node_modules/**',
      '**/static/**',
      '**/postcss.config.js',
      '**/tsconfig.tsbuildinfo',
      'src/wasm_exec.d.ts',
      'wasm_exec.js',
      // Exclude .svelte.ts files from ESLint to avoid parsing issues
      '**/*.svelte.ts',
      // Configuration files - excluded from linting and formatting
      'package.json',
      'pnpm-lock.yaml',
      '.config-deps/**',
      'version-manager-old.js',
      '**/*.config.js',
      '**/*.config.cjs',
      '**/*.config.ts',
      'svelte.config.js',
      'tailwind.config.cjs',
      'vite.config.js',
      'tsconfig.json',
      'eslint.config.js'
    ]
  },
  // Prettier integration (last to override formatting rules)
  prettier,
  // Project-specific rule overrides
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx", "**/*.svelte"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        URL: 'readonly',
        Image: 'readonly',
        HTMLImageElement: 'readonly',
        CanvasGradient: 'readonly',
        CanvasRenderingContext2D: 'readonly',
        WebAssembly: 'readonly',
        navigator: 'readonly',

        // Node.js globals
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        global: 'readonly',

        // Timers
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',

        // Standard globals
        Promise: 'readonly',

        // Event types
        ClipboardEvent: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        PointerEvent: 'readonly',
        WheelEvent: 'readonly',
        CustomEvent: 'readonly',
        DataTransfer: 'readonly',
        Window: 'readonly',

        // Project specific
        Go: 'readonly' // Go WASM global
      }
    },
    rules: {
      'sort-imports': 'off' // Disabled as it conflicts with prettier
    }
  }
];
