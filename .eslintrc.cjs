// @ts-check
const { defineConfig } = require("eslint-define-config");

module.exports = defineConfig({
  ignorePatterns: [
    ".cache", // tsc/eslint/etc cache
    ".yarn", // yarn 3
    "coverage",
    "dist",
    "node_modules",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "./imports.eslintrc.cjs",
    "prettier",
  ],
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
    "no-return-await": "error",
    "array-callback-return": "error",
    // ☢️ Rules that require type information must be added to the `.ts` overrides section below
  },
  env: {
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  overrides: [
    {
      files: ["**/*.ts?(x)"],
      parserOptions: {
        project: "tsconfig.json",
      },
      rules: {
        "no-return-await": "off", // Disable the base rule as it can report incorrect errors
        "@typescript-eslint/return-await": "error",
        "@typescript-eslint/no-floating-promises": "error",
      },
    },
  ],
});
