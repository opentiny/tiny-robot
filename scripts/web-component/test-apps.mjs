import path from 'node:path'
import { run } from './prepare.mjs'
import { testProjectsRoot } from '../../packages/test/ai-app/projects.mjs'
run(process.execPath, [
  'scripts/web-component/prepare-apps.mjs',
  ...(process.argv.includes('--skip-build') ? ['--skip-build'] : []),
])
run(process.execPath, ['--test', 'examples/tr-chat-app-angular/scripts/env.test.mjs'])
run(process.execPath, ['--experimental-strip-types', '--test', 'packages/test/ai-app/config.test.mjs'])
const env = {
  VITE_QWEN_API_URL: 'http://127.0.0.1:4550/qwen',
  VITE_ALIYUN_DASHSCOPE_KEY: 'local-test-key',
  VITE_DEEPSEEK_API_URL: 'http://127.0.0.1:4550/deepseek',
  VITE_DEEPSEEK_API_KEY: 'local-test-key',
}
for (const host of ['angular', 'react']) {
  const project = path.join(testProjectsRoot, host)
  run('pnpm', ['type-check'], project)
  run('pnpm', [host === 'angular' ? 'build:test' : 'build'], project, { ...env, NG_BUILD_MAX_WORKERS: '2' })
}
run('pnpm', ['-F', 'tiny-robot-test', 'exec', 'playwright', 'test', '-c', 'ai-app/playwright.config.ts'])
