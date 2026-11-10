import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { PUBLISH_PACKAGES } from './publish-version-utils.js'

const script = fileURLToPath(new URL('./prepare-publish-readmes.js', import.meta.url))

function createFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tiny-robot-publish-readmes-'))
  t.after(() => fs.rmSync(root, { recursive: true, force: true }))

  fs.writeFileSync(path.join(root, 'README.md'), '# TinyRobot\n')
  fs.writeFileSync(path.join(root, 'README.zh-CN.md'), '# TinyRobot 中文文档\n')

  for (const [name, manifest] of PUBLISH_PACKAGES) {
    const directory = path.join(root, path.dirname(manifest))
    fs.mkdirSync(directory, { recursive: true })
    fs.writeFileSync(path.join(root, manifest), JSON.stringify({ name, version: '1.0.0', files: ['README*', 'docs'] }))
    if (name !== '@opentiny/tiny-robot') {
      fs.writeFileSync(path.join(directory, 'README.md'), `# ${name}\n`)
    }
  }

  return root
}

function runPreparation(root) {
  return spawnSync(process.execPath, [script], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, npm_config_cache: path.join(root, 'npm-cache') },
  })
}

test('prepares both component READMEs in a fresh publish checkout', (t) => {
  const root = createFixture(t)
  const result = runPreparation(root)

  assert.equal(result.status, 0, result.stderr)
  assert.equal(fs.readFileSync(path.join(root, 'packages/components/README.md'), 'utf8'), '# TinyRobot\n')
  assert.equal(
    fs.readFileSync(path.join(root, 'packages/components/README.zh-CN.md'), 'utf8'),
    '# TinyRobot 中文文档\n',
  )
})

test('blocks publishing a package that only ships a nested README', (t) => {
  const root = createFixture(t)
  const chat = path.join(root, 'packages/chat')
  fs.mkdirSync(path.join(chat, 'docs'))
  fs.renameSync(path.join(chat, 'README.md'), path.join(chat, 'docs/README.md'))

  const result = runPreparation(root)

  assert.equal(result.status, 1)
  assert.match(result.stderr, /@opentiny\/tiny-robot-chat.*root README\.md/)
})
