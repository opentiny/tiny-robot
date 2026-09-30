import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  addFileChange,
  applyChanges,
  ensureDependency,
  getChatFeatureFiles,
  printChangeResults,
  resolveTargetPackage,
} from '../bin/commands/add.js'
import { createRuntimeDependencies } from '../bin/runtime-version.js'
import { listPackages, mergeEnvFile } from '../bin/utils.js'

const DEPENDENCIES = createRuntimeDependencies('0.5.2-alpha.15')

function createTempProject() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'tiny-robot-cli-'))
}

test('add dependencies include vueuse and update stale versions', () => {
  const pkg = { dependencies: { '@opentiny/tiny-robot': '0.4.0' } }

  const updated = ensureDependency(pkg, '@opentiny/tiny-robot', DEPENDENCIES['@opentiny/tiny-robot'])
  const added = ensureDependency(pkg, '@vueuse/core', DEPENDENCIES['@vueuse/core'])
  const skipped = ensureDependency(pkg, '@vueuse/core', DEPENDENCIES['@vueuse/core'])

  assert.equal(updated.type, 'updated')
  assert.equal(added.type, 'added')
  assert.equal(skipped.type, 'skipped')
  assert.equal(pkg.dependencies['@vueuse/core'], '13.9.0')
})

test('add dependencies use the requested runtime version', () => {
  const dependencies = createRuntimeDependencies('0.5.2-rc.3')

  assert.equal(dependencies['@opentiny/tiny-robot'], '0.5.2-rc.3')
  assert.equal(dependencies['@opentiny/tiny-robot-chat'], '0.5.2-rc.3')
  assert.equal(dependencies['@opentiny/tiny-robot-kit'], '0.5.2-rc.3')
  assert.equal(dependencies['@opentiny/tiny-robot-svgs'], '0.5.2-rc.3')
  assert.equal(dependencies['@vueuse/core'], '13.9.0')
})

test('add dependencies preserve compatible ranges and reject unsafe section changes', () => {
  const compatible = { dependencies: { '@vueuse/core': '^13.0.0' } }
  const higher = { dependencies: { '@vueuse/core': '14.0.0' } }
  const devDependency = { devDependencies: { '@vueuse/core': '^13.0.0' } }
  const incompatible = { devDependencies: { '@vueuse/core': '^12.0.0' } }
  const duplicate = { dependencies: { '@vueuse/core': '13.1.0' }, devDependencies: { '@vueuse/core': '13.1.0' } }
  const alias = { dependencies: { '@vueuse/core': 'npm:vueuse-core@13.1.0' } }

  assert.equal(ensureDependency(compatible, '@vueuse/core', DEPENDENCIES['@vueuse/core']).type, 'skipped')
  assert.equal(ensureDependency(higher, '@vueuse/core', DEPENDENCIES['@vueuse/core']).type, 'skipped')
  assert.equal(ensureDependency(devDependency, '@vueuse/core', DEPENDENCIES['@vueuse/core']).type, 'skipped')
  assert.equal(ensureDependency(incompatible, '@vueuse/core', DEPENDENCIES['@vueuse/core']).type, 'conflict')
  assert.equal(ensureDependency(duplicate, '@vueuse/core', DEPENDENCIES['@vueuse/core']).type, 'conflict')
  assert.equal(ensureDependency(alias, '@vueuse/core', DEPENDENCIES['@vueuse/core']).type, 'conflict')
  assert.equal(incompatible.devDependencies['@vueuse/core'], '^12.0.0')
  assert.equal(higher.dependencies['@vueuse/core'], '14.0.0')
})

test('add dependencies preserve an existing range that accepts the stable runtime target', () => {
  const pkg = { dependencies: { '@opentiny/tiny-robot': '^0.5.1' } }

  const result = ensureDependency(pkg, '@opentiny/tiny-robot', '^0.5.3')

  assert.equal(result.type, 'skipped')
  assert.equal(pkg.dependencies['@opentiny/tiny-robot'], '^0.5.1')
})

test('add dependencies preserve a higher branch in a composite stable range', () => {
  const pkg = { dependencies: { '@opentiny/tiny-robot': '^0.4.0 || ^1.0.0' } }

  const result = ensureDependency(pkg, '@opentiny/tiny-robot', '^0.5.3')

  assert.equal(result.type, 'skipped')
  assert.equal(pkg.dependencies['@opentiny/tiny-robot'], '^0.4.0 || ^1.0.0')
})

