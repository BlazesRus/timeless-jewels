// eslint.config.js - Modern Mode (Svelte 5 + ESLint 9.x)

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import tsEslint from 'typescript-eslint';

// Common rules used across file types
const commonRules = {
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
  'array-bracket-newline': ['error', { multiline: true }],
  'brace-style': 'error',
  'no-shadow': 'error',
  'no-use-before-define': 'error',
  'dot-notation': 'error'
};

const commonTypeScriptRules = {
  // Removed strict ban-ts-comment rule to match legacy config approach
  // Legacy config uses default @typescript-eslint/recommended settings
};

export default [
  js.configs.recommended,
  ...tsEslint.configs.recommended, // Changed from strict to recommended to match legacy config
  ...svelte.configs['flat/recommended'],
  eslintPluginPrettierRecommended, // must be last to override conflicting rules.

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
      '**/postcss.config.js',
      '**/tsconfig.tsbuildinfo',
      'src/wasm_exec.d.ts',
      'wasm_exec.js',
      // Configuration files - excluded from linting and formatting
      'package.json',
      'Svelte5Package.json', 
      'LegacyPackage.json',
      '**/*.config.js',
      '**/*.config.cjs',
      '**/*.config.ts'
    ]
  }, // General configuration for all files
  {
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
  }, // Svelte files configuration
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.svelte']
      }
    },
    rules: {
      ...commonRules,
      'no-console': 'off',

      // Svelte 5 specific rules
      'svelte/no-target-blank': 'error',

      // Disable formatting conflicts in Svelte files
      'prettier/prettier': 'off', // Let svelte-eslint handle Svelte formatting

      // Disable React rules that leak into Svelte
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-key': 'off',
      'react/jsx-no-undef': 'off',
      'react/jsx-uses-vars': 'off',

      // Svelte 5 runes compatibility
      'svelte/valid-compile': 'off', // Allow compatibility mode
      'svelte/no-unused-svelte-ignore': 'warn'
    }
  }, // TypeScript files with type-aware linting
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['src/lib/**/*', 'src/routes/**/*'], // Exclude lib and routes for performance
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    rules: {
      ...commonRules,
      ...commonTypeScriptRules
    }
  },

  // TypeScript files without type-aware linting (for performance)
  {
    files: ['src/lib/**/*.ts', 'src/routes/**/*.ts'],
    rules: {
      ...commonRules,
      ...commonTypeScriptRules
    }
  }
];
