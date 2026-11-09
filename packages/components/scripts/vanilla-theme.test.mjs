import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const componentRoot = fileURLToPath(new URL('../', import.meta.url))
const stale = '/* stale theme fixture */\n'

function fixture(t) {
  const directory = mkdtempSync(join(realpathSync(tmpdir()), 'vanilla-theme-test-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const root = join(directory, 'real')
  mkdirSync(join(root, 'scripts'), { recursive: true })
  mkdirSync(join(root, 'src', 'styles'), { recursive: true })
  cpSync(join(componentRoot, 'scripts', 'vanilla-theme.mjs'), join(root, 'scripts', 'vanilla-theme.mjs'))
  cpSync(join(componentRoot, 'src', 'styles', 'variables.css'), join(root, 'src', 'styles', 'variables.css'))
  cpSync(join(componentRoot, 'src', 'vanilla'), join(root, 'src', 'vanilla'), { recursive: true })
  symlinkSync(join(componentRoot, 'node_modules'), join(root, 'node_modules'), 'dir')
  const linked = join(directory, 'linked')
  symlinkSync(root, linked, 'dir')
  const target = join(root, 'src', 'vanilla', 'theme', 'defaults.css')
  writeFileSync(target, stale)
  return { root, linked, target }
}

function node(...args) {
  const result = spawnSync(process.execPath, args, { encoding: 'utf8' })
  assert.ifError(result.error)
  return result
}

for (const entry of ['root', 'linked']) {
  test(`theme CLI checks and generates through ${entry} paths`, (t) => {
    const paths = fixture(t)
    const script = join(paths[entry], 'scripts', 'vanilla-theme.mjs')
    const check = node(script, '--check')
    assert.equal(check.status, 1, check.stderr)
    assert.match(check.stderr, /Vanilla theme is stale/)
    assert.equal(readFileSync(paths.target, 'utf8'), stale, '--check must not rewrite the theme')
    const generate = node(script)
    assert.equal(generate.status, 0, generate.stderr)
    assert.notEqual(readFileSync(paths.target, 'utf8'), stale)
    const freshCheck = node(script, '--check')
    assert.equal(freshCheck.status, 0, freshCheck.stderr)
  })
}

test('importing the theme module without a CLI entry does not generate files', (t) => {
  const paths = fixture(t)
  const url = pathToFileURL(join(paths.linked, 'scripts', 'vanilla-theme.mjs')).href
  const imported = node('--input-type=module', '-e', `await import(${JSON.stringify(url)})`)
  assert.equal(imported.status, 0, imported.stderr)
  assert.equal(readFileSync(paths.target, 'utf8'), stale)
})

test('importing from another script does not run the theme CLI', (t) => {
  const paths = fixture(t)
  const runner = join(paths.root, 'importer.mjs')
  writeFileSync(runner, "import './scripts/vanilla-theme.mjs'\n")
  const imported = node(runner, '--check')
  assert.equal(imported.status, 0, imported.stderr)
  assert.equal(readFileSync(paths.target, 'utf8'), stale)
})
