import path from 'node:path'
import { spawn } from 'node:child_process'
import { root, selectHosts } from './projects.mjs'
import { prepareExamples, run } from './prepare.mjs'

const mode = process.argv[2]
const args = process.argv.slice(3)
if (!['test', 'dev'].includes(mode)) throw new Error('模式必须为 test 或 dev')
const development = args.includes('--dev')
const selected = selectHosts(args)
const candidate = prepareExamples(selected, { build: !args.includes('--skip-build') })
const forwarded = args.filter((arg) => !['--skip-build', '--dev'].includes(arg))

if (mode === 'test') {
  for (const host of selected) {
    const project = path.join(root, host.directory)
    run('pnpm', ['type-check'], project)
    if (!development) run('pnpm', ['build'], project, { NG_BUILD_MAX_WORKERS: '2' })
  }
  run(
    'pnpm',
    ['-F', 'tiny-robot-test', 'exec', 'playwright', 'test', '-c', 'web-component/playwright.config.ts', ...forwarded],
    root,
    {
      WC_SERVE_MODE: development ? 'dev' : 'production',
      WC_CANDIDATE_ID: candidate.id,
      WC_HOSTS: selected.map((host) => host.id).join(','),
    },
  )
} else if (mode === 'dev') {
  const children = selected.map((host) =>
    spawn('pnpm', ['dev'], {
      cwd: path.join(root, host.directory),
      stdio: 'inherit',
      detached: process.platform !== 'win32',
    }),
  )
  let stopping = false
  const stop = (code) => {
    if (stopping) return
    stopping = true
    for (const child of children) {
      try {
        if (process.platform === 'win32') child.kill('SIGTERM')
        else process.kill(-child.pid, 'SIGTERM')
      } catch {}
    }
    process.exitCode = code
  }
  children.forEach((child) => {
    child.on('error', () => stop(1))
    child.on('exit', (code) => stop(code ?? 1))
  })
  process.on('SIGINT', () => stop(0))
  process.on('SIGTERM', () => stop(0))
  console.log(selected.map((host) => `${host.label}: http://127.0.0.1:${host.devPort}`).join('\n'))
} else throw new Error('模式必须为 test 或 dev')
