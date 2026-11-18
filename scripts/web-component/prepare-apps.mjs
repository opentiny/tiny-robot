import path from 'node:path'
import { root } from './projects.mjs'
import { packCandidate } from './candidate.mjs'
import { installCandidate, run } from './prepare.mjs'
import { copyAppForTest, testProjectsRoot } from '../../packages/test/ai-app/projects.mjs'

if (!process.argv.includes('--skip-build')) run('pnpm', ['build:components'])
const candidate = packCandidate(root)
for (const host of ['angular', 'react']) {
  const project = path.join(testProjectsRoot, host)
  copyAppForTest(path.join(root, `examples/tr-chat-app-${host}`), project)
  installCandidate(project, candidate)
  console.log(`[${host}] 测试副本已准备，候选包 ${candidate.id}`)
}
