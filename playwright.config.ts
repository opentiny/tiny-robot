import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4175',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: process.env.TEST_PREVIEW ? 'pnpm preview' : 'pnpm dev',
    url: 'http://127.0.0.1:4175',
    reuseExistingServer: false,
    env: { DASHSCOPE_API_KEY: '' },
  },
})
