import { chromium, expect } from '@playwright/test'

const url = process.argv[2] || 'http://127.0.0.1:4173/components/quick-assist.html'
const standalone = new URL(url).pathname.endsWith('/docs/demos/quick-assist/vanilla.html')
const screenshotRoot = process.argv[3]
const browser = await chromium.launch({ headless: true })

// Check the rendered foreground against ancestor backgrounds, including translucent warning panels.
async function checkThemeContrast(locator) {
  await expect
    .poll(() =>
      locator.evaluateAll((elements) => {
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = 1
        const context = canvas.getContext('2d')
        const rgba = (value) => {
          context.clearRect(0, 0, 1, 1)
          context.fillStyle = value
          context.fillRect(0, 0, 1, 1)
          return Array.from(context.getImageData(0, 0, 1, 1).data)
        }
        const luminance = (rgb) =>
          rgb.slice(0, 3).reduce((sum, value, index) => {
            const channel = value / 255
            return (
              sum +
              (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4) *
                [0.2126, 0.7152, 0.0722][index]
            )
          }, 0)
        return elements.flatMap((element) => {
          const layers = []
          for (let node = element; node; node = node.parentElement)
            layers.unshift(rgba(getComputedStyle(node).backgroundColor))
          let background = [255, 255, 255]
          for (const layer of layers)
            background = background.map(
              (channel, index) => (layer[index] * layer[3]) / 255 + channel * (1 - layer[3] / 255),
            )
          const color = rgba(getComputedStyle(element).color)
          const foreground = background.map(
            (channel, index) => (color[index] * color[3]) / 255 + channel * (1 - color[3] / 255),
          )
          const light = luminance(foreground)
          const dark = luminance(background)
          const contrast = (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05)
          return contrast < 4.5 ? [`${element.className || element.tagName}: ${contrast.toFixed(2)}`] : []
        })
      }),
    )
    .toEqual([])
}

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
  const pageErrors = []
  const loadErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('requestfailed', (request) => loadErrors.push(`${request.url()}: ${request.failure()?.errorText}`))
  page.on('response', (response) => {
    if (response.status() >= 400) loadErrors.push(`${response.status()} ${response.url()}`)
  })
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
    throw new Error(
      `Docs HTML preview did not render: ${JSON.stringify(frames)}; errors=${[...pageErrors, ...loadErrors].join('; ')}`,
      {
        cause: error,
      },
    )
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
  // Exercise live switching in both directions; the HTML iframe must follow its parent.
  for (const mode of ['dark', 'light', 'dark']) {
    if (standalone) {
      await page.emulateMedia({ colorScheme: mode })
    } else {
      const dark = await page.locator('html').evaluate((element) => element.classList.contains('dark'))
      if (dark !== (mode === 'dark')) await page.getByTitle('Toggle theme', { exact: true }).click()
      await expect(page.locator('html')).toHaveAttribute('data-tr-color-mode', mode)
      await checkThemeContrast(
        page.locator(
          [
            '.qa-demo__page',
            '.qa-demo__page [data-sensitive]',
            '.qa-demo__open',
            '.qa-position-demo label',
            '.qa-position-demo select',
            '#qa-position-text',
            '.qa-delay-demo button',
            '#qa-delay-text',
            '.qa-delay-demo__status',
            '.qa-feature-demo__hint',
            '.qa-feature-demo__text',
            '.qa-feature-demo__allowed',
            '.qa-feature-demo [data-sensitive]',
            '.qa-feature-demo [data-qa-ignore]',
            '.qa-feature-demo button',
            '.qa-feature-demo__status',
            '.qa-remote-demo',
            '.qa-remote-demo select',
            '.qa-remote-demo__hint',
            '.qa-validation-demo',
            '.qa-validation-demo select',
            '.qa-validation-demo__kept',
          ].join(', '),
        ),
      )
    }
    await expect(demo.locator('html')).toHaveAttribute('data-theme', mode)
    await checkThemeContrast(demo.locator('body, article, [data-sensitive], button, .status'))
    if (screenshotRoot && !standalone) {
      await page
        .locator('.qa-position-demo')
        .screenshot({ path: `${screenshotRoot}/theme-${mode}.png`, animations: 'disabled' })
    }
  }
  if (!standalone) {
    const frame = await page
      .locator('iframe')
      .first()
      .evaluate((element) => ({
        height: element.clientHeight,
        contentHeight: element.contentDocument?.documentElement.scrollHeight ?? 0,
      }))
    expect(frame.height).toBeGreaterThanOrEqual(540)
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
  await checkThemeContrast(demo.locator('.tr-quick-assist__trigger'))
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
  await checkThemeContrast(demo.locator('.tr-quick-assist__popover textarea, .tr-quick-assist__popover button'))
  if (!standalone) {
    for (const selector of [
      '#qa-delay-text',
      '#qa-position-text',
      '#qa-recommendations-text',
      '#qa-context-text',
      '#qa-scope-allowed',
      '#qa-lifecycle-text',
    ]) {
      await expect(page.locator(selector)).toBeVisible()
    }
    const positionDemo = page.locator('.qa-position-demo')
    const selectPositionText = async (backward) => {
      await page.locator('#qa-position-text').scrollIntoViewIfNeeded()
      await page.locator('#qa-position-text').evaluate((element, reverse) => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
        const nodes = []
        for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node)
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        window
          .getSelection()
          .setBaseAndExtent(
            reverse ? last : first,
            reverse ? last.length : 0,
            reverse ? first : last,
            reverse ? 0 : last.length,
          )
        document.dispatchEvent(new Event('selectionchange'))
      }, backward)
    }
    await selectPositionText(false)
    await expect(page.locator('.tr-quick-assist__trigger')).toHaveAttribute('data-placement', 'bottom-end')
    await selectPositionText(true)
    await expect(page.locator('.tr-quick-assist__trigger')).toHaveCount(0)
    await positionDemo.getByRole('checkbox').uncheck()
    await positionDemo.getByRole('combobox').selectOption('top-start')
    await selectPositionText(true)
    await expect(page.locator('.tr-quick-assist__trigger')).toHaveAttribute('data-placement', 'top-start')
    await page.keyboard.press('Escape')
    const delayText = page.locator('#qa-delay-text')
    await delayText.scrollIntoViewIfNeeded()
    await delayText.evaluate((element) => {
      const range = document.createRange()
      range.setStart(element.firstChild, 0)
      range.setEnd(element.firstChild, 4)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      document.dispatchEvent(new Event('selectionchange'))
    })
    await expect(page.locator('.tr-quick-assist__trigger')).toHaveCount(0)
    await expect(page.locator('.tr-quick-assist__trigger')).toBeVisible()
    await page.getByRole('button', { name: '立即显示' }).click()
    await delayText.evaluate((element) => {
      const range = document.createRange()
      range.setStart(element.firstChild, 0)
      range.setEnd(element.firstChild, 4)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      document.dispatchEvent(new Event('selectionchange'))
    })
    await expect(page.locator('.tr-quick-assist__trigger')).toBeVisible()
    await page.keyboard.press('Escape')
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

    const contextText = page.locator('#qa-context-tenant')
    await contextText.scrollIntoViewIfNeeded()
    await contextText.evaluate((element) => {
      const range = document.createRange()
      range.selectNodeContents(element)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      document.dispatchEvent(new Event('selectionchange'))
    })
    await expect(page.locator('.tr-quick-assist__trigger'), '租户编号划词应显示入口').toBeVisible()
    await page.locator('.tr-quick-assist__trigger').click()
    await page.locator('.tr-quick-assist__popover textarea').press('Enter')
    await expect(page.locator('#qa-context-text').locator('..').locator('pre')).toContainText('[已脱敏]')
    const submittedContext = JSON.parse(
      await page.locator('#qa-context-text').locator('..').locator('pre').textContent(),
    )
    expect(submittedContext.上下文.text).toBe('[已脱敏]')
    expect(submittedContext.上下文.selection.text).toBe('[已脱敏]')
    expect(submittedContext.上下文.nearbyText).toContain('[已脱敏]')
    expect(submittedContext.上下文.businessContext.tenantId).toBe('[已脱敏]')
    expect(JSON.stringify(submittedContext)).not.toContain('tenant-demo-4812')
    const sensitiveText = page.locator('#qa-context-text [data-sensitive]')
    await sensitiveText.evaluate((element) => {
      const range = document.createRange()
      range.selectNodeContents(element)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      document.dispatchEvent(new Event('selectionchange'))
    })
    await expect(page.locator('.tr-quick-assist__trigger')).toHaveCount(0)

    // Exercise the actual adapter with enough messages to overflow the panel.
    const chatDemo = page.locator('.qa-demo')
    await chatDemo.getByRole('button', { name: '打开 AI 对话', exact: true }).click()
    await checkThemeContrast(
      chatDemo.locator('.qa-demo__assistant, .qa-demo__assistant-head p, .qa-demo__badge, .qa-demo__empty'),
    )
    const chatText = chatDemo.locator('.qa-demo__page p').first()
    for (let index = 0; index < 8; index++) {
      await chatText.scrollIntoViewIfNeeded()
      await chatText.evaluate((element) => {
        const range = document.createRange()
        range.selectNodeContents(element)
        const selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)
        document.dispatchEvent(new Event('selectionchange'))
      })
      await page.locator('.tr-quick-assist__trigger').click()
      await page.locator('.tr-quick-assist__popover textarea').press('Enter')
      await expect(chatDemo.locator('.tr-bubble')).toHaveCount((index + 1) * 2)
    }
    const checkChatHeight = async (maxHeight) => {
      const geometry = await chatDemo.evaluate((element) => {
        const panel = element.querySelector('.qa-demo__assistant')
        const messages = element.querySelector('.qa-demo__messages')
        const panelRect = panel.getBoundingClientRect()
        const senderRect = panel.lastElementChild.getBoundingClientRect()
        return {
          height: element.getBoundingClientRect().height,
          panelHeight: panel.clientHeight,
          panelContent: panel.scrollHeight,
          messagesHeight: messages.clientHeight,
          messagesContent: messages.scrollHeight,
          senderHeight: senderRect.height,
          senderBottom: senderRect.bottom,
          panelBottom: panelRect.bottom,
        }
      })
      expect(geometry.height).toBeLessThanOrEqual(maxHeight)
      expect(geometry.panelContent).toBeLessThanOrEqual(geometry.panelHeight + 1)
      expect(geometry.messagesContent).toBeGreaterThan(geometry.messagesHeight)
      expect(geometry.messagesHeight).toBeGreaterThanOrEqual(80)
      expect(geometry.senderHeight).toBeGreaterThan(0)
      expect(geometry.senderBottom).toBeLessThanOrEqual(geometry.panelBottom)
    }
    await checkChatHeight(560)
    if (screenshotRoot) {
      await chatDemo.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
      await chatDemo.screenshot({ path: `${screenshotRoot}/chat-desktop.png`, animations: 'disabled' })
    }
    await chatDemo.locator('summary').click()
    await checkChatHeight(560)

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
    await checkChatHeight(900)
    if (screenshotRoot) {
      await page.setViewportSize({ width: 390, height: 1100 })
      await chatDemo.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
      await chatDemo.screenshot({ path: `${screenshotRoot}/chat-mobile.png`, animations: 'disabled' })
      await page.setViewportSize({ width: 390, height: 900 })
    }
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
  if (!standalone) {
    await page.setViewportSize({ width: 1280, height: 1000 })
    const themeDemo = page.frameLocator('iframe').nth(1)
    await expect(themeDemo.locator('html')).toHaveAttribute('data-quick-assist-ready', 'true')
    const themeContainer = page.locator('.qa-theme-demo .vitepress-demo-plugin__container')
    const checkThemeFrameLayout = async () => {
      await expect
        .poll(() =>
          themeContainer.evaluate((element) => {
            const frame = element.querySelector('iframe').getBoundingClientRect()
            const preview = element.querySelector('.vitepress-demo-plugin-preview').getBoundingClientRect()
            const description = element.querySelector('.vitepress-demo-plugin-description').getBoundingClientRect()
            const container = element.getBoundingClientRect()
            return (
              frame.bottom <= preview.bottom &&
              frame.bottom <= description.top &&
              description.bottom <= container.bottom
            )
          }),
        )
        .toBe(true)
    }
    await checkThemeFrameLayout()
    const parentMode = await page.locator('html').getAttribute('data-tr-color-mode')
    for (const mode of ['dark', 'light']) {
      await themeDemo.locator('#theme-mode').selectOption(mode)
      await expect(themeDemo.locator('html')).toHaveAttribute('data-cf-theme', mode)
      await themeDemo.locator('#theme-term').scrollIntoViewIfNeeded()
      await themeDemo.locator('#theme-term').evaluate((element) => {
        const range = document.createRange()
        range.selectNodeContents(element)
        const selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)
        document.dispatchEvent(new Event('selectionchange'))
      })
      await themeDemo.locator('.tr-quick-assist__trigger').click()
      await expect(themeDemo.locator('.tr-quick-assist__popover')).toHaveCSS(
        'background-color',
        mode === 'dark' ? 'rgb(38, 38, 38)' : 'rgb(255, 255, 255)',
      )
      await checkThemeContrast(
        themeDemo.locator('body, #theme-text, #theme-status, .tr-quick-assist__input, .tr-quick-assist__suggestion'),
      )
      if (screenshotRoot) {
        await themeContainer.screenshot({ path: `${screenshotRoot}/theme-demo-${mode}.png`, animations: 'disabled' })
      }
      await themeDemo.locator('.tr-quick-assist__input').fill('主题示例提交')
      await themeDemo.locator('.tr-quick-assist__input').press('Enter')
      await expect(themeDemo.locator('#theme-status')).toHaveText('已提交：主题示例提交')
      await expect(page.locator('html')).toHaveAttribute('data-tr-color-mode', parentMode)
    }
    await themeDemo.locator('#theme-mode').selectOption('auto')
    for (const mode of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: mode })
      await expect(themeDemo.locator('html')).toHaveAttribute('data-cf-theme', mode)
      await expect(themeDemo.locator('#theme-status')).toContainText('跟随系统')
    }
    await page.setViewportSize({ width: 390, height: 900 })
    await themeDemo.locator('#theme-mode').selectOption('dark')
    expect(await themeDemo.locator('html').evaluate((element) => element.scrollWidth <= window.innerWidth)).toBe(true)
    await checkThemeFrameLayout()
    if (screenshotRoot) {
      await themeContainer.evaluate((element) => {
        window.scrollBy(0, element.getBoundingClientRect().top - 120)
      })
      await themeContainer.screenshot({ path: `${screenshotRoot}/theme-demo-mobile.png`, animations: 'disabled' })
    }
  }
  if (pageErrors.length) throw new Error(`Docs page errors: ${pageErrors.join('; ')}`)
  console.log(`QuickAssist HTML demo: trigger and popover visible ${standalone ? 'standalone' : 'in the docs iframe'}.`)
} finally {
  await browser.close()
}
