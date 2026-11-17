import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fingerprintPackages, rewriteManifest } from './candidate.mjs'
import { verifyInstalled } from './prepare.mjs'
import { digest } from './candidate.mjs'

test('候选标识包含 CSS 与类型文件的变化', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'wc-candidate-'))
  try {
    for (const dir of ['components', 'kit', 'svgs', 'chat']) {
      const pkg = path.join(root, 'packages', dir)
      mkdirSync(path.join(pkg, 'dist'), { recursive: true })
      writeFileSync(path.join(pkg, 'package.json'), JSON.stringify({ name: dir, version: '2.4.0' }))
      writeFileSync(path.join(pkg, 'dist/index.js'), 'export const value = 1')
      writeFileSync(path.join(pkg, 'dist/style.css'), 'body { color: red }')
      writeFileSync(path.join(pkg, 'dist/index.d.ts'), 'export declare const value: number')
    }
    const original = fingerprintPackages(root)
    writeFileSync(path.join(root, 'packages/chat/dist/style.css'), 'body { color: blue }')
    const cssChanged = fingerprintPackages(root)
    assert.notEqual(cssChanged, original)
    writeFileSync(path.join(root, 'packages/chat/dist/index.d.ts'), 'export declare const value: string')
    assert.notEqual(fingerprintPackages(root), cssChanged)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('安装检查拒绝错误声明文件和工作区源码链接', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'wc-installed-'))
  try {
    const project = path.join(root, 'app')
    const installed = path.join(project, 'node_modules/demo-sdk')
    mkdirSync(path.join(installed, 'dist'), { recursive: true })
    writeFileSync(path.join(project, 'package.json'), '{}')
    writeFileSync(
      path.join(installed, 'package.json'),
      JSON.stringify({ name: 'demo-sdk', version: '2.4.0', main: './dist/index.js' }),
    )
    writeFileSync(path.join(installed, 'dist/index.js'), 'export {}')
    writeFileSync(path.join(installed, 'dist/index.d.ts'), 'export {}')
    const candidate = {
      packages: [{ name: 'demo-sdk', version: '2.4.0', files: { 'dist/index.d.ts': digest('export {}') } }],
    }
    verifyInstalled(project, candidate)
    writeFileSync(path.join(installed, 'dist/index.d.ts'), 'export declare const unexpected: number')
    assert.throws(() => verifyInstalled(project, candidate), /安装产物与候选包不一致/)
    rmSync(installed, { recursive: true })
    const source = path.join(root, 'source')
    mkdirSync(source)
    writeFileSync(
      path.join(source, 'package.json'),
      JSON.stringify({ name: 'demo-sdk', version: '2.4.0', main: './index.js' }),
    )
    writeFileSync(path.join(source, 'index.js'), 'export {}')
    symlinkSync(source, installed, 'dir')
    assert.throws(() => verifyInstalled(project, candidate), /依赖来源不正确/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('打包时使用各包实际版本替换 workspace 协议，并保留源码清单', () => {
  const manifest = {
    dependencies: { core: 'workspace:*', kit: 'workspace:^', external: '^3.0.0' },
    peerDependencies: { svg: 'workspace:~' },
  }
  const actual = rewriteManifest(
    manifest,
    new Map([
      ['core', '2.4.0'],
      ['kit', '3.1.0'],
      ['svg', '1.8.0'],
    ]),
  )
  assert.deepEqual(actual.dependencies, { core: '2.4.0', kit: '^3.1.0', external: '^3.0.0' })
  assert.equal(actual.peerDependencies.svg, '~1.8.0')
  assert.equal(manifest.dependencies.core, 'workspace:*')
})
