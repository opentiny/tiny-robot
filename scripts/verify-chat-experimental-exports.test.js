import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const packageDir = path.join(rootDir, 'packages/chat')
const packageJson = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'))

test('preserves the stable chat exports', () => {
  assert.equal(packageJson.main, './dist/index.js')
  assert.equal(packageJson.module, './dist/index.js')
  assert.equal(packageJson.types, './dist/index.d.ts')
  assert.deepEqual(packageJson.exports?.['.'], {
    types: './dist/index.d.ts',
    import: './dist/index.js',
  })
})

test('publishes the experimental module and stylesheet', () => {
  assert.deepEqual(packageJson.exports?.['./experimental'], {
    types: './dist/experimental.d.ts',
    browser: './dist/experimental.js',
    node: './dist/experimental-node.js',
    import: './dist/experimental.js',
  })
  assert.equal(packageJson.exports?.['./experimental/web-component.css'], './dist/web-component.css')
  assert.equal(packageJson.exports?.['./experimental.css'], undefined)
  assert.equal(packageJson.exports?.['./dist/*'], './dist/*')
})

test('does not expose temporary workflow files', () => {
  assert.deepEqual(packageJson.files, ['dist', 'README*'])

  for (const [subpath, target] of Object.entries(packageJson.exports ?? {})) {
    assert.doesNotMatch(subpath, /superpowers|specs|plans/)
    assert.doesNotMatch(JSON.stringify(target), /superpowers|specs|plans/)
  }
})
