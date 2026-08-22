import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import * as addCommand from '../bin/commands/add.js'

function createVueAppFixture(t) {
  const targetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tiny-robot-cli-add-chat-'))

  t.after(() => {
    fs.rmSync(targetDir, { recursive: true, force: true })
  })

  fs.mkdirSync(path.join(targetDir, 'src'), { recursive: true })
  fs.writeFileSync(
    path.join(targetDir, 'package.json'),
    `${JSON.stringify(
      {
        name: 'existing-vue-app',
        private: true,
        dependencies: { vue: '^3.5.0' },
        devDependencies: { vite: '^7.0.0' },
      },
      null,
      2,
    )}\n`,
  )
  fs.writeFileSync(
    path.join(targetDir, 'src/main.js'),
    "import { createApp } from 'vue'\nimport App from './App.vue'\nimport './style.css'\n\ncreateApp(App).mount('#app')\n",
  )
  fs.writeFileSync(path.join(targetDir, 'src/style.css'), 'body { margin: 8px; }\n')
  fs.writeFileSync(path.join(targetDir, '.env'), 'BUSINESS_SECRET=keep-me\n')

  return targetDir
}

test('add chat generates a self-contained component without changing the application shell', (t) => {
  const targetDir = createVueAppFixture(t)
  const mainFile = path.join(targetDir, 'src/main.js')
  const originalMain = fs.readFileSync(mainFile, 'utf-8')

  assert.equal(typeof addCommand.applyChatFeature, 'function', 'add chat must expose its filesystem operation')
  addCommand.applyChatFeature(targetDir)

  assert.equal(fs.readFileSync(mainFile, 'utf-8'), originalMain)
  assert.equal(fs.existsSync(path.join(targetDir, 'src/index.css')), false)
  assert.equal(fs.readFileSync(path.join(targetDir, '.env'), 'utf-8'), 'BUSINESS_SECRET=keep-me\n')
  assert.equal(fs.existsSync(path.join(targetDir, '.env.example')), true)

  const component = fs.readFileSync(path.join(targetDir, 'src/TinyRobotChat.vue'), 'utf-8')

  assert.match(component, /<button\b/)
  assert.match(component, /<TrChat\b/)
  assert.match(component, /<style scoped>/)
  assert.doesNotMatch(component, /<main\b/)
  assert.doesNotMatch(component, /(^|\n)\s*(?::root|html|body|#app|\*)\s*[{,]/)

  for (const relativePath of [
    'src/tiny-robot-chat/components/ComposerTools.vue',
    'src/tiny-robot-chat/components/WindowHeader.vue',
    'src/tiny-robot-chat/composables/useWindow.ts',
    'src/tiny-robot-chat/config/chat-runtime.ts',
    'src/tiny-robot-chat/config/chat-ui.ts',
  ]) {
    assert.equal(fs.existsSync(path.join(targetDir, relativePath)), true, `${relativePath} should be generated`)
  }

  const pkg = JSON.parse(fs.readFileSync(path.join(targetDir, 'package.json'), 'utf-8'))

  assert.deepEqual(
    Object.fromEntries(
      [
        '@opentiny/tiny-robot',
        '@opentiny/tiny-robot-chat',
        '@opentiny/tiny-robot-kit',
        '@opentiny/tiny-robot-svgs',
        '@vueuse/core',
      ].map((name) => [name, pkg.dependencies[name]]),
    ),
    {
      '@opentiny/tiny-robot': '0.5.2-alpha.10',
      '@opentiny/tiny-robot-chat': '0.5.2-alpha.10',
      '@opentiny/tiny-robot-kit': '0.5.2-alpha.10',
      '@opentiny/tiny-robot-svgs': '0.5.2-alpha.10',
      '@vueuse/core': '13.9.0',
    },
  )
})

test('add chat generates a right-docked window with a light-theme launcher', (t) => {
  const targetDir = createVueAppFixture(t)

  addCommand.applyChatFeature(targetDir)

  const component = fs.readFileSync(path.join(targetDir, 'src/TinyRobotChat.vue'), 'utf-8')
  const useWindow = fs.readFileSync(
    path.join(targetDir, 'src/tiny-robot-chat/composables/useWindow.ts'),
    'utf-8',
  )

  assert.match(useWindow, /placement:\s*'top-right'/)
  assert.match(useWindow, /width:\s*500/)
  assert.match(useWindow, /height:\s*Math\.max\(1,\s*height\.value\s*-\s*FLOATING_GAP\s*\*\s*2\)/)
  assert.match(component, /background:\s*var\(--tr-container-bg-default\)/)
  assert.match(component, /color:\s*var\(--tr-color-primary\)/)
  assert.match(
    component,
    /\.chat-add-launcher:hover\s*{[^}]*background:\s*var\(--tr-color-primary-light\)/s,
  )
})

test('add chat generates a responsive prompt grid capped at two columns', (t) => {
  const targetDir = createVueAppFixture(t)

  addCommand.applyChatFeature(targetDir)

  const component = fs.readFileSync(path.join(targetDir, 'src/TinyRobotChat.vue'), 'utf-8')

  assert.match(component, /--chat-prompt-min-width:\s*280px/)
  assert.match(
    component,
    /\.chat-add-window \.tr-prompts \.tr-prompts__list-container\.wrap\s*{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(var\(--chat-prompt-min-width\),\s*1fr\)\)/s,
  )
  assert.match(
    component,
    /@container \(max-width:\s*623px\)\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s,
  )
  assert.doesNotMatch(component, /\.chat-add-window\s*:deep\(/)
})

test('add chat does not override styles owned by the TrChat layout', (t) => {
  const targetDir = createVueAppFixture(t)

  addCommand.applyChatFeature(targetDir)

  const component = fs.readFileSync(path.join(targetDir, 'src/TinyRobotChat.vue'), 'utf-8')
  const windowRule = component.match(/\.chat-add-window\s*\{([^}]*)\}/s)
  const promptGridRule = component.match(
    /\.chat-add-window \.tr-prompts \.tr-prompts__list-container\.wrap\s*\{([^}]*)\}/s,
  )

  assert.ok(windowRule, 'the generated chat window rule should exist')
  assert.ok(promptGridRule, 'the generated prompt grid rule should exist')
  assert.doesNotMatch(windowRule[1], /container-type|--tr-suggestion-popover-width|width:\s*100%|min-height/)
  assert.doesNotMatch(promptGridRule[1], /(?:^|;)\s*(?:gap|justify-content)\s*:/)
  assert.doesNotMatch(component, /\.chat-add-window--(?:floating|fullscreen)\s*\{/)
})

test('add chat reuses existing support directories and preserves unrelated files', (t) => {
  const targetDir = createVueAppFixture(t)
  const unrelatedFiles = [
    ['src/tiny-robot-chat/components/BusinessTool.vue', '<template><p>business component</p></template>\n'],
    ['src/tiny-robot-chat/composables/useBusiness.ts', 'export const useBusiness = () => true\n'],
    ['src/tiny-robot-chat/config/business.ts', 'export const businessConfig = {}\n'],
  ]

  for (const [relativePath, content] of unrelatedFiles) {
    const file = path.join(targetDir, relativePath)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, content)
  }

  addCommand.applyChatFeature(targetDir)

  for (const [relativePath, content] of unrelatedFiles) {
    assert.equal(fs.readFileSync(path.join(targetDir, relativePath), 'utf-8'), content)
  }

  assert.equal(fs.existsSync(path.join(targetDir, 'src/tiny-robot-chat/components/WindowHeader.vue')), true)
  assert.equal(fs.existsSync(path.join(targetDir, 'src/tiny-robot-chat/composables/useWindow.ts')), true)
  assert.equal(fs.existsSync(path.join(targetDir, 'src/tiny-robot-chat/config/chat-ui.ts')), true)
})

test('add chat refuses to overwrite an existing nested template file before writing changes', (t) => {
  const targetDir = createVueAppFixture(t)
  const nestedFile = path.join(targetDir, 'src/tiny-robot-chat/components/WindowHeader.vue')
  const originalNestedFile = '<template><p>business-owned header</p></template>\n'
  const packageFile = path.join(targetDir, 'package.json')
  const originalPackage = fs.readFileSync(packageFile, 'utf-8')

  fs.mkdirSync(path.dirname(nestedFile), { recursive: true })
  fs.writeFileSync(nestedFile, originalNestedFile)

  assert.throws(
    () => addCommand.applyChatFeature(targetDir),
    /already exist.*src\/tiny-robot-chat\/components\/WindowHeader\.vue/i,
  )
  assert.equal(fs.readFileSync(nestedFile, 'utf-8'), originalNestedFile)
  assert.equal(fs.readFileSync(packageFile, 'utf-8'), originalPackage)
  assert.equal(fs.existsSync(path.join(targetDir, 'src/TinyRobotChat.vue')), false)
  assert.equal(fs.existsSync(path.join(targetDir, '.env.example')), false)
})

test('add chat refuses to overwrite an existing TinyRobotChat component', (t) => {
  const targetDir = createVueAppFixture(t)
  const componentFile = path.join(targetDir, 'src/TinyRobotChat.vue')
  const packageFile = path.join(targetDir, 'package.json')
  const originalComponent = '<template><p>business-owned chat</p></template>\n'
  const originalPackage = fs.readFileSync(packageFile, 'utf-8')

  fs.writeFileSync(componentFile, originalComponent)

  assert.throws(() => addCommand.applyChatFeature(targetDir), /already exist.*TinyRobotChat\.vue/i)
  assert.equal(fs.readFileSync(componentFile, 'utf-8'), originalComponent)
  assert.equal(fs.readFileSync(packageFile, 'utf-8'), originalPackage)
  assert.equal(fs.existsSync(path.join(targetDir, '.env.example')), false)
})

test('add chat preserves workspace protocols and compatible dependency ranges', (t) => {
  const targetDir = createVueAppFixture(t)
  const packageFile = path.join(targetDir, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf-8'))

  Object.assign(pkg.dependencies, {
    '@opentiny/tiny-robot': 'workspace:*',
    '@opentiny/tiny-robot-chat': '^0.5.2-alpha.10',
    '@opentiny/tiny-robot-kit': 'workspace:^',
    '@opentiny/tiny-robot-svgs': '0.5.2-alpha.10',
    '@vueuse/core': '^13.9.0',
  })
  fs.writeFileSync(packageFile, `${JSON.stringify(pkg, null, 2)}\n`)

  addCommand.applyChatFeature(targetDir)

  const updated = JSON.parse(fs.readFileSync(packageFile, 'utf-8'))

  assert.equal(updated.dependencies['@opentiny/tiny-robot'], 'workspace:*')
  assert.equal(updated.dependencies['@opentiny/tiny-robot-chat'], '^0.5.2-alpha.10')
  assert.equal(updated.dependencies['@opentiny/tiny-robot-kit'], 'workspace:^')
  assert.equal(updated.dependencies['@opentiny/tiny-robot-svgs'], '0.5.2-alpha.10')
  assert.equal(updated.dependencies['@vueuse/core'], '^13.9.0')
})

test('add chat stops before writing files when an existing dependency is incompatible', (t) => {
  const targetDir = createVueAppFixture(t)
  const packageFile = path.join(targetDir, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf-8'))

  pkg.dependencies['@opentiny/tiny-robot-chat'] = '0.6.0'
  fs.writeFileSync(packageFile, `${JSON.stringify(pkg, null, 2)}\n`)

  const originalPackage = fs.readFileSync(packageFile, 'utf-8')

  assert.throws(
    () => addCommand.applyChatFeature(targetDir),
    /dependency version conflict.*@opentiny\/tiny-robot-chat.*0\.6\.0.*0\.5\.2-alpha\.10/i,
  )
  assert.equal(fs.readFileSync(packageFile, 'utf-8'), originalPackage)
  assert.equal(fs.existsSync(path.join(targetDir, 'src/TinyRobotChat.vue')), false)
  assert.equal(fs.existsSync(path.join(targetDir, '.env.example')), false)
})

test('add chat leaves MCP servers as an empty extension point for later integration steps', (t) => {
  const targetDir = createVueAppFixture(t)

  addCommand.applyChatFeature(targetDir)

  const generatedSources = [
    'src/TinyRobotChat.vue',
    'src/tiny-robot-chat/components/ComposerTools.vue',
    'src/tiny-robot-chat/config/chat-runtime.ts',
    'src/tiny-robot-chat/config/chat-ui.ts',
  ]
    .map((relativePath) => fs.readFileSync(path.join(targetDir, relativePath), 'utf-8'))
    .join('\n')

  assert.match(generatedSources, /export const mcpServers: ChatMcpServers = \[\]/)
  assert.match(generatedSources, /export const modelProviders: ChatProviderConfig\[\]/)
  assert.doesNotMatch(
    generatedSources,
    /mcpExamples|MCP 工具调用|模拟 MCP|amap-maps|model-context-protocol-mcp|dashscope\.aliyuncs\.com/i,
  )
})

test('add chat generates Vue-template-safe event handlers', (t) => {
  const targetDir = createVueAppFixture(t)

  addCommand.applyChatFeature(targetDir)

  const composerTools = fs.readFileSync(
    path.join(targetDir, 'src/tiny-robot-chat/components/ComposerTools.vue'),
    'utf-8',
  )

  assert.match(composerTools, /function handleTemplateSelect\(item: unknown\)/)
  assert.match(composerTools, /@item-click="handleTemplateSelect"/)
  assert.doesNotMatch(composerTools, /@item-click="[^"]*\sas\s/)
})
