import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { copyAppForTest } from '../../packages/test/ai-app/projects.mjs'

test('测试副本可以安装当前构建，保留对外示例的发布依赖', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-app-copy-'))
  try {
    const source = path.join(root, 'source')
    const destination = path.join(root, 'test')
    fs.mkdirSync(source)
    const manifest = JSON.stringify({ dependencies: { chat: '2.4.0' } })
    fs.writeFileSync(path.join(source, 'package.json'), manifest)
    fs.writeFileSync(path.join(source, 'pnpm-lock.yaml'), 'published-lock')
    copyAppForTest(source, destination)
    assert.ok(fs.existsSync(path.join(destination, 'package.json')))
    fs.writeFileSync(
      path.join(destination, 'package.json'),
      JSON.stringify({ dependencies: { chat: 'file:local.tgz' } }),
    )
    fs.writeFileSync(path.join(destination, 'pnpm-lock.yaml'), 'candidate-lock')
    assert.equal(fs.readFileSync(path.join(source, 'package.json'), 'utf8'), manifest)
    assert.equal(fs.readFileSync(path.join(source, 'pnpm-lock.yaml'), 'utf8'), 'published-lock')
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('测试副本包含源码和环境模板，排除本地凭证及旧生成产物', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-app-copy-'))
  try {
    const source = path.join(root, 'source')
    const destination = path.join(root, 'test')
    const included = ['package.json', '.env.example', 'src/app.ts', 'src/chat/runtime.ts']
    const excluded = [
      '.env',
      '.env.local',
      '.env.production',
      'node_modules/pkg/index.js',
      'dist/index.js',
      'vendor/sdk.tgz',
      '.angular/cache/file',
      'out-tsc/file.js',
      'src/environments/env.generated.ts',
      'src/environments/env.test.generated.ts',
      'public/candidate.json',
    ]
    for (const name of [...included, ...excluded]) {
      const file = path.join(source, name)
      fs.mkdirSync(path.dirname(file), { recursive: true })
      fs.writeFileSync(file, name)
    }
    fs.mkdirSync(destination)
    fs.writeFileSync(path.join(destination, 'obsolete.ts'), 'old')
    copyAppForTest(source, destination)
    for (const name of included) assert.equal(fs.readFileSync(path.join(destination, name), 'utf8'), name)
    for (const name of [...excluded, 'obsolete.ts'])
      assert.equal(fs.existsSync(path.join(destination, name)), false, name)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
