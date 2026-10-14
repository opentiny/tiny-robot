import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { createRequire } from 'node:module'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'packages/chat/dist')
const requireFromTestPackage = createRequire(resolve(root, 'packages/test/package.json'))

function bytes(path) {
  const content = readFileSync(path)
  return { rawBytes: content.byteLength, gzipBytes: gzipSync(content).byteLength }
}

function collectImportedJavaScript(entry) {
  const visited = new Set()

  function visit(path) {
    if (visited.has(path)) return
    visited.add(path)
    const source = readFileSync(path, 'utf8')
    const imports = source.matchAll(/(?:from\s*|import\s*)["'](\.\/[^"']+\.js)["']/g)
    for (const match of imports) {
      const imported = resolve(dirname(path), match[1])
      if (existsSync(imported)) visit(imported)
    }
  }

  visit(entry)
  return [...visited]
}

function aggregate(paths) {
  return paths.reduce(
    (total, path) => {
      const size = bytes(path)
      total.rawBytes += size.rawBytes
      total.gzipBytes += size.gzipBytes
      return total
    },
    { rawBytes: 0, gzipBytes: 0 },
  )
}

export function collectBuildMeasurements() {
  const stableEntry = join(dist, 'index.js')
  const experimentalEntry = join(dist, 'experimental.js')
  const experimentalFiles = collectImportedJavaScript(experimentalEntry)
  const experimentalSource = experimentalFiles.map((path) => readFileSync(path, 'utf8')).join('\n')

  return {
    stable: {
      js: bytes(stableEntry),
      css: bytes(join(dist, 'style.css')),
      files: [relative(dist, stableEntry)],
    },
    experimental: {
      js: aggregate(experimentalFiles),
      css: bytes(join(dist, 'web-component.css')),
      files: experimentalFiles.map((path) => relative(dist, path)).sort(),
      bundlesVue: experimentalSource.includes('__VUE__') && experimentalSource.includes('createApp'),
    },
  }
}

export function summarizeMountSamples(samplesMs, consoleErrors) {
  const samples = [...samplesMs].sort((left, right) => left - right)
  const median = samples.length === 0 ? 0 : samples[Math.floor(samples.length / 2)]
  return {
    samplesMs,
    minMs: samples[0] ?? 0,
    medianMs: median,
    maxMs: samples.at(-1) ?? 0,
    consoleErrors,
  }
}

async function waitForServer(url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // The development server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`Timed out waiting for ${url}`)
}

export async function collectBrowserMeasurements() {
  const port = 3400 + (process.pid % 500)
  const url = `http://127.0.0.1:${port}/experiments/chat-web-component`
  const server = spawn('pnpm', ['-F', 'docs', 'dev', '--host', '127.0.0.1', '--port', String(port)], {
    cwd: root,
    stdio: 'ignore',
  })

  try {
    await waitForServer(url)
    const { chromium } = requireFromTestPackage('@playwright/test')
    const browser = await chromium.launch({ headless: true })
    try {
      const page = await browser.newPage()
      const consoleErrors = []
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text())
      })
      await page.goto(url)
      await page.locator('[data-example-id]').first().waitFor()
      await page.waitForFunction(
        () =>
          document.querySelectorAll('[data-example-id]').length === 18 &&
          [...document.querySelectorAll('[data-example-id]')].every(
            (card) => card.getAttribute('data-mount-status') === 'ready',
          ),
      )
      const samplesMs = await page.evaluate(async () => {
        const samples = []
        for (let index = 0; index < 5; index++) {
          const element = document.createElement('tr-chat-ui')
          element.data = { conversation: { title: 'Timing', items: [] }, bubble: { messages: [] } }
          element.ui = { layout: { leftAside: false }, welcome: false, sender: false }
          const ready = new Promise((resolve) => element.addEventListener('ready', resolve, { once: true }))
          const start = performance.now()
          document.body.append(element)
          await ready
          samples.push(Math.round((performance.now() - start) * 100) / 100)
          element.remove()
          await new Promise((resolve) => setTimeout(resolve, 0))
        }
        return samples
      })
      return summarizeMountSamples(samplesMs, consoleErrors)
    } finally {
      await browser.close()
    }
  } finally {
    server.kill('SIGTERM')
  }
}

export async function measureChatExperimental() {
  return {
    generatedAt: new Date().toISOString(),
    build: collectBuildMeasurements(),
    browser: await collectBrowserMeasurements(),
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${JSON.stringify(await measureChatExperimental(), null, 2)}\n`)
}
