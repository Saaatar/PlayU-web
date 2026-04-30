import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["node_modules/", "dist/"]),

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    name: "infra/typescript-typed-rules",
    files: ["/*.ts", "/.mts", "**/.cts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json", // Aquí le damos el mapa de tipos
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "prefer-const": "error",
    },
  },
  {
    name: "infra/general-rules",
    rules: {
      semi: ["error", "always"],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
]);
