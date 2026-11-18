import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  workers: 2,
  retries: 0,
  reporter: [['line'], ['html', { outputFolder: '../../../.artifacts/ai-apps/report', open: 'never' }]],
  outputDir: '../../../.artifacts/ai-apps/test-results',
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 1000 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'angular-app', use: { baseURL: 'http://127.0.0.1:4548' } },
    { name: 'react-app', use: { baseURL: 'http://127.0.0.1:4549' } },
  ],
  webServer: {
    command: 'node packages/test/ai-app/servers.mjs',
    cwd: '../../..',
    url: 'http://127.0.0.1:4550/health',
    reuseExistingServer: false,
  },
})
