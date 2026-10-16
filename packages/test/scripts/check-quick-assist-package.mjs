import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
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
assert.ok(!metadata.files?.includes('vanilla'), 'The vanilla forwarding directory must not be published')
assert.equal(metadata.types, './dist/index.d.ts')
assert.equal(metadata.exports?.['.']?.types, './dist/index.d.ts')
assert.equal(metadata.exports?.['./vanilla']?.types, './dist/vanilla/index.d.ts')
assert.equal(metadata.exports?.['./vanilla']?.default, './dist/vanilla/index.js')
assert.equal(metadata.exports?.['./vanilla/style.css'], './dist/vanilla/style.css')
assert.equal(metadata.exports?.['./dist/*'], './dist/*')
assert.equal(metadata.exports?.['./package.json'], './package.json')
assert.equal(metadata.typesVersions?.['*']?.vanilla?.[0], 'dist/vanilla/index.d.ts')
await assert.rejects(readFile(new URL('vanilla/package.json', packageURL)), { code: 'ENOENT' })
await readFile(new URL('dist/vanilla/index.d.ts', packageURL))
await readFile(new URL('dist/vanilla/style.css', packageURL))

if (!process.argv[2]) {
  for (const path of [
    '@opentiny/tiny-robot',
    '@opentiny/tiny-robot/dist/style.css',
    '@opentiny/tiny-robot/vanilla',
    '@opentiny/tiny-robot/vanilla/style.css',
    '@opentiny/tiny-robot/dist/container/index.js',
    '@opentiny/tiny-robot/dist/vanilla/vanilla.umd.js',
    '@opentiny/tiny-robot/package.json',
  ])
    assert.ok(require.resolve(path), `Public path did not resolve: ${path}`)
}

// Resolve package subpaths as a consumer would. For an extracted tarball, put
// only a temporary node_modules symlink next to it; no install or network is needed.
let consumerRequire = require
let consumerRoot = fileURLToPath(new URL('../', import.meta.url))
if (process.argv[2]) {
  consumerRoot = await mkdtemp(join(tmpdir(), 'quickassist-package-check-'))
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
  '@opentiny/tiny-robot/dist/vanilla/vanilla.umd.js',
  '@opentiny/tiny-robot/package.json',
])
  assert.ok(consumerRequire.resolve(path), `Published package path did not resolve: ${path}`)

// Native ESM package-name imports must work, not only direct artifact URLs.
execFileSync(
  process.execPath,
  [
    '--input-type=module',
    '-e',
    "import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'; if (typeof createQuickAssist !== 'function') process.exit(1)",
  ],
  { cwd: consumerRoot, stdio: 'pipe' },
)

// Importing the ESM artifact must work without a browser or a Vue runtime.
const esm = await import(new URL('dist/vanilla/index.js', packageURL).href)
assert.equal(typeof esm.createQuickAssist, 'function')
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
