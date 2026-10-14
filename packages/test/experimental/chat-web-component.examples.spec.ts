import { expect, type Locator, type Page, test } from '@playwright/test'

type ChatElement = HTMLElement & { send(payload: { text: string }): Promise<boolean> }
type ChatUIElement = HTMLElement & { data?: { conversation?: { title?: string } } }

type ExampleId =
  | 'basic'
  | 'layout-presets'
  | 'welcome-prompts'
  | 'sender-options'
  | 'bubble-options'
  | 'runtime-error'
  | 'history-groups'
  | 'slots-basic'
  | 'right-aside-panel'
  | 'floating-layout'
  | 'responsive-layout'
  | 'controlled-ui'
  | 'runtime-actions'
  | 'runtime-before-send'
  | 'runtime-composer'
  | 'runtime-conversations'
  | 'runtime-send'
  | 'runtime-adapter'

interface ExampleContext {
  card: Locator
  host: Locator
  element: Locator
  consoleErrors: string[]
}

async function openExample(page: Page, id: ExampleId): Promise<ExampleContext> {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  await page.goto('/experiments/chat-web-component')

  const card = page.locator(`[data-example-id="${id}"]`)
  const host = card.locator(`[data-example-host="${id}"]`)
  const element = host.locator(':scope > :is(tr-chat, tr-chat-ui)')
  await expect(card).toHaveAttribute('data-mount-status', 'ready')
  await expect(card.getByText(`Vue baseline: ../chat/${id}.vue`)).toBeVisible()

  if (id === 'floating-layout') {
    await expect(element).toHaveCount(0)
  } else {
    await expect(element).toBeVisible()
    const layout = element.locator('.tr-layout')
    await expect(layout).toBeVisible()
    await expect(layout.locator('.tr-layout__body')).toHaveCSS('display', 'grid')
    const geometry = await host.evaluate((node) => {
      const layout = node.querySelector<HTMLElement>('.tr-layout')
      return {
        width: node.getBoundingClientRect().width,
        height: node.getBoundingClientRect().height,
        horizontalOverflow: node.scrollWidth - node.clientWidth,
        layoutHeight: layout?.getBoundingClientRect().height ?? 0,
      }
    })
    expect(geometry.width).toBeGreaterThan(240)
    expect(geometry.height).toBeGreaterThanOrEqual(400)
    expect(geometry.horizontalOverflow).toBeLessThanOrEqual(2)
    expect(geometry.layoutHeight).toBeGreaterThan(0)
    expect(geometry.layoutHeight).toBeLessThanOrEqual(geometry.height)
  }

  return { card, host, element, consoleErrors }
}

function editor(card: Locator) {
  return card.locator('.tr-sender-editor')
}

function expectNoConsoleErrors(errors: string[]) {
  expect(errors).toEqual([])
}

