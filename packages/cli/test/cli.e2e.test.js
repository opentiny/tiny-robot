import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const cliFile = fileURLToPath(new URL('../bin/cli.js', import.meta.url))
const cliPackageFile = fileURLToPath(new URL('../package.json', import.meta.url))
const runtimePackageNames = [
  '@opentiny/tiny-robot',
  '@opentiny/tiny-robot-chat',
  '@opentiny/tiny-robot-kit',
  '@opentiny/tiny-robot-svgs',
]

function createTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

function runCli(cwd, ...args) {
  return spawnSync(process.execPath, [cliFile, ...args], { cwd, encoding: 'utf8' })
}

function createVueProject(root) {
  fs.mkdirSync(path.join(root, 'src'), { recursive: true })
  fs.writeFileSync(
    path.join(root, 'package.json'),
    `${JSON.stringify({ name: 'fixture-add', private: true, type: 'module', dependencies: { vue: '^3.5.0' } }, null, 2)}\n`,
  )
  fs.writeFileSync(path.join(root, 'src/main.ts'), "import { createApp } from 'vue'\ncreateApp({}).mount('#app')\n")
  fs.writeFileSync(path.join(root, 'src/App.vue'), '<script setup lang="ts"></script>\n<template><main /></template>\n')
}

test('create basic scaffolds a complete chat-basic project', () => {
  const root = createTempDir('tiny-robot-create-')

  try {
    const result = runCli(root, 'create', 'fixture-basic')
    const project = path.join(root, 'fixture-basic')
    const packageJson = JSON.parse(fs.readFileSync(path.join(project, 'package.json'), 'utf8'))

    assert.equal(result.status, 0, result.stderr)
    assert.equal(packageJson.name, 'fixture-basic')
    assert.ok(fs.existsSync(path.join(project, 'src/App.vue')))
    assert.ok(fs.existsSync(path.join(project, 'src/main.ts')))
    assert.ok(fs.existsSync(path.join(project, 'public/favicon.svg')))
    assert.match(fs.readFileSync(path.join(project, 'src/App.vue'), 'utf8'), /IconBailian/)
    assert.match(fs.readFileSync(path.join(project, 'src/App.vue'), 'utf8'), /icon: IconDeepseek/)
    assert.match(fs.readFileSync(path.join(project, 'vite.config.ts'), 'utf8'), /modelcontextprotocol-mcp/)
    assert.ok(fs.existsSync(path.join(project, '.env.example')))
    assert.equal(fs.existsSync(path.join(project, '.env')), false)
    assert.doesNotMatch(fs.readFileSync(path.join(project, 'index.html'), 'utf8'), /__PROJECT_NAME__/)
    assert.doesNotMatch(fs.readFileSync(path.join(project, 'package.json'), 'utf8'), /__TINY_ROBOT_VERSION__/)

    const cliVersion = JSON.parse(fs.readFileSync(cliPackageFile, 'utf8')).version
    const expectedRuntimeSpecifier = cliVersion.includes('-') ? cliVersion : `^${cliVersion}`
    for (const name of runtimePackageNames.filter((name) => name in packageJson.dependencies)) {
      assert.equal(packageJson.dependencies[name], expectedRuntimeSpecifier)
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('create formats explicit prerelease and stable runtime versions', () => {
  const root = createTempDir('tiny-robot-create-version-')

  try {
    const prerelease = runCli(root, 'create', 'fixture-prerelease', '--runtime-version', '0.5.2-alpha.15')
    const stable = runCli(root, 'create', 'fixture-stable', '--runtime-version', '0.5.3')
    const prereleasePackage = JSON.parse(fs.readFileSync(path.join(root, 'fixture-prerelease', 'package.json'), 'utf8'))
    const stablePackage = JSON.parse(fs.readFileSync(path.join(root, 'fixture-stable', 'package.json'), 'utf8'))

    assert.equal(prerelease.status, 0, prerelease.stderr)
    assert.equal(stable.status, 0, stable.stderr)
    assert.equal(prereleasePackage.dependencies['@opentiny/tiny-robot'], '0.5.2-alpha.15')
    assert.equal(stablePackage.dependencies['@opentiny/tiny-robot'], '^0.5.3')
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('create rejects an invalid runtime version before creating the target', () => {
  const root = createTempDir('tiny-robot-create-invalid-version-')

  try {
    const result = runCli(root, 'create', 'fixture-invalid', '--runtime-version', 'alpha')

    assert.equal(result.status, 1)
    assert.match(result.stderr, /valid semantic version/i)
    assert.equal(fs.existsSync(path.join(root, 'fixture-invalid')), false)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('add chat injects a local feature and dry-run remains read-only', () => {
  const root = createTempDir('tiny-robot-add-')

  try {
    createVueProject(root)

    const beforeDryRun = fs.readdirSync(root).sort()
    const dryRun = runCli(root, 'add', 'chat', '--dry-run', '--runtime-version', '0.5.2-alpha.15')
    assert.equal(dryRun.status, 0, dryRun.stderr)
    assert.deepEqual(fs.readdirSync(root).sort(), beforeDryRun)
    assert.match(dryRun.stdout, /Change Plan/)
    assert.match(dryRun.stdout, /\.env\.example/)
    assert.match(dryRun.stdout, /package\.json/)
    assert.match(dryRun.stdout, /added: @opentiny\/tiny-robot/)
    assert.match(dryRun.stdout, /server\.proxy/)
    assert.doesNotMatch(dryRun.stdout, /Vite MCP proxy/)

    const result = runCli(root, 'add', 'chat', '--yes', '--runtime-version', '0.5.2-alpha.15')
    const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
    assert.equal(result.status, 0, result.stderr)
    assert.ok(fs.existsSync(path.join(root, 'src/tiny-robot-chat/TinyRobotChat.vue')))
    assert.ok(fs.existsSync(path.join(root, 'src/tiny-robot-chat/index.css')))
    assert.ok(!fs.existsSync(path.join(root, 'vite.config.ts')))
    assert.ok(fs.existsSync(path.join(root, '.env.example')))
    assert.equal(fs.existsSync(path.join(root, '.env')), false)
    assert.equal(packageJson.dependencies['@vueuse/core'], '13.9.0')
    for (const name of runtimePackageNames) assert.equal(packageJson.dependencies[name], '0.5.2-alpha.15')
    const runtimeConfig = fs.readFileSync(path.join(root, 'src/tiny-robot-chat/config/chat-runtime.ts'), 'utf8')
    assert.match(runtimeConfig, /IconBailian/)
    assert.match(runtimeConfig, /icon: IconDeepseek/)
    assert.match(fs.readFileSync(path.join(root, 'src/App.vue'), 'utf8'), /<TinyRobotChat \/>/)
    assert.match(result.stdout, /server\.proxy/)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('add preserves a compatible host range and uses caret ranges for missing stable runtimes', () => {
  const root = createTempDir('tiny-robot-add-stable-version-')

  try {
    createVueProject(root)
    const packageFile = path.join(root, 'package.json')
    const before = JSON.parse(fs.readFileSync(packageFile, 'utf8'))
    before.dependencies['@opentiny/tiny-robot'] = '^0.5.1'
    fs.writeFileSync(packageFile, `${JSON.stringify(before, null, 2)}\n`)

    const result = runCli(root, 'add', 'chat', '--yes', '--runtime-version', '0.5.3')
    const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'))

    assert.equal(result.status, 0, result.stderr)
    assert.equal(packageJson.dependencies['@opentiny/tiny-robot'], '^0.5.1')
    assert.equal(packageJson.dependencies['@opentiny/tiny-robot-chat'], '^0.5.3')
    assert.equal(packageJson.dependencies['@opentiny/tiny-robot-kit'], '^0.5.3')
    assert.equal(packageJson.dependencies['@opentiny/tiny-robot-svgs'], '^0.5.3')
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('add rejects an invalid runtime version before modifying the project', () => {
  const root = createTempDir('tiny-robot-add-invalid-version-')

  try {
    createVueProject(root)
    const packageFile = path.join(root, 'package.json')
    const before = fs.readFileSync(packageFile, 'utf8')

    const result = runCli(root, 'add', 'chat', '--yes', '--runtime-version', '^0.5.3')

    assert.equal(result.status, 1)
    assert.match(result.stderr, /valid semantic version/i)
    assert.equal(fs.readFileSync(packageFile, 'utf8'), before)
    assert.equal(fs.existsSync(path.join(root, 'src/tiny-robot-chat')), false)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('add chat keeps document-wide styles owned by the host application', () => {
  const root = createTempDir('tiny-robot-add-styles-')

  try {
    createVueProject(root)

    const result = runCli(root, 'add', 'chat', '--yes')
    const featureCss = fs.readFileSync(path.join(root, 'src/tiny-robot-chat/index.css'), 'utf8')

    assert.equal(result.status, 0, result.stderr)
    assert.match(
      featureCss,
      /\.chat-add-app,\s*\.chat-add-app \*,\s*\.chat-add-window,\s*\.chat-add-window \*\s*\{[^}]*box-sizing:\s*border-box/s,
    )
    assert.doesNotMatch(featureCss, /(^|})\s*(?::root|html|body|#app|\*)\s*(?:,|\{)/m)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('add chat is idempotent and reports when no changes are necessary', () => {
  const root = createTempDir('tiny-robot-add-idempotent-')

  try {
    createVueProject(root)
    const first = runCli(root, 'add', 'chat', '--yes')
    const second = runCli(root, 'add', 'chat', '--yes')

    assert.equal(first.status, 0, first.stderr)
    assert.equal(second.status, 0, second.stderr)
    assert.match(second.stdout, /No changes were necessary/i)
    assert.equal((fs.readFileSync(path.join(root, 'src/main.ts'), 'utf8').match(/style\.css/g) ?? []).length, 2)
    assert.equal(
      (fs.readFileSync(path.join(root, 'src/main.ts'), 'utf8').match(/tiny-robot-chat\/index\.css/g) ?? []).length,
      1,
    )
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('add chat does not modify local env and merges the env example', () => {
  const root = createTempDir('tiny-robot-add-env-')

  try {
    createVueProject(root)
    const localEnv = path.join(root, '.env')
    const envExample = path.join(root, '.env.example')
    const localContent = 'VITE_LOCAL_ONLY=keep\n'
    fs.writeFileSync(localEnv, localContent)
    fs.writeFileSync(envExample, 'VITE_DEEPSEEK_API_KEY=placeholder\n')

    const result = runCli(root, 'add', 'chat', '--yes')

    assert.equal(result.status, 0, result.stderr)
    assert.equal(fs.readFileSync(localEnv, 'utf8'), localContent)
    assert.match(fs.readFileSync(envExample, 'utf8'), /VITE_DEEPSEEK_API_KEY=placeholder/)
    assert.match(fs.readFileSync(envExample, 'utf8'), /VITE_QWEN_API_URL=/)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('add chat does not modify an existing Vite config', () => {
  const root = createTempDir('tiny-robot-add-vite-')

  try {
    createVueProject(root)
    const viteConfig = path.join(root, 'vite.config.ts')
    const original = 'export default { server: { host: true } }\n'
    fs.writeFileSync(viteConfig, original)

    const result = runCli(root, 'add', 'chat', '--yes')

    assert.equal(result.status, 0, result.stderr)
    assert.equal(fs.readFileSync(viteConfig, 'utf8'), original)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('add chat validates package.json before modifying project files', () => {
  const root = createTempDir('tiny-robot-add-invalid-package-')

  try {
    fs.mkdirSync(path.join(root, 'src'), { recursive: true })
    fs.writeFileSync(path.join(root, 'package.json'), '{ invalid json\n')
    const main = path.join(root, 'src/main.ts')
    const app = path.join(root, 'src/App.vue')
    fs.writeFileSync(main, "import { createApp } from 'vue'\n")
    fs.writeFileSync(app, '<template><main /></template>\n')

    const result = runCli(root, 'add', 'chat', '--yes')

    assert.equal(result.status, 1)
    assert.doesNotMatch(result.stderr, /Successfully added/i)
    assert.equal(fs.existsSync(path.join(root, 'src/tiny-robot-chat')), false)
    assert.equal(fs.existsSync(path.join(root, '.env.example')), false)
    assert.equal(fs.readFileSync(main, 'utf8'), "import { createApp } from 'vue'\n")
    assert.equal(fs.readFileSync(app, 'utf8'), '<template><main /></template>\n')
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('add chat runs non-interactively when stdout is not a TTY', () => {
  const root = createTempDir('tiny-robot-add-nontty-')

  try {
    createVueProject(root)
    const result = runCli(root, 'add', 'chat')

    assert.equal(result.status, 0, result.stderr)
    assert.ok(fs.existsSync(path.join(root, 'src/tiny-robot-chat/TinyRobotChat.vue')))
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('add chat falls back to the workspace root without a packages field', () => {
  const root = createTempDir('tiny-robot-workspace-root-')

  try {
    createVueProject(root)
    fs.writeFileSync(path.join(root, 'pnpm-workspace.yaml'), 'catalogs:\n  default: {}\n')

    const result = runCli(root, 'add', 'chat', '--dry-run')

    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /src[\\/]tiny-robot-chat/)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('add chat reports a clear error for an empty workspace without a root package', () => {
  const root = createTempDir('tiny-robot-workspace-empty-')

  try {
    fs.writeFileSync(path.join(root, 'pnpm-workspace.yaml'), 'catalogs:\n  default: {}\n')

    const result = runCli(root, 'add', 'chat', '--dry-run')

    assert.equal(result.status, 1)
    assert.match(result.stderr, /no packages field and no package matched pnpm default workspace locations/i)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
