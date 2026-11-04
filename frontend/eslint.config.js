import js from "@eslint/js";
import globals from "globals";
import hooks from "eslint-plugin-react-hooks";
import refresh from "eslint-plugin-react-refresh";
export default [
  { ignores: ["dist/**", "playwright-report/**", "test-results/**"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { "react-hooks": hooks, "react-refresh": refresh },
    rules: {
      ...hooks.configs.recommended.rules,
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z]" }],
      "react-refresh/only-export-components": "off",
    },
  },
];
