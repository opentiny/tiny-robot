import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:8095",
    locale: "zh-CN",
    viewport: { width: 1440, height: 900 },
    screenshot: "only-on-failure",
  },
  reporter: "list",
  workers: 1,
});
