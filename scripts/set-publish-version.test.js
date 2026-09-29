import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { PUBLISH_PACKAGES } from './publish-version-utils.js'
import { setPublishVersion } from './set-publish-version.js'
function createFixture({ version = '0.5.1', mutate, bomPath } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tiny-robot-set-version-'))
  for (const [name, relativePath] of PUBLISH_PACKAGES) {
    const packageJson = mutate ? mutate({ name, version, metadata: { version: 'nested' } }, name, relativePath) : { name, version, metadata: { version: 'nested' } }
    const packageFile = path.join(root, relativePath)
    fs.mkdirSync(path.dirname(packageFile), { recursive: true })
    const prefix = relativePath === bomPath ? '\ufeff' : ''
    fs.writeFileSync(packageFile, prefix + JSON.stringify(packageJson, null, 2) + '\n', 'utf8')
  }
  return root
}
function snapshots(root) {
  return Object.fromEntries(PUBLISH_PACKAGES.map(([, relativePath]) => [relativePath, fs.readFileSync(path.join(root, relativePath), 'utf8')]))
}
function cleanup(root) {
  fs.rmSync(root, { recursive: true, force: true })
}
test('updates all public packages and preserves unrelated JSON content', () => {
  const root = createFixture({ bomPath: 'packages/chat/package.json' })
  try {
    const result = setPublishVersion({ rootDir: root, version: '0.5.2' })
    assert.deepEqual(result, { version: '0.5.2', distTag: 'latest', updated: 5 })
    for (const [name, relativePath] of PUBLISH_PACKAGES) {
      const raw = fs.readFileSync(path.join(root, relativePath), 'utf8')
      const packageJson = JSON.parse(raw.replace(/^\ufeff/, ''))
      assert.equal(packageJson.name, name)
      assert.equal(packageJson.version, '0.5.2')
      assert.equal(packageJson.metadata.version, 'nested')
      assert.equal(raw.endsWith('\n'), true)
    }
    assert.equal(fs.readFileSync(path.join(root, 'packages/chat/package.json'), 'utf8').charCodeAt(0), 0xfeff)
  } finally {
    cleanup(root)
  }
})
test('rejects unusable npm dist-tags without changing files', () => {
  const root = createFixture()
  try {
    const before = snapshots(root)
    assert.throws(() => setPublishVersion({ rootDir: root, version: '0.5.2-0' }), /unusable npm dist-tag.*0/)
    assert.deepEqual(snapshots(root), before)
  } finally {
    cleanup(root)
  }
})
test('repairs an invalid current version when the target version is valid', () => {
  const root = createFixture({ version: 'invalid-version' })
  try {
    assert.equal(setPublishVersion({ rootDir: root, version: '0.5.2-alpha.1' }).updated, 5)
    for (const [, relativePath] of PUBLISH_PACKAGES) {
      const packageJson = JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'))
      assert.equal(packageJson.version, '0.5.2-alpha.1')
    }
  } finally {
    cleanup(root)
  }
})
test('validates every package before writing any file', () => {
  const root = createFixture({ mutate(packageJson, name) { if (name === '@opentiny/tiny-robot-chat') packageJson.name = '@wrong/name'; return packageJson } })
  try {
    const before = snapshots(root)
    assert.throws(() => setPublishVersion({ rootDir: root, version: '0.5.2' }), /must describe @opentiny\/tiny-robot-chat/)
    assert.deepEqual(snapshots(root), before)
  } finally {
    cleanup(root)
  }
})
test('rolls back files when a later write fails', () => {
  const root = createFixture()
  try {
    const before = snapshots(root)
    let writes = 0
    const writeFile = (file, content, encoding) => {
      writes += 1
      if (writes === 3) throw new Error('simulated write failure')
      fs.writeFileSync(file, content, encoding)
    }
    assert.throws(() => setPublishVersion({ rootDir: root, version: '0.5.2', writeFile }), /Failed to update package versions: simulated write failure.*restored/)
    assert.deepEqual(snapshots(root), before)
  } finally {
    cleanup(root)
  }
})
