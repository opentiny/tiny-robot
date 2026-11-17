import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'
import { root, hosts } from '../../../scripts/web-component/projects.mjs'

const development = process.env.WC_SERVE_MODE === 'dev'
const artifact = development ? '.artifacts/web-component/development' : '.artifacts/web-component'
const port = (host: (typeof hosts)[number]) => (development ? host.devPort : host.testPort)
const selected = hosts.filter((host) => !process.env.WC_HOSTS || process.env.WC_HOSTS.split(',').includes(host.id))
export default defineConfig({
  testDir: '.',
  metadata: { candidate: process.env.WC_CANDIDATE_ID ?? '未准备', mode: development ? 'development' : 'production' },
  testMatch: '**/*.spec.ts',
  forbidOnly: !!process.env.CI,
  workers: 3,
  retries: 0,
  reporter: [
    ['line'],
    ['html', { outputFolder: path.join(root, artifact, 'report'), open: 'never' }],
    ['json', { outputFile: path.join(root, artifact, 'results.json') }],
  ],
  outputDir: path.join(root, artifact, 'test-results'),
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 1080 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: selected.map((host) => ({
    name: host.id,
    testMatch: ['common/**/*.spec.ts', `${host.id}/**/*.spec.ts`],
    use: { baseURL: `http://127.0.0.1:${port(host)}` },
  })),
  webServer: selected.map((host) => ({
    command: development ? 'pnpm dev' : `node scripts/web-component/serve.mjs ${host.id}`,
    cwd: development ? path.join(root, host.directory) : root,
    env: { NG_BUILD_MAX_WORKERS: '2' },
    url: `http://127.0.0.1:${port(host)}/candidate.json`,
    reuseExistingServer: false,
    timeout: 90000,
  })),
})
