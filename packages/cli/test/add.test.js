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
  planViteProxy,
} from '../bin/commands/add.js'
import { mergeEnvFile } from '../bin/utils.js'

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
  assert.equal(pkg.dependencies['@vueuse/core'], '13.1.0')
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

test('vite proxy plan creates a config with the MCP proxy', () => {
  const config = planViteProxy(path.join(createTempProject(), 'vite.config.ts'))

  assert.equal(config.type, 'create')
  assert.match(config.content, /\/modelcontextprotocol-mcp/)
  assert.match(config.content, /target: 'https:\/\/modelcontextprotocol\.io\/mcp'/)
})

test('vite proxy plan preserves existing config shapes and separators', () => {
  const project = createTempProject()
  const cases = [
    [
      'plugins',
      "import { defineConfig } from 'vite'\nexport default defineConfig({ plugins: [] })\n",
      /plugins: \[\],\s*server:/,
    ],
    [
      'server',
      "import { defineConfig } from 'vite'\nexport default defineConfig({ server: { host: true } })\n",
      /host: true,\s*proxy:/,
    ],
    [
      'proxy',
      "import { defineConfig } from 'vite'\nexport default defineConfig({ server: { proxy: { '/x': { target: 'x' } } } })\n",
      /target: 'x'\s*},\s*'\/modelcontextprotocol-mcp'/,
    ],
  ]

  for (const [name, source, expected] of cases) {
    const file = path.join(project, `vite.${name}.ts`)
    fs.writeFileSync(file, source)
    const plan = planViteProxy(file)
    assert.equal(plan.type, 'merge')
    assert.match(plan.content, expected)
    assert.match(plan.content, /\/modelcontextprotocol-mcp/)
  }

  const existing = path.join(project, 'existing.ts')
  const source =
    "import { defineConfig } from 'vite'\nexport default defineConfig({ server: { proxy: { '/modelcontextprotocol-mcp': {} } } })\n"
  fs.writeFileSync(existing, source)
  assert.equal(planViteProxy(existing).type, 'skipped')

  const nonStandard = path.join(project, 'non-standard.ts')
  fs.writeFileSync(nonStandard, 'export default { plugins: [] }\n')
  assert.equal(planViteProxy(nonStandard).type, 'manual')
})

test('chat feature files are namespaced and include feature CSS', () => {
  const files = getChatFeatureFiles(createTempProject())
  const targets = files.map((file) => file.target.replaceAll('\\', '/'))

  assert.ok(targets.some((target) => target.endsWith('/src/tiny-robot-chat/TinyRobotChat.vue')))
  assert.ok(targets.some((target) => target.endsWith('/src/tiny-robot-chat/index.css')))
  assert.ok(!targets.some((target) => target.endsWith('/public/modelcontextprotocol.png')))
  assert.ok(!targets.some((target) => target.endsWith('/src/index.css')))
})