test.describe('TrChat Web Component documented examples', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'The complete per-example matrix runs in Chromium.')
  })

  test('basic: renders, accepts input, and sends through the owned Runtime', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'basic')
    await expect(card.getByText('TinyRobot AI 助手')).toBeVisible()
    await editor(card).fill('浏览器基础发送')
    await card.locator('.tr-sender-submit-button').click()
    await expect(card.locator('.tr-bubble').getByText('浏览器基础发送', { exact: true })).toBeVisible()
    await expect(card.locator('.tr-bubble').getByText('Web Component 已收到：浏览器基础发送')).toBeVisible()
    expectNoConsoleErrors(consoleErrors)
  })

  test('layout-presets: updates content width and side-bar layout for every control', async ({ page }) => {
    const { card, element, consoleErrors } = await openExample(page, 'layout-presets')
    const layout = element.locator('.tr-layout')

    await card.getByRole('button', { name: '标准', exact: true }).click()
    await expect(layout).toHaveCSS('--tr-chat-ui-content-max-width', '980px')
    await expect(layout.locator('.tr-layout__aside--left')).toBeAttached()

    await card.getByRole('button', { name: '紧凑', exact: true }).click()
    await expect(layout).toHaveCSS('--tr-chat-ui-content-max-width', '620px')
    await expect(layout).toHaveCSS('--left-dock-width', '220px')

    await card.getByRole('button', { name: '无侧栏', exact: true }).click()
    await expect(layout).toHaveCSS('--tr-chat-ui-content-max-width', '720px')
    await expect(layout).not.toHaveClass(/tr-layout--left-(?:expanded|rail)/)
    expectNoConsoleErrors(consoleErrors)
  })

  test('welcome-prompts: renders prompts and writes prompt detail back to the controlled input', async ({ page }) => {
    const { card, element, consoleErrors } = await openExample(page, 'welcome-prompts')
    await expect(card.getByText('Web Component 助手')).toBeVisible()
    await card.getByText('验证事件', { exact: true }).click()
    await expect(element).toHaveJSProperty('inputValue', '验证事件')
    await expect(editor(card)).toContainText('验证事件')
    await expect(card.locator('[data-event-log]')).toContainText('prompt-click: 验证事件')
    expectNoConsoleErrors(consoleErrors)
  })

  test('sender-options: shows the default value, word limit, editing, and clear action', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'sender-options')
    await expect(editor(card)).toContainText('可编辑的默认问题')
    await expect(card.locator('.tr-sender-word-counter')).toContainText('/80')
    await editor(card).fill('更新后的输入')
    await expect(card.locator('.tr-sender-word-counter')).toContainText('6/80')
    await card.locator('.tr-action-button').click()
    await expect(editor(card)).toHaveText('')
    expectNoConsoleErrors(consoleErrors)
  })

  test('bubble-options: renders both roles with opposite visual placement', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'bubble-options')
    await expect(card.getByText('请验证 Web Component。')).toBeVisible()
    await expect(card.getByText('消息渲染、布局和交互均由原 TrChat Vue 组件提供。')).toBeVisible()
    await expect(card.locator('.tr-bubble[data-role="user"]')).toHaveAttribute('data-placement', 'end')
    await expect(card.locator('.tr-bubble[data-role="assistant"]')).toHaveAttribute('data-placement', 'start')
    expectNoConsoleErrors(consoleErrors)
  })

  test('runtime-error: exposes the failure and recovers after replacing Runtime', async ({ page }) => {
    const { card, element, consoleErrors } = await openExample(page, 'runtime-error')
    await card.getByRole('button', { name: '触发失败', exact: true }).click()
    await expect(card.locator('[data-event-log]')).toContainText('runtime-action-error: 模拟 Runtime 失败')
    await card.getByRole('button', { name: '恢复 Runtime', exact: true }).click()
    await expect(card.locator('[data-event-log]')).toContainText('Runtime 已恢复')
    const recovered = await element.evaluate((node: ChatElement) => node.send({ text: '恢复验证' }))
    expect(recovered).toBe(true)
    expectNoConsoleErrors(consoleErrors)
  })

  test('history-groups: renders grouped history and the active item in the side bar', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'history-groups')
    await expect(card.getByText('今天', { exact: true })).toBeVisible()
    await expect(card.getByText('更早', { exact: true })).toBeVisible()
    await expect(card.getByText('今天的会话', { exact: true }).first()).toBeVisible()
    await expect(card.getByText('旧会话', { exact: true })).toBeVisible()
    await expect(card.locator('.tr-history__item.selected')).toContainText('今天的会话')
    expectNoConsoleErrors(consoleErrors)
  })

  test('slots-basic: renders Light DOM, passes context, and aborts replaced renderers', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'slots-basic')
    await expect(card.getByText('原生 Light DOM notice slot')).toBeVisible()
    await expect(card.locator('[data-renderer-output]')).toContainText('DOM renderer：Slot 示例')
    await card.getByRole('button', { name: '替换 renderer', exact: true }).click()
    await expect(card.locator('[data-renderer-output]')).toContainText('新 renderer：Slot 示例')
    await expect(card.locator('[data-event-log]')).toContainText('renderer aborted')
    expectNoConsoleErrors(consoleErrors)
  })

  test('right-aside-panel: opens, activates, and closes the renderer-backed panel', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'right-aside-panel')
    const controls = card.locator('[data-controls]')
    await controls.getByRole('button', { name: '打开详情', exact: true }).click()
    await expect(card.getByText('当前面板：details')).toBeVisible()
    await expect(card.locator('.tr-layout__aside--right')).toHaveClass(/tr-layout__aside--expanded/)
    await controls.getByRole('button', { name: '关闭详情', exact: true }).click()
    const rightAside = card.locator('.tr-layout__aside--right')
    await expect(rightAside).toHaveClass(/tr-layout__aside--hidden/)
    await expect(rightAside).toHaveAttribute('inert', '')
    expectNoConsoleErrors(consoleErrors)
  })

  test('floating-layout: renders at the controlled rect and reports drag and resize updates', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'floating-layout')
    const floating = page.locator('.tr-layout--floating')
    await card.evaluate((root) => {
      const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-controls] button')]
      buttons.find((button) => button.textContent === '打开浮动聊天')?.click()
      buttons.find((button) => button.textContent === '关闭浮动聊天')?.click()
    })
    await expect(floating).toHaveCount(0)
    await expect(card.locator('[data-event-log]')).toContainText('浮动聊天已关闭')

    await card.getByRole('button', { name: '打开浮动聊天', exact: true }).click()
    await expect(floating).toBeVisible()
    await expect(floating.locator('.tr-layout__body')).toHaveCSS('display', 'grid')
    await expect(floating).toContainText('浮动布局')
    const initial = await floating.boundingBox()
    expect(initial).toMatchObject({ x: 16, y: 16, width: 560, height: 360 })

    const dragBar = floating.locator('.tr-layout__drag-bar')
    const dragBox = await dragBar.boundingBox()
    expect(dragBox).not.toBeNull()
    await page.mouse.move(dragBox!.x + dragBox!.width / 2, dragBox!.y + dragBox!.height / 2)
    await page.mouse.down()
    await page.mouse.move(dragBox!.x + dragBox!.width / 2 + 40, dragBox!.y + dragBox!.height / 2 + 30)
    await page.mouse.up()
    await expect(card.locator('[data-event-log]')).toContainText('floating-state-update')
    const moved = await floating.boundingBox()
    expect(moved!.x).toBeGreaterThan(initial!.x)
    expect(moved!.y).toBeGreaterThan(initial!.y)

    const resize = floating.locator('.tr-layout__floating-resize-trigger--se')
    const resizeBox = await resize.boundingBox()
    expect(resizeBox).not.toBeNull()
    await page.mouse.move(resizeBox!.x + resizeBox!.width / 2, resizeBox!.y + resizeBox!.height / 2)
    await page.mouse.down()
    await page.mouse.move(resizeBox!.x + resizeBox!.width / 2 + 40, resizeBox!.y + resizeBox!.height / 2 + 30)
    await page.mouse.up()
    const resized = await floating.boundingBox()
    expect(resized!.width).toBeGreaterThan(moved!.width)
    expect(resized!.height).toBeGreaterThan(moved!.height)
    await card.getByRole('button', { name: '关闭浮动聊天', exact: true }).click()
    await expect(floating).toHaveCount(0)
    await expect(card.locator('[data-event-log]')).toContainText('浮动聊天已关闭')
    expectNoConsoleErrors(consoleErrors)
  })

  test('responsive-layout: switches between narrow and wide containers without overflow', async ({ page }) => {
    const { card, host, consoleErrors } = await openExample(page, 'responsive-layout')
    await card.getByRole('button', { name: '窄屏', exact: true }).click()
    await expect(host).toHaveCSS('max-width', '520px')
    await expect(card.locator('.tr-layout')).toHaveClass(/tr-layout--left-drawer/)
    expect(await host.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(2)

    await card.getByRole('button', { name: '宽屏', exact: true }).click()
    await expect(host).toHaveCSS('max-width', '100%')
    expect(await host.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(2)
    expectNoConsoleErrors(consoleErrors)
  })

  test('controlled-ui: applies host updates and writes user edits back through update events', async ({ page }) => {
    const { card, element, consoleErrors } = await openExample(page, 'controlled-ui')
    await card.getByRole('button', { name: '外部更新', exact: true }).click()
    await expect(element).toHaveJSProperty('inputValue', '由宿主更新的值')
    await editor(card).fill('浏览器受控输入')
    await expect(element).toHaveJSProperty('inputValue', '浏览器受控输入')
    await expect(card.locator('[data-event-log]')).toContainText('input-value-update: 浏览器受控输入')
    expectNoConsoleErrors(consoleErrors)
  })

  test('runtime-actions: starts streaming and aborts the in-flight request', async ({ page }) => {
    const { card, host, consoleErrors } = await openExample(page, 'runtime-actions')
    await card.getByRole('button', { name: '发送预设问题', exact: true }).click()
    await expect(card.locator('.tr-bubble').getByText('外部发送', { exact: true })).toBeVisible()
    await card.getByRole('button', { name: '停止请求', exact: true }).click()
    await expect(host).toHaveAttribute('data-abort-status', 'complete')
    await page.waitForTimeout(550)
    await expect(card.getByText('Web Component 流式响应已完成', { exact: true })).toHaveCount(0)
    expectNoConsoleErrors(consoleErrors)
  })

  test('runtime-before-send: rejects logged-out send and continues after login', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'runtime-before-send')
    const bubbles = card.locator('.tr-bubble')
    const initialCount = await bubbles.count()
    await editor(card).fill('输入必须保留')
    await card.getByRole('button', { name: '尝试发送', exact: true }).click()
    await expect(card.locator('[data-event-log]')).toContainText('send: false')
    await expect(bubbles).toHaveCount(initialCount)
    await expect(editor(card)).toContainText('输入必须保留')

    await card.getByRole('checkbox', { name: '已登录' }).check()
    await card.getByRole('button', { name: '尝试发送', exact: true }).click()
    await expect(card.locator('[data-event-log]')).toContainText('send: true')
    await expect(card.locator('.tr-bubble').getByText('登录检查', { exact: true })).toBeVisible()
    expectNoConsoleErrors(consoleErrors)
  })

  test('runtime-composer: enforces disabled, submit-disabled, and restored states', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'runtime-composer')
    const sender = card.locator('.tr-sender')
    await card.getByRole('button', { name: '禁用输入', exact: true }).click()
    await expect(sender).toHaveClass(/is-disabled/)

    await card.getByRole('button', { name: '仅禁用提交', exact: true }).click()
    await expect(sender).not.toHaveClass(/is-disabled/)
    await editor(card).fill('提交状态验证')
    await expect(card.locator('.tr-sender-submit-button')).toHaveClass(/is-disabled/)

    await card.getByRole('button', { name: '恢复', exact: true }).click()
    await expect(card.locator('.tr-sender-submit-button')).not.toHaveClass(/is-disabled/)
    expectNoConsoleErrors(consoleErrors)
  })

  test('runtime-conversations: replaces the visible active conversation in both directions', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'runtime-conversations')
    await expect(card.getByText('当前：会话一')).toBeVisible()
    await card.getByRole('button', { name: '切换会话二', exact: true }).click()
    await expect(card.getByText('当前：会话二')).toBeVisible()
    await expect(card.getByText('会话二', { exact: true }).first()).toBeVisible()
    await card.getByRole('button', { name: '回到会话一', exact: true }).click()
    await expect(card.getByText('当前：会话一')).toBeVisible()
    expectNoConsoleErrors(consoleErrors)
  })

  test('runtime-send: returns the Runtime result and appends user and assistant messages', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'runtime-send')
    await card.getByRole('button', { name: '调用 send()', exact: true }).click()
    await expect(card.locator('[data-event-log]')).toContainText('send result: true')
    await expect(card.locator('.tr-bubble').getByText('直接调用 send', { exact: true })).toBeVisible()
    await expect(card.locator('.tr-bubble').getByText('Web Component 已收到：直接调用 send')).toBeVisible()
    expectNoConsoleErrors(consoleErrors)
  })

  test('runtime-adapter: emits submit and writes business-owned state back into ChatUI', async ({ page }) => {
    const { card, element, consoleErrors } = await openExample(page, 'runtime-adapter')
    await editor(card).fill('业务状态浏览器验证')
    await card.locator('.tr-sender-submit-button').click()
    await expect(card.locator('[data-event-log]')).toContainText('submit: 业务状态浏览器验证')
    await expect(card.locator('.tr-bubble').getByText('业务状态浏览器验证', { exact: true })).toBeVisible()
    await expect(card.locator('.tr-bubble').getByText('业务适配器响应')).toBeVisible()
    const dataTitle = await element.evaluate((node: ChatUIElement) => node.data?.conversation?.title)
    expect(dataTitle).toBe('业务自有状态')
    expectNoConsoleErrors(consoleErrors)
  })
})