test('add dependencies replace a stable range that cannot install the prerelease runtime target', () => {
  const stableRange = { dependencies: { '@opentiny/tiny-robot': '^0.5.1' } }
  const sameReleaseRange = { dependencies: { '@opentiny/tiny-robot': '^0.5.2' } }
  const prereleaseRange = { dependencies: { '@opentiny/tiny-robot': '^0.5.2-alpha.10' } }
  const exactPrerelease = { dependencies: { '@opentiny/tiny-robot': '0.5.2-alpha.15' } }
  const newerPrereleaseRange = { dependencies: { '@opentiny/tiny-robot': '^0.5.2-alpha.20' } }

  const updated = ensureDependency(stableRange, '@opentiny/tiny-robot', '0.5.2-alpha.15')
  const sameReleaseUpdated = ensureDependency(sameReleaseRange, '@opentiny/tiny-robot', '0.5.2-alpha.15')
  const prereleaseUpdated = ensureDependency(prereleaseRange, '@opentiny/tiny-robot', '0.5.2-alpha.15')
  const exactSkipped = ensureDependency(exactPrerelease, '@opentiny/tiny-robot', '0.5.2-alpha.15')
  const newerPrereleaseUpdated = ensureDependency(newerPrereleaseRange, '@opentiny/tiny-robot', '0.5.2-alpha.15')

  assert.equal(updated.type, 'updated')
  assert.equal(stableRange.dependencies['@opentiny/tiny-robot'], '0.5.2-alpha.15')
  assert.equal(sameReleaseUpdated.type, 'updated')
  assert.equal(sameReleaseRange.dependencies['@opentiny/tiny-robot'], '0.5.2-alpha.15')
  assert.equal(prereleaseUpdated.type, 'updated')
  assert.equal(prereleaseRange.dependencies['@opentiny/tiny-robot'], '0.5.2-alpha.15')
  assert.equal(exactSkipped.type, 'skipped')
  assert.equal(exactPrerelease.dependencies['@opentiny/tiny-robot'], '0.5.2-alpha.15')
  assert.equal(newerPrereleaseUpdated.type, 'updated')
  assert.equal(newerPrereleaseRange.dependencies['@opentiny/tiny-robot'], '0.5.2-alpha.15')
})

test('env merge preserves existing values and is idempotent', () => {
  const project = createTempProject()
  const template = path.join(project, '.env.example')
  const target = path.join(project, '.env')
  fs.writeFileSync(template, 'VITE_API_URL=https://default\nVITE_API_KEY=\n')
  fs.writeFileSync(target, 'VITE_API_URL=https://custom\n')

  const first = mergeEnvFile(template, target)
  const second = mergeEnvFile(template, target)
  const content = fs.readFileSync(target, 'utf8')
  assert.equal(first.type, 'merged')
  assert.equal(second.type, 'skipped')
  assert.match(content, /VITE_API_URL=https:\/\/custom/)
  assert.match(content, /VITE_API_KEY=/)
})

test('unavailable env template reports that no variables were added', () => {
  const project = createTempProject()
  const output = []
  const originalLog = console.log

  console.log = (message) => output.push(message)
  try {
    printChangeResults(project, {
      featureInspection: [],
      env: { type: 'unavailable' },
      dependencies: [],
      dependencyChanged: false,
    })
  } finally {
    console.log = originalLog
    fs.rmSync(project, { recursive: true, force: true })
  }

  const text = output.join('\n')
  assert.match(text, /template is unavailable; no environment variables were added/)
  assert.doesNotMatch(text, /already contains required variables/)
})

test('applyChanges rejects targets changed after the plan was created', () => {
  const project = createTempProject()
  const target = path.join(project, 'planned.txt')
  const changes = []

  addFileChange(changes, target, 'planned content', 'create planned file')
  fs.writeFileSync(target, 'external content')

  assert.throws(() => applyChanges(changes), /planned target changed after planning/)
  assert.equal(fs.readFileSync(target, 'utf8'), 'external content')
})

test('applyChanges rolls back files created before a later write fails', () => {
  const project = createTempProject()
  const firstTarget = path.join(project, 'generated', 'first.txt')
  const blocker = path.join(project, 'blocker')
  const secondTarget = path.join(blocker, 'second.txt')
  const changes = []

  fs.writeFileSync(blocker, 'not a directory')
  addFileChange(changes, firstTarget, 'first', 'create first file')
  addFileChange(changes, secondTarget, 'second', 'create second file')

  assert.throws(() => applyChanges(changes), /all changes were rolled back/)
  assert.equal(fs.existsSync(firstTarget), false)
  assert.equal(fs.existsSync(path.dirname(firstTarget)), false)
})

test('chat feature files are namespaced and include feature CSS', () => {
  const files = getChatFeatureFiles(createTempProject())
  const targets = files.map((file) => file.target.replaceAll('\\', '/'))

  assert.ok(targets.some((target) => target.endsWith('/src/tiny-robot-chat/TinyRobotChat.vue')))
  assert.ok(targets.some((target) => target.endsWith('/src/tiny-robot-chat/index.css')))
  assert.ok(!targets.some((target) => target.endsWith('/public/modelcontextprotocol.png')))
  assert.ok(!targets.some((target) => target.endsWith('/src/index.css')))
})

