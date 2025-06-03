const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const tsParser = require("@typescript-eslint/parser");
const svelte3 = require("eslint-plugin-svelte3");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const globals = require("globals");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        parser: tsParser,
        sourceType: "module",
        ecmaVersion: 2020,
        parserOptions: {},

        globals: {
            ...globals.browser,
            ...globals.node,
        },
    },

    extends: compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"),

    plugins: {
        svelte3,
        "@typescript-eslint": typescriptEslint,
    },

    settings: {
        "svelte3/typescript": () => require("typescript"),

        "svelte3/ignore-warnings": (
            {
                code,
            },
        ) => code === "missing-declaration",
    },

    rules: {
        "no-undef": "off",
        "array-callback-return": "error",
        "no-constant-binary-expression": "error",
        "no-self-compare": "error",
        "no-template-curly-in-string": "error",
        "no-unmodified-loop-condition": "error",
        "no-unreachable-loop": "error",
        "arrow-body-style": ["error", "as-needed"],
        "block-scoped-var": "error",
        curly: ["error", "all"],
        "no-eval": "error",
        "no-implied-eval": "error",
        "no-var": "error",
        "one-var": ["error", "never"],
        "prefer-arrow-callback": "error",
        "prefer-const": "error",
        yoda: "error",

        "array-bracket-newline": ["error", {
            multiline: true,
        }],

        "brace-style": "error",
        "no-shadow": "error",
        "no-use-before-define": "error",
        "dot-notation": "error",
    },
}, globalIgnores(["**/*.cjs"]), {
    files: ["**/*.svelte"],
    processor: "svelte3/svelte3",
}, globalIgnores([
    "**/.DS_Store",
    "**/node_modules",
    "build",
    ".svelte-kit",
    "package",
    "**/.env",
    "**/.env.*",
    "!**/.env.example",
    "**/pnpm-lock.yaml",
    "**/package-lock.json",
    "**/yarn.lock",
    "src/wasm_exec.js",
])]);
