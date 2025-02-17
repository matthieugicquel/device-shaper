// @ts-check

import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tsPlugin from "typescript-eslint";

import importsConfig from "./imports.eslint.config.js";

export default [
  js.configs.recommended,
  ...tsPlugin.configs.recommended,
  prettier,
  {
    ignores: ["**/.cache", "**/coverage", "**/dist", "**/node_modules"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.node,
        JSX: true,
        NodeJS: true,
      },
      parser: tsPlugin.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin.plugin,
    },
    rules: {
      "no-var": "error",
      eqeqeq: "error",
      "no-constant-binary-expression": "error",
      "no-else-return": "error",
      "require-await": "error",
      "no-nested-ternary": "error",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/indent": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "no-return-await": "error",
      "array-callback-return": "error",
      "no-negated-condition": "error",
      curly: ["error", "multi-line"], // add braces around expressions that are multiline
      "prefer-arrow-callback": ["error", { allowNamedFunctions: true }],
      "func-style": ["error", "expression"],
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "*", next: "return" },
      ],
      "no-constant-condition": "error",
      // ☢️ Rules that require type information must be added to the `.ts` overrides section below
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "no-return-await": "off",
      "@typescript-eslint/return-await": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/require-array-sort-compare": ["error"],
      "@typescript-eslint/no-unnecessary-template-expression": "error",
      "@typescript-eslint/no-misused-spread": "error",
    },
  },
  ...importsConfig,
];
