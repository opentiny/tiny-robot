import path from 'node:path'
import { readFileSync, watchFile, unwatchFile } from 'node:fs'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { root as workspaceRoot } from './projects.mjs'

function candidateId(marker) {
  try {
    const { id } = JSON.parse(readFileSync(marker, 'utf8'))
    return typeof id === 'string' && id ? id : null
  } catch {
    return null
  }
}

function stopChild(record) {
  if (!record || !record.child.pid) return Promise.resolve()
  record.expected = true
  return (record.stopping ??= stopGroup(record))
}

async function stopGroup(record) {
  const signal = (name) => {
    try {
      if (process.platform === 'win32') record.child.kill(name)
      else process.kill(-record.child.pid, name)
    } catch (error) {
      if (!['ESRCH', 'EPERM'].includes(error.code)) throw error
    }
  }
  const running = () => {
    if (process.platform === 'win32') return !record.exited
    try {
      process.kill(-record.child.pid, 0)
      return true
    } catch (error) {
      if (error.code === 'ESRCH') return false
      // Darwin can report EPERM while an exited group's zombies await reaping.
      if (error.code === 'EPERM') return true
      throw error
    }
  }
  const waitForExit = async () => {
    const deadline = Date.now() + 5000
    while (running()) {
      if (Date.now() >= deadline) return false
      await delay(25)
    }
    return true
  }
  signal('SIGTERM')
  if (!(await waitForExit())) {
    signal('SIGKILL')
    if (!(await waitForExit())) throw new Error('开发服务进程组未能退出')
  }
  await record.done
}

export function startDevelopmentServers(hosts, { root = workspaceRoot } = {}) {
  const states = hosts.map((host) => {
    const marker = path.join(root, host.directory, 'public/candidate.json')
    const id = candidateId(marker)
    if (!id) throw new Error(`[${host.id}] 缺少已校验的候选包标识，请先准备示例依赖。`)
    return { host, marker, current: id, desired: id, process: null, refreshing: null, listener: null }
  })
  let finish
  const closed = new Promise((resolve) => {
    finish = resolve
  })
  let shutdown

  // Reuse the selected pnpm version; a global shim may start a new process group.
  const inherited = process.env.npm_execpath
  const cli = inherited && path.basename(inherited).includes('pnpm') ? inherited : 'pnpm'
  const script = /\.[cm]?js$/.test(cli)

  function launch(state) {
    const child = spawn(script ? process.execPath : cli, script ? [cli, 'dev'] : ['dev'], {
      cwd: path.join(root, state.host.directory),
      stdio: 'inherit',
      detached: process.platform !== 'win32',
      env: { ...process.env, NG_CLI_ANALYTICS: 'false' },
    })
    const record = { child, expected: false, exited: false, done: null }
    record.done = new Promise((resolve) => {
      const ended = (code) => {
        record.exited = true
        resolve()
        if (!record.expected && !shutdown) void close(code)
      }
      child.once('exit', (code) => ended(code ?? 1))
      child.once('error', (error) => {
        console.error(`[${state.host.id}] 开发服务启动失败：`, error)
        ended(1)
      })
    })
    return record
  }

  async function refresh(state) {
    while (!shutdown && state.current !== state.desired) {
      await stopChild(state.process)
      if (shutdown) return
      state.current = state.desired
      state.process = launch(state)
      console.log(`[${state.host.id}] 候选包 ${state.current} 已更新，自动刷新开发服务`)
    }
  }

  function close(code = 0) {
    if (shutdown) return shutdown
    shutdown = Promise.resolve().then(async () => {
      for (const state of states) unwatchFile(state.marker, state.listener)
      const results = await Promise.allSettled(
        states.map(async (state) => {
          await stopChild(state.process)
          await state.refreshing
        }),
      )
      const failures = results.filter((result) => result.status === 'rejected')
      for (const failure of failures) console.error('开发服务清理失败：', failure.reason)
      finish(failures.length ? 1 : code)
    })
    return shutdown
  }

  for (const state of states) {
    state.process = launch(state)
    state.listener = () => {
      if (shutdown) return
      const id = candidateId(state.marker)
      if (!id || id === state.desired) return
      state.desired = id
      if (!state.refreshing) {
        state.refreshing = refresh(state)
          .catch((error) => {
            console.error(error)
            void close(1)
          })
          .finally(() => {
            state.refreshing = null
          })
      }
    }
    watchFile(state.marker, { interval: 250 }, state.listener)
    // Re-read after subscribing to cover updates between initial inspection and the watcher.
    state.listener()
  }
  return { close, closed }
}
