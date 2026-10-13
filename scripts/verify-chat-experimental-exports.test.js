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
    import: './dist/experimental.js',
  })
  assert.equal(packageJson.exports?.['./experimental.css'], './dist/experimental.css')
  assert.equal(packageJson.exports?.['./dist/*'], './dist/*')

  for (const target of [
    'dist/index.js',
    'dist/index.d.ts',
    'dist/experimental.js',
    'dist/experimental.d.ts',
    'dist/experimental.css',
  ]) {
    assert.equal(fs.existsSync(path.join(packageDir, target)), true, `missing built export target: ${target}`)
  }
})

test('does not expose temporary workflow files', () => {
  assert.deepEqual(packageJson.files, ['dist', 'README*'])

  for (const [subpath, target] of Object.entries(packageJson.exports ?? {})) {
    assert.doesNotMatch(subpath, /superpowers|specs|plans/)
    assert.doesNotMatch(JSON.stringify(target), /superpowers|specs|plans/)
  }
})

test('keeps experimental declarations framework-neutral and internally resolvable', () => {
  const distDir = path.join(packageDir, 'dist')
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
