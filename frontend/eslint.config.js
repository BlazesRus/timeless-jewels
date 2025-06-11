// eslint.config.js

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import ts from '@typescript-eslint/eslint-plugin'; //Adds support for typescript
import tsEslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';
//import eslintConfigPrettierFlat from "eslint-config-prettier/flat";

export default [
  js.configs.recommended,
  ...tsEslint.configs.strict,
  ...svelte.configs['flat/recommended'],
  eslintPluginPrettierRecommended, // must be last to override conflicting rules.
  {
    ignores: [
      '*/*.env',
      '*/.DS_Store',
      '**/*.env.*',
      '**/.git',
      '**/.vercel',
      '.svelte-kit', // Ensure this line is present to ignore the kit folder at root
      '**/.svelte-kit', // Ensure this line is present to ignore kit folders in subdirectories
      '.svelte-kit/**', // Ensure all contents of the kit folder are ignored
      '**/.svelte-kit/**', // Ensure all contents of kit folders in subdirectories are ignored
      '**/build',
      '**/package',
      '**/node_modules',
      '**/postcss.config.js',
      '**/tsconfig.tsbuildinfo',
      'src/wasm_exec.d.ts'
    ]
  },
  {
    ignores: ['**/postcss.config.js', '**/tsconfig.tsbuildinfo', '*.config.js', 'wasm_exec.js', '**/wasm_exec.d.ts'],
    languageOptions: {
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020
      },
      globals: {
        // --- Browser DOM globals ---
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

        // --- Node.js globals ---
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        global: 'readonly',

        // --- Timers ---
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',

        // --- Standard JS globals ---
        Promise: 'readonly',

        // --- Event types (Svelte 5 & browser) ---
        ClipboardEvent: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        PointerEvent: 'readonly',
        WheelEvent: 'readonly',
        CustomEvent: 'readonly',
        DataTransfer: 'readonly',
        Window: 'readonly',

        // --- Go WASM global (from wasm_exec.js) ---
        Go: 'readonly',

        // --- Browser API globals ---
        navigator: 'readonly'
        // Add more as needed for your project
      }
    },
    //settings: {
    //  'svelte3/typescript': () => require('typescript'),
    //  'svelte3/ignore-warnings': ({ code }) => code === 'missing-declaration'
    //},
    rules: {
      //semi: ['warn', 'always'],
      //quotes: ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      //'@typescript-eslint/sort-type-constituents': 'error',
      'sort-imports': [
        'off',
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
    ignores: ['**/*.svelte.ts'],
    languageOptions: {
      parser: svelteParser, // Set the Svelte parser
      parserOptions: {
        parser: '@typescript-eslint/parser', // Use the TypeScript parser
        //project: './tsconfig02.json', // Specify your tsconfig.json file
        svelteFeatures: {
          // Enable features specific to Svelte 5
          experimentalGenerics: true // Optional: If using generics
        },
        extraFileExtensions: ['.svelte', '.svelte.js']
      }
    },
    settings: {
      svelte: {}
    },
    rules: {
      'no-nested-ternary': 'error',
      'no-cond-assign': ['error', 'always'],
      'no-console': 'off',
      'svelte/no-target-blank': 'error',
      'svelte/no-at-debug-tags': 'error',
      'svelte/no-reactive-functions': 'error',
      'svelte/no-reactive-literals': 'error',
      // Disable React/JSX rules that may leak in
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-key': 'off',
      'react/jsx-no-undef': 'off',
      'react/jsx-uses-vars': 'off',
      // Disable Prettier for Svelte files to avoid JSX parser errors
      'prettier/prettier': 'off'
    }
  },
  {
    files: ['**/*.svelte.ts'],
    languageOptions: {
      parser: svelteParser, // Set the Svelte parser
      parserOptions: {
        parser: '@typescript-eslint/parser', // Use the TypeScript parser
        //project: './tsconfig02.json', // Specify your tsconfig.json file
        svelteFeatures: {
          // Enable features specific to Svelte 5
          experimentalGenerics: true // Optional: If using generics
        },
        extraFileExtensions: ['.svelte.ts']
      }
    },
    plugins: {
      'eslint-plugin-svelte': svelte,
      '@typescript-eslint': ts // Include the TypeScript plugin
    },
    settings: {
      svelte: {}
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
    files: ['src/lib/**/*.ts', '**/src/routes/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // Do not use project mode for lib files, disables type-aware linting for these files
      }
    },
    plugins: {
      '@typescript-eslint': ts
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
    ignores: ['**/src/lib/**/*', '**/src/routes/**/*'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
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
