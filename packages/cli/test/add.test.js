import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  DEPENDENCIES,
  ensureDependency,
  ensureStyleImports,
  getChatFeatureFiles,
  planMount,
  resolveTargetPackage,
} from '../bin/commands/add.js'
import { listPackages, mergeEnvFile } from '../bin/utils.js'

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

test('style imports add package and feature CSS imports exactly once', () => {
  const project = createTempProject()
  const entry = path.join(project, 'main.ts')
  fs.writeFileSync(entry, "import { createApp } from 'vue'\n\ncreateApp({}).mount('#app')\n")

  ensureStyleImports(entry, "import './tiny-robot-chat/index.css'")
  ensureStyleImports(entry, "import './tiny-robot-chat/index.css'")

  const content = fs.readFileSync(entry, 'utf8')
  assert.equal((content.match(/@opentiny\/tiny-robot\/dist\/style\.css/g) ?? []).length, 1)
  assert.equal((content.match(/@opentiny\/tiny-robot-chat\/dist\/style\.css/g) ?? []).length, 1)
  assert.equal((content.match(/tiny-robot-chat\/index\.css/g) ?? []).length, 1)
})

test('style imports recognize quote, semicolon, and CRLF variants', () => {
  const project = createTempProject()
  const entry = path.join(project, 'main.ts')
  fs.writeFileSync(
    entry,
    'import "@opentiny/tiny-robot/dist/style.css";\r\nimport "@opentiny/tiny-robot-chat/dist/style.css";\r\nimport "./tiny-robot-chat/index.css";\r\n',
  )

  const result = ensureStyleImports(entry, "import './tiny-robot-chat/index.css'")
  const content = fs.readFileSync(entry, 'utf8')

  assert.equal(result.type, 'skipped')
  assert.equal((content.match(/style\.css/g) ?? []).length, 2)
  assert.equal((content.match(/tiny-robot-chat\/index\.css/g) ?? []).length, 1)
})

test('mount plan inserts import and component in the correct blocks', () => {
  const project = createTempProject()
  const app = path.join(project, 'src', 'App.vue')
  fs.mkdirSync(path.dirname(app), { recursive: true })
  fs.writeFileSync(
    app,
    '<script setup lang="ts">\nconst title = "App"\n</script>\n\n<template>\n  <main>{{ title }}</main>\n</template>\n',
  )

  const plan = planMount(project)

  assert.equal(plan.type, 'merge')
  assert.match(
    plan.content,
    /<script setup lang="ts">\nimport TinyRobotChat from '\.\/tiny-robot-chat\/TinyRobotChat\.vue'/,
  )
  assert.match(plan.content, /<main>\{\{ title \}\}<\/main>\n  <TinyRobotChat \/>\n<\/template>/)
})

test('mount plan inserts into the outer template when nested templates exist', () => {
  const project = createTempProject()
  const app = path.join(project, 'src', 'App.vue')
  fs.mkdirSync(path.dirname(app), { recursive: true })
  fs.writeFileSync(
    app,
    '<template>\n  <main />\n  <template v-if="show">\n    <span />\n  </template>\n</template>\n',
  )

  const plan = planMount(project)

  assert.equal(plan.type, 'merge')
  const nestedClose = plan.content.indexOf('  </template>')
  const mount = plan.content.indexOf('  <TinyRobotChat />')
  const outerClose = plan.content.lastIndexOf('</template>')
  assert.ok(nestedClose < mount)
  assert.ok(mount < outerClose)
})

test('mount plan detects components inside nested templates and rejects invalid templates', () => {
  const project = createTempProject()
  const app = path.join(project, 'src', 'App.vue')
  fs.mkdirSync(path.dirname(app), { recursive: true })

  fs.writeFileSync(
    app,
    '<template><main><template v-if="show"><TinyRobotChat /></template></main></template>\n',
  )
  assert.equal(planMount(project).type, 'skipped')

  for (const source of [
    '<template><main></template>\n',
    '<template><main /></template>\n<template><aside /></template>\n',
  ]) {
    fs.writeFileSync(app, source)
    const plan = planMount(project)
    assert.equal(plan.type, 'manual')
    assert.match(plan.reason, /parsed safely/)
  }
})

test('mount plan handles no script and refuses options API scripts', () => {
  const project = createTempProject()
  const app = path.join(project, 'src', 'App.vue')
  fs.mkdirSync(path.dirname(app), { recursive: true })

  fs.writeFileSync(app, '<template><main /></template>\n')
  const noScript = planMount(project)
  assert.equal(noScript.type, 'merge')
  assert.match(noScript.content, /<script setup lang="ts">/)
  assert.match(noScript.content, /<TinyRobotChat \/>/)

  fs.writeFileSync(app, '<script>export default {}</script>\n<template><main /></template>\n')
  const optionsApi = planMount(project)
  assert.equal(optionsApi.type, 'manual')
})

test('mount plan ignores commented components and refuses conflicting bindings', () => {
  const project = createTempProject()
  const app = path.join(project, 'src', 'App.vue')
  fs.mkdirSync(path.dirname(app), { recursive: true })

  fs.writeFileSync(app, '<template>\n  <!-- <TinyRobotChat /> -->\n  <main />\n</template>\n')
  const commented = planMount(project)
  assert.equal(commented.type, 'merge')
  assert.match(commented.content, /import TinyRobotChat from '\.\/tiny-robot-chat\/TinyRobotChat\.vue'/)

  fs.writeFileSync(
    app,
    '<script setup>\nimport TinyRobotChat from "./OtherChat.vue"\n</script>\n<template><main /></template>\n',
  )
  const conflicting = planMount(project)
  assert.equal(conflicting.type, 'manual')

  fs.writeFileSync(
    app,
    '<script setup>\nimport Chat from "./tiny-robot-chat/TinyRobotChat.vue"\n</script>\n<template><main /></template>\n',
  )
  const aliased = planMount(project)
  assert.equal(aliased.type, 'manual')
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