test('workspace root without packages falls back to its package.json', async () => {
  const project = createTempProject()
  fs.writeFileSync(path.join(project, 'package.json'), '{"name":"fixture"}\n')
  fs.writeFileSync(path.join(project, 'pnpm-workspace.yaml'), 'catalogs:\n  default: {}\n')

  assert.equal(await resolveTargetPackage(project, true), project)
})

test('workspace without packages discovers a nested package by default', async () => {
  const project = createTempProject()
  const nested = path.join(project, 'apps', 'web')
  fs.mkdirSync(nested, { recursive: true })
  fs.writeFileSync(path.join(nested, 'package.json'), '{"name":"web"}\n')
  fs.writeFileSync(path.join(project, 'pnpm-workspace.yaml'), 'catalogs:\n  default: {}\n')

  assert.equal(await resolveTargetPackage(project, true), nested)
})

test('workspace root with a package and nested packages does not silently target the root', async () => {
  const project = createTempProject()
  const nested = path.join(project, 'packages', 'web')
  fs.mkdirSync(nested, { recursive: true })
  fs.writeFileSync(path.join(project, 'package.json'), '{"name":"root"}\n')
  fs.writeFileSync(path.join(nested, 'package.json'), '{"name":"web"}\n')
  fs.writeFileSync(path.join(project, 'pnpm-workspace.yaml'), 'catalogs:\n  default: {}\n')

  await assert.rejects(resolveTargetPackage(project, true), /multiple workspace packages found/i)
})

test('workspace package matching supports nested, excluded, and duplicate patterns', () => {
  const project = createTempProject()
  for (const relative of ['packages/one', 'packages/nested/two', 'packages/excluded']) {
    const packageDir = path.join(project, relative)
    fs.mkdirSync(packageDir, { recursive: true })
    fs.writeFileSync(path.join(packageDir, 'package.json'), '{}')
  }

  const matched = listPackages(project, ['packages/**', 'packages/one', '!packages/excluded'])
  assert.deepEqual(
    matched.map((dir) => path.relative(project, dir).replaceAll('\\', '/')),
    ['packages/nested/two', 'packages/one'],
  )
})

test('workspace does not target an unlisted package or a root from a child directory', async () => {
  const project = createTempProject()
  const listed = path.join(project, 'packages', 'listed')
  const unlisted = path.join(project, 'tools', 'unlisted')
  const docs = path.join(project, 'docs')
  fs.mkdirSync(listed, { recursive: true })
  fs.mkdirSync(unlisted, { recursive: true })
  fs.mkdirSync(docs, { recursive: true })
  fs.writeFileSync(path.join(project, 'package.json'), '{"name":"root"}\n')
  fs.writeFileSync(path.join(listed, 'package.json'), '{"name":"listed"}\n')
  fs.writeFileSync(path.join(unlisted, 'package.json'), '{"name":"unlisted"}\n')
  fs.writeFileSync(path.join(project, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n')

  await assert.rejects(resolveTargetPackage(unlisted, true), /not included by the workspace configuration/i)
  await assert.rejects(resolveTargetPackage(docs, true), /run add from the workspace root or a package directory/i)
})

test('explicit empty workspace packages do not fall back to the root package', async () => {
  const project = createTempProject()
  fs.writeFileSync(path.join(project, 'package.json'), '{"name":"root"}\n')
  fs.writeFileSync(path.join(project, 'pnpm-workspace.yaml'), 'packages: []\n')

  await assert.rejects(resolveTargetPackage(project, true), /no packages matched/i)
})

test('workspace without packages and without a root package reports an actionable error', async () => {
  const project = createTempProject()
  fs.writeFileSync(path.join(project, 'pnpm-workspace.yaml'), 'catalogs:\n  default: {}\n')

  await assert.rejects(
    resolveTargetPackage(project, true),
    /no packages field and no package matched pnpm default workspace locations/i,
  )
})

test('workspace patterns without matching packages report a configuration error', async () => {
  const project = createTempProject()
  fs.writeFileSync(path.join(project, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n')

  await assert.rejects(resolveTargetPackage(project, true), /no packages matched the patterns/i)
})

test('invalid workspace YAML reports the workspace file error', async () => {
  const project = createTempProject()
  fs.writeFileSync(path.join(project, 'pnpm-workspace.yaml'), 'packages: [\n')

  await assert.rejects(resolveTargetPackage(project, true), /failed to read pnpm-workspace\.yaml/i)
})
