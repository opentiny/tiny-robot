import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import test from 'node:test'
import { startDevelopmentServers } from './dev.mjs'

async function until(read, expected) {
  const deadline = Date.now() + 15000
  let actual
  while (Date.now() < deadline) {
    try {
      actual = await read()
      if (JSON.stringify(actual) === JSON.stringify(expected)) return
    } catch {}
    await delay(30)
  }
  assert.deepEqual(actual, expected)
}

function fixture({ ignoreTermination = false, parentExitsFirst = false } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'wc-dev-refresh-'))
  const hosts = ['js', 'angular', 'react'].map((id) => ({ id, label: id, directory: id, devPort: 0 }))
  for (const host of hosts) {
    const directory = path.join(root, host.directory)
    mkdirSync(path.join(directory, 'public'), { recursive: true })
    writeFileSync(
      path.join(directory, 'package.json'),
      JSON.stringify({ type: 'module', scripts: { dev: 'node server.mjs' } }),
    )
    writeFileSync(path.join(directory, 'installed.txt'), 'A')
    writeFileSync(path.join(directory, 'public/candidate.json'), JSON.stringify({ id: 'A' }))
    writeFileSync(
      path.join(directory, 'server.mjs'),
      `
import http from 'node:http'
import fs from 'node:fs'
const bundle = fs.readFileSync('installed.txt', 'utf8')
fs.writeFileSync('pid.txt', String(process.pid))
${ignoreTermination ? "process.on('SIGTERM', () => {})" : ''}
let draft = ''
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')
  if (url.pathname === '/draft') draft = url.searchParams.get('text') ?? draft
  if (url.pathname === '/exit') { res.end('stopping'); setImmediate(() => process.exit(2)); return }
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify({ bundle, draft }))
})
server.listen(0, '127.0.0.1', () => fs.writeFileSync('endpoint.txt', 'http://127.0.0.1:' + server.address().port))
`,
    )
  }
  function publish(host, id) {
    writeFileSync(path.join(root, host.directory, 'public/candidate.json'), JSON.stringify({ id }))
  }
  async function request(host, route = '/') {
    const { readFile } = await import('node:fs/promises')
    const endpoint = await readFile(path.join(root, host.directory, 'endpoint.txt'), 'utf8')
    return (await fetch(endpoint + route)).json()
  }
  const originalPath = process.env.PATH
  const originalExecPath = process.env.npm_execpath
  if (parentExitsFirst) {
    const bin = path.join(root, 'bin')
    mkdirSync(bin)
    writeFileSync(
      path.join(bin, 'pnpm'),
      `#!/usr/bin/env node
const { spawn } = require('node:child_process')
spawn(process.execPath, ['server.mjs'], { stdio: 'inherit' })
process.on('SIGTERM', () => process.exit(0))
`,
      { mode: 0o755 },
    )
    process.env.PATH = bin + path.delimiter + originalPath
    process.env.npm_execpath = path.join(bin, 'pnpm')
  }
  let dev
  try {
    dev = startDevelopmentServers(hosts, { root })
  } finally {
    process.env.PATH = originalPath
    if (originalExecPath === undefined) delete process.env.npm_execpath
    else process.env.npm_execpath = originalExecPath
  }
  async function close() {
    await dev.close()
    rmSync(root, { recursive: true, force: true })
  }
  return { root, hosts, publish, request, dev, close }
}

test('候选安装完成后，三端开发服务自动提供新包', async () => {
  const f = fixture()
  try {
    for (const host of f.hosts) await until(() => f.request(host), { bundle: 'A', draft: '' })
    for (const host of f.hosts) {
      writeFileSync(path.join(f.root, host.directory, 'installed.txt'), 'B')
      assert.deepEqual(await f.request(host), { bundle: 'A', draft: '' })
      f.publish(host, 'B')
    }
    for (const host of f.hosts) await until(() => f.request(host), { bundle: 'B', draft: '' })
    for (const host of f.hosts) {
      for (const id of ['C', 'D']) {
        writeFileSync(path.join(f.root, host.directory, 'installed.txt'), id)
        f.publish(host, id)
      }
    }
    for (const host of f.hosts) await until(() => f.request(host), { bundle: 'D', draft: '' })
  } finally {
    await f.close()
  }
})

test('重复校验同一候选和更新其他宿主时，保留未更新宿主的草稿', async () => {
  const f = fixture()
  try {
    for (const host of f.hosts) await until(() => f.request(host), { bundle: 'A', draft: '' })
    const [js, angular, react] = f.hosts
    for (const host of [angular, react]) {
      await f.request(host, '/draft?text=保留草稿')
      f.publish(host, 'A')
    }
    writeFileSync(path.join(f.root, js.directory, 'installed.txt'), 'B')
    f.publish(js, 'B')
    await until(() => f.request(js), { bundle: 'B', draft: '' })
    for (const host of [angular, react]) assert.deepEqual(await f.request(host), { bundle: 'A', draft: '保留草稿' })
  } finally {
    await f.close()
  }
})

test('单个宿主失败时，启动器关闭整组服务', async () => {
  const f = fixture()
  try {
    for (const host of f.hosts) await until(() => f.request(host), { bundle: 'A', draft: '' })
    const failed = f.request(f.hosts[0], '/exit').catch(() => {})
    assert.equal(await f.dev.closed, 2)
    await failed
    for (const host of f.hosts) await assert.rejects(() => f.request(host))
  } finally {
    await f.close()
  }
})

test('正常停止启动器会释放全部服务端口', async () => {
  const f = fixture()
  try {
    for (const host of f.hosts) await until(() => f.request(host), { bundle: 'A', draft: '' })
    await f.dev.close()
    assert.equal(await f.dev.closed, 0)
    for (const host of f.hosts) await assert.rejects(() => f.request(host))
  } finally {
    await f.close()
  }
})

test('入口进程先退出时，停止启动器仍会释放后代服务端口', { skip: process.platform === 'win32' }, async () => {
  const f = fixture({ ignoreTermination: true, parentExitsFirst: true })
  try {
    for (const host of f.hosts) await until(() => f.request(host), { bundle: 'A', draft: '' })
    await f.dev.close()
    assert.equal(await f.dev.closed, 0)
    for (const host of f.hosts) await assert.rejects(() => f.request(host))
  } finally {
    for (const host of f.hosts) {
      try {
        process.kill(Number(readFileSync(path.join(f.root, host.directory, 'pid.txt'), 'utf8')), 'SIGKILL')
      } catch (error) {
        if (error.code !== 'ESRCH') throw error
      }
    }
    await f.close()
  }
})
