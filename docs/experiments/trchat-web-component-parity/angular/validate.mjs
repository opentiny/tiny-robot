import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

// Uses the real installed consumer's Playwright, never imports repository source.
const fixtures = process.env.TRCHAT_FIXTURES ?? '/private/tmp/trchat-1.0.1-eval'
const require = createRequire(path.join(fixtures, 'standalone/package.json'))
const { chromium } = require('@playwright/test')
const output = path.resolve(process.env.TRCHAT_EVIDENCE ?? 'docs/experiments/trchat-web-component-parity/screenshots')
fs.mkdirSync(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const report = []
try {
  for (const [mode, url] of [
    ['standalone', process.env.TRCHAT_STANDALONE_URL ?? 'http://127.0.0.1:4300'],
    ['ngmodule', 'http://127.0.0.1:4219'],
    ['ssr', 'http://localhost:4319'],
  ]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    if (mode === 'ssr') {
      const response = await context.request.get(`${url}/?parity`)
      assert.equal(response.status(), 200)
      const html = await response.text()
      assert.match(html, /ngskiphydration/i)
      assert.match(html, /data-parity-placeholder/)
      assert.equal(/<tr-chat(?:-ui)?[\s>]/i.test(html), false, 'SSR emits placeholders until browser lifecycle')
    }
    await page.goto(`${url}/?parity`)
    await page.locator('#parity-ready').filter({ hasText: 'Both elements ready' }).waitFor()
    assert.equal(await page.locator('#parity-identity').textContent(), 'true')
    const payloads = []
    for (const kind of ['runtime', 'ui']) {
      const element = page.locator(`${kind === 'ui' ? 'tr-chat-ui' : 'tr-chat'}#parity-${kind}`)
      const editor = element.locator('.tr-sender-editor')
      await element.evaluate((host) => host.setAttribute('is-empty', ''))
      await element.locator('[data-parity-empty="true"]').waitFor()
      assert.equal(
        await element.evaluate((host) => host.isEmpty),
        true,
        'boolean attribute keeps a boolean DOM property',
      )
      await element.evaluate((host) => {
        host.isEmpty = undefined
      })
      await element.locator('[data-parity-empty="false"]').waitFor()

      assert.equal(await element.locator('[data-parity-prefix]').textContent(), 'Local context')
      assert.equal(await element.locator('[data-parity-empty]').getAttribute('data-parity-empty'), 'false')
      await page.locator(`#${kind}-set`).click()
      const draft = kind === 'ui' ? 'Controlled draft from Angular' : 'Runtime draft from Angular'
      await page.waitForFunction(
        ({ id, draft }) => document.querySelector(`${id} .tr-sender-editor`)?.textContent === draft,
        { id: `${kind === 'ui' ? 'tr-chat-ui' : 'tr-chat'}#parity-${kind}`, draft },
      )
      if (kind === 'ui') {
        await page.waitForFunction((draft) => document.querySelector('#parity-draft')?.textContent === draft, draft)
        assert.equal(await page.locator('#parity-draft').textContent(), draft)
      }
      await page.locator(`#${kind}-focus`).click()
      await page.waitForFunction(
        (kind) => document.querySelector('#parity-focus')?.textContent === `${kind}:true`,
        kind,
      )
      assert.equal(await editor.evaluate((node) => document.activeElement === node), true)
      await page.locator(`#${kind}-clear`).click()
      await page.waitForFunction(
        (id) => document.querySelector(`${id} .tr-sender-editor`)?.textContent === '',
        `${kind === 'ui' ? 'tr-chat-ui' : 'tr-chat'}#parity-${kind}`,
      )
      if (kind === 'ui') {
        await page.waitForFunction(() => document.querySelector('#parity-draft')?.textContent === '')
        assert.equal(await page.locator('#parity-draft').textContent(), '')
      }
      await page.locator(`#${kind}-empty`).click()
      await element.locator('[data-parity-empty="true"]').waitFor()
      await page.locator(`#${kind}-false`).click()
      await element.locator('[data-parity-empty="false"]').waitFor()
      await page.locator(`#${kind}-auto`).click()
      await element.locator('[data-parity-empty="false"]').waitFor()
      const received = await element.evaluate((host) => {
        const editor = host.querySelector('.tr-sender-editor')
        const sender = host.querySelector('.tr-sender')
        const results = []
        for (const [nativeName, name] of [
          ['dragenter', 'sender-drag-enter'],
          ['dragover', 'sender-drag-over'],
          ['dragleave', 'sender-drag-leave'],
          ['drop', 'sender-drop'],
          ['paste', 'sender-paste'],
        ]) {
          const transfer = new DataTransfer()
          transfer.items.add(new File(['local content'], `${host.id}-${nativeName}.txt`, { type: 'text/plain' }))
          const original =
            nativeName === 'paste'
              ? new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true })
              : new DragEvent(nativeName, { dataTransfer: transfer, bubbles: true, cancelable: true })
          let detail
          host.addEventListener(
            name,
            (event) => {
              detail = event.detail
            },
            { once: true },
          )
          editor.dispatchEvent(original)
          const forwarded = nativeName === 'paste' ? detail : detail?.event
          results.push({
            name,
            identity: forwarded === original,
            target: nativeName === 'paste' ? forwarded?.target === editor : detail?.target === sender,
            canceled: original.defaultPrevented,
          })
        }
        return results
      })
      assert.equal(received.length, 5)
      for (const item of received)
        assert.deepEqual(item, { name: item.name, identity: true, target: true, canceled: true })
      payloads.push({ kind, events: received })
      await page.locator(`#${kind}-set`).click()
      await page.waitForFunction(
        ({ id, draft }) => document.querySelector(`${id} .tr-sender-editor`)?.textContent === draft,
        { id: `${kind === 'ui' ? 'tr-chat-ui' : 'tr-chat'}#parity-${kind}`, draft },
      )
      await element.locator('.tr-sender-submit-button').waitFor({ state: 'visible' })
      assert.equal(await element.locator('.tr-sender-submit-button').isDisabled(), false)
      const fits = await element.evaluate((host) => {
        const frame = host.parentElement.getBoundingClientRect()
        const layout = host.querySelector('.tr-chat-ui').getBoundingClientRect()
        const header = host.querySelector('[data-parity-empty]').getBoundingClientRect()
        const sender = host.querySelector('.tr-sender').getBoundingClientRect()
        return {
          layout: layout.height <= frame.height + 1,
          header: header.top >= frame.top,
          sender: sender.bottom <= frame.bottom + 1,
        }
      })
      assert.deepEqual(fits, { layout: true, header: true, sender: true })
    }
    assert.equal((await page.locator('#parity-events').textContent()).split(' | ').length, 10)
    assert.equal((await page.locator('#parity-files').textContent()).split(', ').length, 10)
    await page.locator('.parity-demo').evaluate((node) => {
      node.scrollTop = 0
    })
    await page.screenshot({ path: path.join(output, `${mode}-desktop.png`) })
    await page.setViewportSize({ width: 390, height: 844 })
    for (const kind of ['runtime', 'ui']) {
      const article = page.locator(`#${kind}-set`).locator('..').locator('..')
      await article.scrollIntoViewIfNeeded()
      await page.locator(`#${kind}-focus`).click()
      await page.waitForFunction(
        (kind) => document.querySelector('#parity-focus')?.textContent === `${kind}:true`,
        kind,
      )
      const geometry = await article.evaluate((node) => {
        const rect = node.getBoundingClientRect()
        const demo = document.querySelector('.parity-demo')
        return { width: innerWidth, left: rect.left, right: rect.right, overflow: demo.scrollWidth - demo.clientWidth }
      })
      assert.equal(geometry.width, 390)
      assert.ok(geometry.left >= 0 && geometry.right <= 390 && geometry.overflow === 0)
      const fits = await page.locator(`${kind === 'ui' ? 'tr-chat-ui' : 'tr-chat'}#parity-${kind}`).evaluate((host) => {
        const frame = host.parentElement.getBoundingClientRect()
        const layout = host.querySelector('.tr-chat-ui').getBoundingClientRect()
        const header = host.querySelector('[data-parity-empty]').getBoundingClientRect()
        const sender = host.querySelector('.tr-sender').getBoundingClientRect()
        return layout.height <= frame.height + 1 && header.top >= frame.top && sender.bottom <= frame.bottom + 1
      })
      assert.equal(fits, true, 'inner layout, header, and sender remain within the host frame')
      await page.screenshot({ path: path.join(output, `${mode}-mobile-390-${kind}.png`) })
    }
    assert.deepEqual(errors, [])
    report.push({
      mode,
      result: 'passed',
      propertyIdentity: true,
      eventPayloads: payloads,
      desktop: '1440x1000',
      mobile: '390x844',
      errors,
    })
    console.log(`${mode}: passed`)
    await context.close()
  }
} finally {
  await browser.close()
}
fs.writeFileSync(path.join(output, '../browser-results.json'), JSON.stringify(report, null, 2) + '\n')
