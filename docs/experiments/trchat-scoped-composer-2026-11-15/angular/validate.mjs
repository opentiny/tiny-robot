import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const fixtures = process.env.TRCHAT_FIXTURES ?? '/private/tmp/trchat-1.0.1-eval'
const require = createRequire(path.join(fixtures, 'standalone/package.json'))
const { chromium } = require('@playwright/test')
const output = path.resolve(
  process.env.TRCHAT_EVIDENCE ?? 'docs/experiments/trchat-scoped-composer-2026-11-15/screenshots',
)
fs.mkdirSync(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const results = []
try {
  for (const [mode, url] of [
    ['standalone', 'http://127.0.0.1:4320'],
    ['ngmodule', 'http://127.0.0.1:4219'],
    ['ssr', 'http://localhost:4319'],
  ]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1080 } })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    if (mode === 'ssr') {
      const response = await context.request.get(`${url}/?scoped`)
      assert.equal(response.status(), 200)
      const html = await response.text()
      assert.match(html, /data-scoped-placeholder/)
      assert.match(html, /ngskiphydration/i)
      assert.equal(/<tr-chat(?:-ui)?[\s>]/i.test(html), false)
    }
    await page.goto(`${url}/?scoped`)
    await page.locator('#scoped-ready').filter({ hasText: 'Both elements ready' }).waitFor()
    assert.equal(await page.locator('#scoped-identity').textContent(), 'true')
    const observed = []
    for (const kind of ['runtime', 'ui']) {
      const host = page.locator(`${kind === 'ui' ? 'tr-chat-ui' : 'tr-chat'}#scoped-${kind}`)
      const editor = host.locator('.tr-sender-editor')
      await host.locator('[data-scoped-welcome] .tr-sender-editor').waitFor()
      assert.equal(await editor.count(), 1)
      await host.locator('[data-scope-action="replace"]').click()
      await page.waitForFunction(
        (id) => document.querySelector(`${id} .tr-sender-editor`)?.textContent === 'Template from DOM renderer',
        `${kind === 'ui' ? 'tr-chat-ui' : 'tr-chat'}#scoped-${kind}`,
      )
      await editor.focus()
      await editor.evaluate(async (element) => {
        await new Promise((resolve) => requestAnimationFrame(resolve))
        const text = element.querySelector('p').firstChild
        const range = document.createRange()
        range.setStart(text, 0)
        range.setEnd(text, 8)
        const selection = getSelection()
        selection.removeAllRanges()
        selection.addRange(range)
        await new Promise((resolve) => requestAnimationFrame(resolve))
      })
      assert.equal(await page.evaluate(() => getSelection()?.toString()), 'Template')
      await host.locator('[data-scope-action="insert"]').click()
      await page.waitForFunction(
        (id) => document.querySelector(`${id} .tr-sender-editor`)?.textContent?.startsWith('Inserted '),
        `${kind === 'ui' ? 'tr-chat-ui' : 'tr-chat'}#scoped-${kind}`,
      )
      await host.locator('[data-scope-action="append"]').click()
      await page.waitForFunction(
        (id) => document.querySelector(`${id} .tr-sender-editor`)?.textContent?.endsWith(' + note'),
        `${kind === 'ui' ? 'tr-chat-ui' : 'tr-chat'}#scoped-${kind}`,
      )
      // Native paragraphs contribute line breaks; textContent would concatenate them.
      const draft = await editor.innerText()
      assert.ok(draft.startsWith('Inserted ') && draft.endsWith(' + note'))
      if (kind === 'ui')
        await page.waitForFunction((draft) => document.querySelector('#scoped-draft')?.textContent === draft, draft)
      await host.getByText('local-note.txt', { exact: true }).waitFor()
      await host.getByRole('button', { name: '添加附件', exact: true }).waitFor()
      await host.getByRole('button', { name: 'Tool', exact: true }).click()
      assert.equal(await page.locator('#scoped-contract').textContent(), 'DOM-only')
      await page.locator(`#${kind}-replace-welcome`).click()
      await host.locator('[data-scoped-welcome="Updated welcome"] .tr-sender-editor').waitFor()
      assert.equal(await editor.innerText(), draft)
      assert.equal(await editor.count(), 1)
      await page.locator(`#${kind}-retired`).click()
      await page.waitForFunction(
        (kind) => document.querySelector('#scoped-retired')?.textContent === `${kind}:aborted=true,focus=false`,
        kind,
      )
      assert.equal(await editor.innerText(), draft)
      await page.locator(`#${kind}-default`).click()
      await page.waitForFunction(
        (id) => !document.querySelector(`${id} [data-scoped-welcome]`),
        `${kind === 'ui' ? 'tr-chat-ui' : 'tr-chat'}#scoped-${kind}`,
      )
      assert.equal(await editor.count(), 1)
      assert.equal(await editor.innerText(), draft)
      await page.locator(`#${kind}-custom`).click()
      await host.locator('[data-scoped-welcome="Workspace welcome"] .tr-sender-editor').waitFor()
      assert.equal(await editor.innerText(), draft)
      assert.equal(await editor.count(), 1)
      const detail = await editor.evaluate((element) => {
        const host = element.closest('tr-chat,tr-chat-ui')
        const transfer = new DataTransfer()
        transfer.items.add(new File(['local'], 'scope-event.txt'))
        const original = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer })
        let detail
        host.addEventListener(
          'sender-paste',
          (event) => {
            detail = event.detail
          },
          { once: true },
        )
        element.dispatchEvent(original)
        return { sameEvent: detail === original, canceled: original.defaultPrevented }
      })
      assert.deepEqual(detail, { sameEvent: true, canceled: true })
      await host.locator('.tr-sender-submit-button').waitFor({ state: 'visible' })
      observed.push({ kind, draft, scope: 'DOM-only', editorCount: 1, retired: 'aborted=true,focus=false', detail })
    }
    await page.locator('.scoped-demo').evaluate((element) => {
      element.scrollTop = 0
    })
    await page.screenshot({ path: path.join(output, `${mode}-desktop.png`) })
    await page.setViewportSize({ width: 390, height: 844 })
    for (const kind of ['runtime', 'ui']) {
      const host = page.locator(`${kind === 'ui' ? 'tr-chat-ui' : 'tr-chat'}#scoped-${kind}`)
      await page.locator(`#${kind}-replace-welcome`).locator('..').locator('..').scrollIntoViewIfNeeded()
      await host.locator('.tr-sender').scrollIntoViewIfNeeded()
      const geometry = await host.evaluate((host) => {
        const frame = host.parentElement.getBoundingClientRect()
        const layout = host.querySelector('.tr-chat-ui').getBoundingClientRect()
        const editor = host.querySelector('.tr-sender-editor').getBoundingClientRect()
        const sender = host.querySelector('.tr-sender').getBoundingClientRect()
        const demo = document.querySelector('.scoped-demo')
        const buttons = [...host.querySelectorAll('.tr-sender button')]
          .map((button) => button.getBoundingClientRect())
          .filter((rect) => rect.width > 0 && rect.height > 0)
        return {
          overflow: demo.scrollWidth - demo.clientWidth,
          viewport: innerWidth,
          layoutFits: layout.height <= frame.height + 1,
          editorFits: editor.left >= frame.left && editor.right <= frame.right,
          buttonsFit: buttons.every((rect) => rect.left >= sender.left && rect.right <= sender.right),
        }
      })
      assert.deepEqual(geometry, { overflow: 0, viewport: 390, layoutFits: true, editorFits: true, buttonsFit: true })
      await page.screenshot({ path: path.join(output, `${mode}-mobile-390-${kind}.png`) })
    }
    assert.deepEqual(errors, [])
    results.push({ mode, result: 'passed', propertyIdentity: true, observed, errors })
    console.log(`${mode}: passed`)
    await context.close()
  }
} finally {
  await browser.close()
}
fs.writeFileSync(path.resolve(output, '../browser-results.json'), JSON.stringify(results, null, 2) + '\n')
