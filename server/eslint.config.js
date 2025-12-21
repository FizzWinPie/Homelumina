import js from "@eslint/js";
import { globalIgnores } from "eslint/config";

export default [
  globalIgnores(["coverage", "node_modules", "dist"]),
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        process: "readonly",
        __dirname: "readonly",
        module: "writable",
        require: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "error",
      "no-unused-labels": "error"
    }
  }
]; 