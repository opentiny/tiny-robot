import { defineConfig } from "vitest/config";
export default defineConfig({
  define: { __API_ORIGIN__: JSON.stringify("https://api.deepseek.com") },
  test: { include: ["tests/unit/**/*.test.ts"] },
});
