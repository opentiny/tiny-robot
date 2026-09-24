import { chromium, expect } from '@playwright/test'

const url = process.argv[2] || 'http://127.0.0.1:4173/components/quick-assist.html'
const standalone = new URL(url).pathname.endsWith('/docs/demos/quick-assist/vanilla.html')
const browser = await chromium.launch({ headless: true })

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.goto(url)
  if (!standalone) await page.locator('h3').filter({ hasText: 'HTML 接入' }).first().scrollIntoViewIfNeeded()

  const demo = standalone ? page : page.frameLocator('iframe').first()
  const paragraph = demo.locator('#guide-content p').first()
  try {
    await expect(paragraph).toBeVisible()
  } catch (error) {
    const frames = await Promise.all(
      page.frames().map(async (frame) => ({
        url: frame.url(),
        body: (
          await frame
            .locator('body')
            .textContent()
            .catch(() => '')
        )?.slice(0, 350),
      })),
    )
    throw new Error(`Docs HTML preview did not render: ${JSON.stringify(frames)}; errors=${pageErrors.join('; ')}`, {
      cause: error,
    })
  }
  await paragraph.scrollIntoViewIfNeeded()
  try {
    await demo.locator('html[data-quick-assist-ready="true"]').waitFor({ timeout: 5000 })
  } catch (error) {
    const status = await demo.locator('#event-status').textContent()
    const assets = await page.evaluate(() => window.__tinyRobotVanillaDemoUmdUrl)
    const frameState = await paragraph.evaluate(() => ({
      baseURI: document.baseURI,
      readyState: document.readyState,
      scripts: [...document.scripts].map((script) => ({ type: script.type, text: script.textContent?.slice(0, 100) })),
      bodyEnd: document.body?.innerHTML.slice(-500),
    }))
    throw new Error(
      `Docs demo did not initialize. status=${status}; assets=${JSON.stringify(assets)}; frame=${JSON.stringify(frameState)}; errors=${pageErrors.join('; ')}`,
      {
        cause: error,
      },
    )
  }
  const umdUrl = standalone
    ? new URL('../../../packages/components/dist/vanilla/vanilla.umd.js', url).href
    : await page.evaluate(() => window.__tinyRobotVanillaDemoUmdUrl)
  await expect
    .poll(() =>
      demo
        .locator('script[src]')
        .evaluateAll(
          (scripts, expected) => scripts.some((script) => script.src === new URL(expected, document.baseURI).href),
          umdUrl,
        ),
    )
    .toBe(true)
  expect(await paragraph.evaluate(() => typeof window.TinyRobotVanilla?.createQuickAssist)).toBe('function')
  await expect(demo.locator('style[data-tr-quick-assist-style]')).toHaveCount(1)
  if (!standalone) {
    const frame = await page
      .locator('iframe')
      .first()
      .evaluate((element) => ({
        height: element.clientHeight,
        contentHeight: element.contentDocument?.documentElement.scrollHeight ?? 0,
      }))
    expect(frame.height).toBeGreaterThanOrEqual(700)
    expect(frame.contentHeight).toBeLessThanOrEqual(frame.height)
  }
  await paragraph.evaluate((element) => {
    const range = document.createRange()
    range.selectNodeContents(element)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    document.dispatchEvent(new Event('selectionchange'))
  })

  await expect(demo.locator('.tr-quick-assist__trigger')).toBeVisible()
  if (!standalone) await page.locator('iframe').first().scrollIntoViewIfNeeded()
  const frameRect = standalone ? { x: 0, y: 0 } : await page.locator('iframe').first().boundingBox()
  const triggerRect = await demo
    .locator('.tr-quick-assist__trigger')
    .evaluate((element) => element.getBoundingClientRect().toJSON())
  await page.mouse.click(frameRect.x + triggerRect.x + triggerRect.width / 2, frameRect.y + triggerRect.y + 15)
  try {
    await expect(demo.locator('.tr-quick-assist__popover textarea')).toBeVisible()
  } catch (error) {
    const state = await demo.locator('#guide-content').evaluate(() => ({
      selected: window.getSelection()?.toString().slice(0, 20),
      trigger: !!document.querySelector('.tr-quick-assist__trigger'),
      status: document.querySelector('#event-status')?.textContent,
    }))
    throw new Error(`Docs demo click did not open the popover: ${JSON.stringify({ frameRect, triggerRect, state })}`, {
      cause: error,
    })
  }
  await expect(demo.locator('#event-status')).not.toContainText('失败')
  if (!standalone) {
    for (const selector of [
      '#qa-recommendations-text',
      '#qa-context-text',
      '#qa-scope-allowed',
      '#qa-lifecycle-text',
    ]) {
      await expect(page.locator(selector)).toBeVisible()
    }
    const recommendationText = page.locator('#qa-recommendations-text p').first()
    await recommendationText.scrollIntoViewIfNeeded()
    await recommendationText.evaluate((element) => {
      const range = document.createRange()
      range.setStart(element.firstChild, 0)
      range.setEnd(element.firstChild, 4)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      document.dispatchEvent(new Event('selectionchange'))
    })
    await expect(page.locator('.tr-quick-assist__trigger')).toBeVisible()
    await page.locator('.tr-quick-assist__trigger').click()
    await expect(page.locator('.tr-quick-assist__popover')).toContainText('解释这个概念')
    await expect(page.locator('.tr-quick-assist__popover')).toContainText('查看注意事项')
    await page.locator('.tr-quick-assist__popover').getByText('查看注意事项').click()
    await expect(page.locator('#qa-recommendations-text').locator('..').locator('pre')).toContainText('查看注意事项')

    const contextText = page.locator('#qa-context-text p').first()
    await contextText.scrollIntoViewIfNeeded()
    await contextText.evaluate((element) => {
      const range = document.createRange()
      range.setStart(element.firstChild, 0)
      range.setEnd(element.firstChild, 3)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      document.dispatchEvent(new Event('selectionchange'))
    })
    await page.locator('.tr-quick-assist__trigger').click()
    await page.locator('.tr-quick-assist__popover textarea').press('Enter')
    await expect(page.locator('#qa-context-text').locator('..').locator('pre')).toContainText('[已脱敏]')

    const longText = page.locator('#qa-scope-allowed p').nth(1)
    await longText.scrollIntoViewIfNeeded()
    await longText.evaluate((element) => {
      const range = document.createRange()
      range.selectNodeContents(element)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      document.dispatchEvent(new Event('selectionchange'))
    })
    await expect(page.locator('.tr-quick-assist__trigger')).toHaveCount(0)
    await page.getByRole('button', { name: '停用划词' }).click()
    await expect(page.locator('.qa-feature-demo__status')).toHaveText('划词已停用，当前界面已关闭')
    await page.getByRole('button', { name: '启用划词' }).click()
    await expect(page.locator('.qa-feature-demo__status')).toHaveText('划词已启用，可以重新选中文字')
    await page.getByRole('button', { name: '模拟路由切换' }).click()
    await expect(page.locator('.qa-feature-demo__status')).toHaveText(
      '已模拟路由切换并关闭当前会话，划词功能仍保持原有启停状态',
    )
    await page.setViewportSize({ width: 390, height: 900 })
    const mobileFrame = await page
      .locator('iframe')
      .first()
      .evaluate((element) => ({
        height: element.clientHeight,
        contentHeight: element.contentDocument?.documentElement.scrollHeight ?? 0,
      }))
    expect(mobileFrame.height).toBeGreaterThanOrEqual(900)
    expect(mobileFrame.contentHeight).toBeLessThanOrEqual(mobileFrame.height)
  }
  if (pageErrors.length) throw new Error(`Docs page errors: ${pageErrors.join('; ')}`)
  console.log(`QuickAssist HTML demo: trigger and popover visible ${standalone ? 'standalone' : 'in the docs iframe'}.`)
} finally {
  await browser.close()
}
