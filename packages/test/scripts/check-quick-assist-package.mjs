import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, symlink } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'
import vm from 'node:vm'

// Resolve the actual public package, not a source alias. Optional argument lets
// the same check run against an unpacked npm tarball in an isolated directory.
const require = createRequire(import.meta.url)
const packageRoot = process.argv[2]
  ? `${process.argv[2].replace(/\/$/, '')}/`
  : fileURLToPath(new URL('../../components/', import.meta.url))
const packageURL = pathToFileURL(packageRoot)
const metadata = JSON.parse(await readFile(new URL('package.json', packageURL), 'utf8'))
assert.equal(metadata.name, '@opentiny/tiny-robot')
assert.ok(metadata.files?.includes('dist'), 'Published files must include dist')
assert.ok(metadata.files?.includes('vanilla'), 'Published files must include the vanilla bridge')

const bridgeURL = new URL('vanilla/', packageURL)
const bridgeMetadata = JSON.parse(await readFile(new URL('package.json', bridgeURL), 'utf8'))
assert.equal(bridgeMetadata.name, '@opentiny/tiny-robot/vanilla')
assert.equal(bridgeMetadata.main, '../dist/vanilla/index.js')
assert.equal(bridgeMetadata.module, '../dist/vanilla/index.js')
assert.equal(bridgeMetadata.types, '../dist/vanilla/index.d.ts')
assert.equal(bridgeMetadata.style, './style.css')

const bridgeCode = await readFile(new URL('index.js', bridgeURL), 'utf8')
const bridgeTypes = await readFile(new URL('index.d.ts', bridgeURL), 'utf8')
const bridgeCss = await readFile(new URL('style.css', bridgeURL), 'utf8')
assert.ok(bridgeCode.includes("'../dist/vanilla/index.js'"), 'Vanilla JS bridge must target the published ESM artifact')
assert.ok(
  bridgeTypes.includes("'../dist/vanilla/index.d.ts'"),
  'Vanilla types bridge must target the published declaration',
)
assert.ok(
  bridgeCss.includes("@import url('../dist/vanilla/style.css')"),
  'Vanilla CSS bridge must target the published stylesheet',
)
await readFile(new URL('../dist/vanilla/index.d.ts', bridgeURL))
await readFile(new URL('../dist/vanilla/style.css', bridgeURL))

if (!process.argv[2]) {
  for (const path of [
    '@opentiny/tiny-robot',
    '@opentiny/tiny-robot/dist/style.css',
    '@opentiny/tiny-robot/vanilla',
    '@opentiny/tiny-robot/vanilla/style.css',
    '@opentiny/tiny-robot/dist/container/index.js',
  ])
    assert.ok(require.resolve(path), `Public path did not resolve: ${path}`)
}

// Resolve package subpaths as a consumer would. For an extracted tarball, put
// only a temporary node_modules symlink next to it; no install or network is
// needed to validate Node's package-directory bridge resolution.
let consumerRequire = require
if (process.argv[2]) {
  const consumerRoot = await mkdtemp(join(tmpdir(), 'quickassist-package-check-'))
  const scopedModules = join(consumerRoot, 'node_modules', '@opentiny')
  await mkdir(scopedModules, { recursive: true })
  await symlink(fileURLToPath(packageURL), join(scopedModules, 'tiny-robot'), 'dir')
  consumerRequire = createRequire(join(consumerRoot, 'consumer.cjs'))
}
for (const path of [
  '@opentiny/tiny-robot',
  '@opentiny/tiny-robot/dist/style.css',
  '@opentiny/tiny-robot/vanilla',
  '@opentiny/tiny-robot/vanilla/style.css',
  '@opentiny/tiny-robot/dist/container/index.js',
])
  assert.ok(consumerRequire.resolve(path), `Published package path did not resolve: ${path}`)

// Importing the ESM artifact must work without a browser or a Vue runtime.
const esm = await import(new URL('dist/vanilla/index.js', packageURL).href)
assert.equal(typeof esm.createQuickAssist, 'function')
const bridgedEsm = await import(new URL('vanilla/index.js', packageURL).href)
assert.equal(typeof bridgedEsm.createQuickAssist, 'function')
const umd = await readFile(new URL('dist/vanilla/vanilla.umd.js', packageURL), 'utf8')
const sandbox = vm.createContext({})
vm.runInContext(umd, sandbox)
assert.equal(typeof sandbox.TinyRobotVanilla?.createQuickAssist, 'function')
assert.deepEqual(Object.keys(sandbox), ['TinyRobotVanilla'])

const css = await readFile(new URL('dist/vanilla/style.css', packageURL), 'utf8')
assert.ok(css.includes('.tr-quick-assist'), 'Missing scoped QuickAssist CSS')
assert.ok(!/(?:^|\})\s*:root\b/m.test(css), 'QuickAssist CSS must not install global tokens')
await readFile(new URL('dist/vanilla/index.d.ts', packageURL))
console.log('QuickAssist public paths, ESM/UMD import safety, CSS and declarations passed.')
