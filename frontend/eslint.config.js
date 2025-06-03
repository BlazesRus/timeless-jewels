// eslint.config.js

import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import tsEslint from 'typescript-eslint';
import ts from '@typescript-eslint/eslint-plugin'; //Adds support for typescript
import tsParser from '@typescript-eslint/parser';
//import eslintConfigPrettierFlat from "eslint-config-prettier/flat";
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...tsEslint.configs.strict,
  ...svelte.configs['flat/recommended'],
  eslintPluginPrettierRecommended, // must be last to override conflicting rules.
  {
    rules: {
      //semi: ['warn', 'always'],
      //quotes: ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      //'@typescript-eslint/sort-type-constituents': 'error',
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: false,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: true
        }
      ]
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser, // Set the Svelte parser
      parserOptions: {
        parser: '@typescript-eslint/parser', // Use the TypeScript parser
        svelteFeatures: {
          // Enable features specific to Svelte 5
          experimentalGenerics: true // Optional: If using generics
        },
        extraFileExtensions: ['.svelte', '.svelte.js'],
      }
    },
    rules: {
      'no-nested-ternary': 'error',
      'no-cond-assign': ['error', 'always'],
      'no-console': 'error',
      'svelte/no-target-blank': 'error',
      'svelte/no-at-debug-tags': 'error',
      'svelte/no-reactive-functions': 'error',
      'svelte/no-reactive-literals': 'error'
    }
  },
  {
    files: ['**/*svelte.ts'],
    languageOptions: {
      parser: svelteParser, // Set the Svelte parser
      parserOptions: {
        parser: '@typescript-eslint/parser', // Use the TypeScript parser
        svelteFeatures: {
          // Enable features specific to Svelte 5
          experimentalGenerics: true // Optional: If using generics
        },
        extraFileExtensions: ['.svelte.ts'],
        project: './tsconfig.json' // Specify your tsconfig.json file
      }
    },
    plugins: {
      'eslint-plugin-svelte': svelte,
      '@typescript-eslint': ts // Include the TypeScript plugin
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
          minimumDescriptionLength: 3
        }
      ]
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
        project: './tsconfig.json' // Specify your tsconfig.json file
      }
    },
    plugins: {
      '@typescript-eslint': ts // Include the TypeScript plugin
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
          minimumDescriptionLength: 3
        }
      ]
    }
  }
];
