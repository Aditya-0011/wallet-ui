import { registerHooks } from "node:module";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "typescript" || specifier.startsWith("typescript/")) {
      return nextResolve(
        specifier.replace(/^typescript/, "@typescript/typescript6"),
        context,
      );
    }
    return nextResolve(specifier, context);
  },
});

const { default: js } = await import("@eslint/js");
const { default: reactHooks } = await import("eslint-plugin-react-hooks");
const { default: reactRefresh } = await import("eslint-plugin-react-refresh");
const { default: tseslint } = await import("typescript-eslint");
const { default: pluginQuery } = await import("@tanstack/eslint-plugin-query");

export default defineConfig([
  ...pluginQuery.configs["flat/recommended"],
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],
    },
  },
]);
