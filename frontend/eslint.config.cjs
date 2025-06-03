import { defineConfig, globalIgnores } from 'eslint/config';
import tsParser from '@typescript-eslint/parser';
import svelte5 from 'eslint-plugin-svelte';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import typescript from 'typescript';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default defineConfig([
  {
    languageOptions: {
      parser: tsParser,
      sourceType: 'module',
      ecmaVersion: 2020,
      parserOptions: {},

      globals: {
        ...globals.browser,
        ...globals.node
      }
    },

    extends: compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'),

    plugins: {
      svelte5,
      '@typescript-eslint': typescriptEslint
    },

    settings: {
      'svelte5/typescript': () => typescript,

      'svelte5/ignore-warnings': ({ code }) => code === 'missing-declaration'
    },

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
    }
  },
  globalIgnores(['**/*.cjs']),
  {
    files: ['**/*.svelte', "**/.svelte-kit", "**/gh-pages"],
    processor: 'svelte5/svelte5'
  },
  globalIgnores([
    '**/.DS_Store',
    '**/node_modules',
    'build',
    '.svelte-kit',
    'package',
    '**/.env',
    '**/.env.*',
    '!**/.env.example',
    '**/pnpm-lock.yaml',
    '**/package-lock.json',
    '**/yarn.lock',
    'src/wasm_exec.js'
  ])
]);
