import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const packageDir = path.join(rootDir, 'packages/chat')
const distDir = path.join(packageDir, 'dist')

test('builds every published chat export target', () => {
  for (const target of [
    'dist/index.js',
    'dist/index.d.ts',
    'dist/experimental.js',
    'dist/experimental-node.js',
    'dist/experimental.d.ts',
    'dist/web-component.css',
  ]) {
    assert.equal(fs.existsSync(path.join(packageDir, target)), true, `missing built export target: ${target}`)
  }
})

test('keeps experimental declarations framework-neutral and internally resolvable', () => {
  const declarationFiles = fs
    .readdirSync(distDir, { recursive: true })
    .filter((name) => name.endsWith('.d.ts') && name !== 'index.d.ts')

  for (const name of declarationFiles) {
    assert.doesNotMatch(name, /\.test\.d\.ts$/, `test declaration was published: ${name}`)
    const file = path.join(distDir, name)
    const source = fs.readFileSync(file, 'utf8')
    assert.doesNotMatch(source, /from\s+['"]vue['"]|import\(['"]vue['"]\)/, `${name} exposes Vue types`)

    for (const [, specifier] of source.matchAll(/from\s+['"](\.{1,2}\/[^'"]*|\.{1,2})['"]/g)) {
      const target = path.resolve(path.dirname(file), specifier)
      const packageFile = path.join(target, 'package.json')
      const packageTypes = fs.existsSync(packageFile)
        ? path.resolve(target, JSON.parse(fs.readFileSync(packageFile, 'utf8')).types ?? '')
        : undefined
      const resolves = [`${target}.d.ts`, path.join(target, 'index.d.ts'), packageTypes].some(
        (candidate) => candidate && fs.existsSync(candidate),
      )

      assert.equal(resolves, true, `${name} has an unresolved declaration import: ${specifier}`)
    }
  }
})
