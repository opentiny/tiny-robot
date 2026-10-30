import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: true,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4400',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'vite --host 127.0.0.1 --port 4400',
    url: 'http://127.0.0.1:4400',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
