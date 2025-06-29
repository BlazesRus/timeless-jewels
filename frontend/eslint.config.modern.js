import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  prettier,
  ...svelte.configs['flat/prettier'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2023
      }
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        ecmaVersion: 2023,
        sourceType: 'module'
      }
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.svelte'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module'
      }
    },
    rules: {
      // Modern TypeScript and Svelte 5 rules
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^\\$\\$(Props|Events|Slots|Generic)$'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'svelte/no-at-html-tags': 'warn',
      'svelte/valid-compile': 'error'
    }
  },
  {
    // Modern mode specific - exclude legacy files
    ignores: [
      'build/',
      '.svelte-kit/',
      'dist/',
      '**/*Legacy*',
      '**/*legacy*',
      '**/legacy/**',
      '**/Legacy/**'
    ]
  }
];
