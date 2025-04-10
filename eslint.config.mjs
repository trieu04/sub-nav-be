import antfu from "@antfu/eslint-config";

export default antfu({
  type: "app",
  stylistic: {
    semi: true,
    indent: 2,
    quotes: "double",
  },
  typescript: {
    overrides: {
      "ts/consistent-type-imports": "off",
      "perfectionist/sort-imports": "off",
      "perfectionist/sort-named-imports": "off",
      "node/prefer-global/process": "off",
    },
  },
  jsonc: {
    overrides: {
      "jsonc/sort-keys": "off",
    },
  },
});
