import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const alphaVersion = '1.0.0-alpha.0'

const consumers = [
  {
    name: 'Angular',
    directory: 'packages/angular20-chat-experimental',
    packages: ['@opentiny/tiny-robot-chat', '@opentiny/tiny-robot-kit'],
  },
  {
    name: 'React',
    directory: 'packages/react-chat-experimental',
    packages: ['@opentiny/tiny-robot-chat'],
  },
]

for (const consumer of consumers) {
  test(`${consumer.name} validation app consumes the published alpha packages`, () => {
    const consumerRoot = path.join(repositoryRoot, consumer.directory)
    const manifest = JSON.parse(fs.readFileSync(path.join(consumerRoot, 'package.json'), 'utf8'))

    for (const packageName of consumer.packages) {
      assert.equal(manifest.dependencies[packageName], alphaVersion)

      const packageRoot = fs.realpathSync(path.join(consumerRoot, 'node_modules', packageName))
      const packageManifest = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'))

      assert.equal(packageManifest.version, alphaVersion)
      assert.match(packageRoot, /node_modules\/.pnpm\//)
      assert.doesNotMatch(packageRoot, /packages\/(chat|kit)$/)
    }

    assert.equal(manifest.dependencies.vue, '^3.3.11')
    assert.equal(manifest.dependencies.dompurify, '^3.3.1')
    assert.equal(manifest.dependencies['markdown-it'], '^14.1.0')
    assert.doesNotMatch(manifest.scripts['pretest:e2e'] ?? '', /\.\.\/chat|build:experimental/)
  })
}
