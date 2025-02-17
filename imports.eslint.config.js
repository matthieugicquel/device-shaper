import importPlugin from "eslint-plugin-import";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";
import unusedImportsPlugin from "eslint-plugin-unused-imports";

export default [
  {
    plugins: {
      "simple-import-sort": simpleImportSortPlugin,
      import: importPlugin,
      "unused-imports": unusedImportsPlugin,
    },
    rules: {
      // Standardized import syntax
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/no-var-requires": "off",

      // Auto-remove unused imports
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // Import sorting
      "simple-import-sort/imports": [
        "error",
        {
          groups: [["^\\u0000"], ["^@?\\w"], ["^#std/"], ["^#"], ["^[^.]"], ["^\\."]],
        },
      ],
      "simple-import-sort/exports": "error",
      "import/first": "error",
      "import/no-duplicates": "error",
    },
  },
  {
    files: ["**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
