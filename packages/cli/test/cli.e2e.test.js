import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const cliFile = fileURLToPath(new URL('../bin/cli.js', import.meta.url))

function createTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

function runCli(cwd, ...args) {
  return spawnSync(process.execPath, [cliFile, ...args], { cwd, encoding: 'utf8' })
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
    assert.match(fs.readFileSync(path.join(project, 'vite.config.ts'), 'utf8'), /modelcontextprotocol-mcp/)
    assert.doesNotMatch(fs.readFileSync(path.join(project, 'index.html'), 'utf8'), /__PROJECT_NAME__/)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('add chat injects a local feature and dry-run remains read-only', () => {
  const root = createTempDir('tiny-robot-add-')

  try {
    fs.mkdirSync(path.join(root, 'src'), { recursive: true })
    fs.writeFileSync(
      path.join(root, 'package.json'),
      `${JSON.stringify({ name: 'fixture-add', private: true, type: 'module', dependencies: { vue: '^3.5.0' } }, null, 2)}\n`,
    )
    fs.writeFileSync(path.join(root, 'src/main.ts'), "import { createApp } from 'vue'\ncreateApp({}).mount('#app')\n")
    fs.writeFileSync(path.join(root, 'src/App.vue'), '<script setup lang="ts"></script>\n<template><main /></template>\n')

    const beforeDryRun = fs.readdirSync(root).sort()
    const dryRun = runCli(root, 'add', 'chat', '--dry-run')
    assert.equal(dryRun.status, 0, dryRun.stderr)
    assert.deepEqual(fs.readdirSync(root).sort(), beforeDryRun)
    assert.match(dryRun.stdout, /Change Plan/)

    const result = runCli(root, 'add', 'chat', '--yes')
    const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
    assert.equal(result.status, 0, result.stderr)
    assert.ok(fs.existsSync(path.join(root, 'src/tiny-robot-chat/TinyRobotChat.vue')))
    assert.ok(fs.existsSync(path.join(root, 'src/tiny-robot-chat/index.css')))
    assert.ok(fs.existsSync(path.join(root, 'vite.config.ts')))
    assert.ok(fs.existsSync(path.join(root, '.env')))
    assert.equal(packageJson.dependencies['@vueuse/core'], '13.1.0')
    assert.match(fs.readFileSync(path.join(root, 'vite.config.ts'), 'utf8'), /modelcontextprotocol-mcp/)
    assert.match(fs.readFileSync(path.join(root, 'src/App.vue'), 'utf8'), /<TinyRobotChat \/>/)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
