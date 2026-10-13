import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const root = resolve(import.meta.dirname, '..')
const manifestPath = resolve(root, 'docs/demos/chat-experimental/examples.json')
const expected = [
  'basic',
  'layout-presets',
  'welcome-prompts',
  'sender-options',
  'bubble-options',
  'runtime-error',
  'history-groups',
  'slots-basic',
  'right-aside-panel',
  'floating-layout',
  'responsive-layout',
  'controlled-ui',
  'runtime-actions',
  'runtime-before-send',
  'runtime-composer',
  'runtime-conversations',
  'runtime-send',
  'runtime-adapter',
]

test('keeps the exact experimental example inventory and baseline references', () => {
  assert.equal(existsSync(manifestPath), true, 'missing experimental example manifest')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

  assert.deepEqual(
    manifest.map((example) => example.id),
    expected,
  )
  assert.equal(new Set(manifest.map((example) => example.id)).size, expected.length)

  for (const example of manifest) {
    assert.equal(example.baseline, `../chat/${example.id}.vue`)
    assert.equal(existsSync(resolve(root, 'docs/demos/chat-experimental', example.module)), true, example.id)
    assert.equal(existsSync(resolve(root, 'docs/demos/chat', `${example.id}.vue`)), true, `${example.id} baseline`)
  }
})

test('publishes the experiment page and navigation entry', () => {
  const page = readFileSync(resolve(root, 'docs/src/experiments/chat-web-component.md'), 'utf8')
  const theme = readFileSync(resolve(root, 'docs/.vitepress/themeConfig.ts'), 'utf8')

  assert.match(page, /@opentiny\/tiny-robot-chat\/experimental/)
  assert.match(page, /experimental\.css/)
  assert.match(page, /ChatExperimentalGallery/)
  assert.match(theme, /\/experiments\/chat-web-component/)
})
