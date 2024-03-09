// @ts-check

const { defineConfig } = require("eslint-define-config");

module.exports = defineConfig({
  extends: "plugin:@bam.tech/recommended",
  rules: {
    "react-native/no-inline-styles": "off",
    "import/no-unresolved": "off", // doesn't play well with TS project references
    "unused-imports/no-unused-vars": [
      "error",
      { ignoreRestSiblings: true, varsIgnorePattern: "_", argsIgnorePattern: "^_" },
    ],
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          ["^\\u0000"], // side effect imports
          ["^@?\\w"], // packages
          ["^@vzr/"], // vzr packages
          ["^#"], // internal imports
          ["^[^.]"], // everything else
          ["^\\."], // relative imports
        ],
      },
    ],
  },
});
