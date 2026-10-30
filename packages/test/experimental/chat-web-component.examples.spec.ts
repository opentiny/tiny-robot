import { expect, type Locator, type Page, test } from '@playwright/test'

type ChatUIElement = HTMLElement & { data?: { conversation?: { title?: string } } }

type ExampleId =
  | 'basic'
  | 'layout-presets'
  | 'welcome-prompts'
  | 'sender-options'
  | 'sender-toolbar'
  | 'extension-tabs'
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
  | 'runtime-subscription'
  | 'complex-properties'
  | 'runtime-ownership'
  | 'event-contract'
  | 'initialization-timing'
  | 'performance-stress'
  | 'ssr-safe-import'
  | 'unified-error-contract'
  | 'bundle-budget'

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
  await expect(card.getByText('Vue baseline:', { exact: false })).toBeVisible()

  if (id === 'floating-layout' || id === 'runtime-send' || id === 'initialization-timing') {
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

async function findExamplesWithInternalVerticalOverflow(page: Page) {
  return page
    .locator('[data-example-id]:not([data-example-id="floating-layout"]):not([data-example-id="performance-stress"])')
    .evaluateAll((cards) =>
      cards.flatMap((card) => {
        const id = card.getAttribute('data-example-id') ?? 'unknown'
        const overflowing = [...card.querySelectorAll<HTMLElement>('*')].filter((node) => {
          const { overflowY } = getComputedStyle(node)
          return ['auto', 'scroll'].includes(overflowY) && node.scrollHeight > node.clientHeight + 1
        })
        return overflowing.length > 0 ? [id] : []
      }),
    )
}

test.describe('TrChat Web Component documented examples', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'The complete per-example matrix runs in Chromium.')
  })

  test('embedded examples provide enough height for their initial UI without internal vertical overflow', async ({
    page,
  }) => {
    await page.goto('/experiments/chat-web-component')
    await expect(page.locator('[data-example-id]')).toHaveCount(29)
    await expect(page.locator('[data-example-id="runtime-adapter"]')).toHaveAttribute('data-mount-status', 'ready')

    expect(await findExamplesWithInternalVerticalOverflow(page)).toEqual([])
  })

  test('narrow documentation examples retain enough height after controls wrap', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 900 })
    await page.goto('/experiments/chat-web-component')
    await expect(page.locator('[data-example-id="runtime-adapter"]')).toHaveAttribute('data-mount-status', 'ready')

    expect(await findExamplesWithInternalVerticalOverflow(page)).toEqual([])
  })

  test('performance-stress: preserves one usable layout through long-session updates and remounts', async ({
    page,
  }) => {
    test.setTimeout(30_000)
    const { card, consoleErrors } = await openExample(page, 'performance-stress')

    await expect(card.getByTestId('performance-status')).toContainText('messages=20')
    await card.getByRole('button', { name: '执行长会话压力', exact: true }).click()
    await expect(card.getByTestId('performance-status')).toContainText('messages=200')
    await expect(card.getByTestId('performance-status')).toContainText('updates=100')
    await expect(card.getByTestId('performance-status')).toContainText('swaps=30')
    await expect(card.locator('tr-chat-ui .tr-layout')).toHaveCount(1)

    await card.getByRole('button', { name: '执行重挂载压力', exact: true }).click()
    await expect(card.getByTestId('performance-status')).toContainText('remounts=30')
    await expect(card.locator('tr-chat-ui')).toHaveCount(1)
    await expect(card.locator('tr-chat-ui .tr-layout')).toHaveCount(1)
    await expect(card.locator('.tr-sender-editor')).toBeVisible()
    expectNoConsoleErrors(consoleErrors)
  })

  test('ssr-safe-import: keeps the browser branch rendered while Node safety is covered by the package test', async ({
    page,
  }) => {
    const { card, consoleErrors } = await openExample(page, 'ssr-safe-import')
    await expect(card.getByTestId('ssr-safe-status')).toContainText('SSR 导入：通过自动化验证')
    await expect(card.getByTestId('ssr-safe-status')).toContainText('当前页面使用 browser 条件入口')
    await expect(card.getByText('浏览器分支仍由原生 TrChatUI 渲染', { exact: false })).toBeVisible()
    expectNoConsoleErrors(consoleErrors)
  })

  test('bundle-budget: exposes measured JavaScript and CSS ceilings beside a native TrChatUI surface', async ({
    page,
  }) => {
    const { card, consoleErrors } = await openExample(page, 'bundle-budget')
    const status = card.getByTestId('bundle-budget-status')
    await expect(status).toContainText('构建体积预算通过')
    await expect(status).toContainText('JavaScript gzip')
    await expect(status).toContainText('CSS gzip')
    await expect(status).toContainText('650.0 KiB')
    await expect(status).toContainText('48.0 KiB')
    expectNoConsoleErrors(consoleErrors)
  })

  test('unified-error-contract: normalizes runtime, renderer, network, and host errors and then recovers', async ({
    page,
  }) => {
    const { card, consoleErrors } = await openExample(page, 'unified-error-contract')
    const status = card.getByTestId('unified-error-panel')

    await card.getByRole('button', { name: '触发 Runtime 错误', exact: true }).click()
    await expect(status).toContainText('source=runtime · code=runtime_action_failed · recoverable=true')

    await card.getByRole('button', { name: '触发 Renderer 错误', exact: true }).click()
    await expect(status).toContainText('source=renderer · code=renderer_failed · recoverable=true')

    await card.getByRole('button', { name: '上报网络错误', exact: true }).click()
    await expect(status).toContainText('source=network · code=network_unavailable · recoverable=true')

    await card.getByRole('button', { name: '上报宿主回调错误', exact: true }).click()
    await expect(status).toContainText('source=host · code=host_callback_failed · recoverable=true')
    await expect(status).toContainText('统一事件 4 次')

    await card.getByRole('button', { name: '恢复并发送', exact: true }).click()
    await expect(status).toContainText('恢复成功：同一元素继续可用')
    await expect(card.getByText('恢复成功：恢复验证', { exact: true })).toBeVisible()
    expectNoConsoleErrors(consoleErrors)
  })

  test('basic: renders, accepts input, and sends through the owned Runtime', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'basic')
    await expect(card.getByText('TinyRobot AI 助手')).toBeVisible()
    await expect(card.locator('.tr-layout__aside--left')).toBeVisible()
    await expect(card.getByRole('button', { name: '应用助手', exact: true })).toBeVisible()
    await editor(card).fill('浏览器基础发送')
    await card.locator('.tr-sender-submit-button').click()
    await expect(card.locator('.tr-bubble').getByText('浏览器基础发送', { exact: true })).toBeVisible()
    await expect(card.locator('.tr-bubble[data-role="assistant"]')).toContainText('浏览器基础发送')
    expectNoConsoleErrors(consoleErrors)
  })

  test('layout-presets: matches all five presets including both empty-conversation composer positions', async ({
    page,
  }) => {
    const { card, element, consoleErrors } = await openExample(page, 'layout-presets')
    const layout = element.locator('.tr-layout')

    await expect(card.getByRole('button', { name: '默认布局', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(card.getByText('保留完整页面区域，内容最大宽度为 980px。', { exact: true })).toBeVisible()
    await expect(layout).toHaveCSS('--tr-chat-ui-content-max-width', '980px')
    await expect(layout.locator('.tr-layout__aside--left')).toBeAttached()
    await expect(card.getByText('这个改动最需要关注什么？', { exact: true })).toBeVisible()

    await card.getByRole('button', { name: '紧凑内容', exact: true }).click()
    await expect(layout).toHaveCSS('--tr-chat-ui-content-max-width', '640px')
    await expect(layout).toHaveCSS('--tr-chat-ui-panel-padding', '20px')
    await expect(layout).toHaveCSS('--tr-chat-ui-panel-gap', '8px')
    await expect(layout).toHaveCSS('--left-dock-width', '240px')
    await expect(layout).toHaveCSS('--left-collapsed-width', '48px')

    await card.getByRole('button', { name: '专注模式', exact: true }).click()
    await expect(layout).toHaveCSS('--tr-chat-ui-content-max-width', '720px')
    await expect(layout.locator('.tr-layout__header')).toHaveCount(0)
    await expect(layout.locator('.tr-layout__aside--left')).toHaveCount(0)
    await expect(card.getByText('这个改动最需要关注什么？', { exact: true })).toBeVisible()

    await card.getByRole('button', { name: '空会话：底部输入', exact: true }).click()
    await expect(layout.locator('.tr-layout__footer .tr-sender')).toBeVisible()
    await expect(layout.locator('.chat-welcome-composer')).toHaveCount(0)

    await card.getByRole('button', { name: '空会话：居中输入', exact: true }).click()
    await expect(layout.locator('.chat-welcome-composer')).toBeVisible()
    await expect(layout.locator('.tr-layout__footer .tr-sender')).toHaveCount(0)

    await card.getByRole('button', { name: '默认布局', exact: true }).click()
    await expect(card.getByText('这个改动最需要关注什么？', { exact: true })).toBeVisible()
    await expect(layout.locator('.tr-layout__header')).toBeVisible()
    await expect(layout.locator('.tr-layout__aside--left')).toBeVisible()
    expectNoConsoleErrors(consoleErrors)
  })

  test('welcome-prompts: renders prompts and writes prompt detail back to the controlled input', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'welcome-prompts')
    await expect(card.getByText('项目助手', { exact: true })).toBeVisible()
    await expect(card.getByText('选择一个问题开始，或输入自己的问题。', { exact: true })).toBeVisible()
    await expect(card.getByText('解释代码', { exact: true })).toBeVisible()
    await expect(card.getByText('撰写周报', { exact: true })).toBeVisible()
    await expect(card.getByText('制定学习计划', { exact: true })).toBeVisible()

    await card.getByText('解释代码', { exact: true }).click()
    await expect(editor(card)).toContainText('请解释这段代码的作用，并给出使用建议。')

    await card.getByRole('checkbox', { name: '显示欢迎区', exact: true }).uncheck()
    await expect(card.getByText('项目助手', { exact: true })).toHaveCount(0)
    await card.getByRole('checkbox', { name: '显示推荐问题', exact: true }).uncheck()
    await expect(card.getByText('撰写周报', { exact: true })).toHaveCount(0)

    await card.getByRole('button', { name: '返回新会话', exact: true }).click()
    await expect(editor(card)).toHaveText('')
    expectNoConsoleErrors(consoleErrors)
  })

  test('sender-options: supports mention, template, help, controlled editing, and clear', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'sender-options')
    await expect(editor(card)).toHaveText('')
    await expect(card.locator('.tr-sender-word-counter')).toContainText('/300')
    await card.getByRole('button', { name: '使用说明', exact: true }).click()
    await expect(card.getByText('@ 用于插入对象名称，不会切换模型；', { exact: false })).toBeVisible()

    await editor(card).click()
    await editor(card).pressSequentially('@')
    await expect(page.getByText('产品组', { exact: true })).toBeVisible()
    await page.getByText('产品组', { exact: true }).click()
    await expect(editor(card)).toContainText('产品组')

    await card.getByRole('button', { name: '写报告', exact: true }).click()
    await expect(editor(card)).toContainText('请帮我写一份关于')
    await expect(editor(card)).toContainText('项目进展')
    await expect(editor(card)).toContainText('选择读者')
    await expect(editor(card)).toContainText('已完成工作和下一步计划')
    await card.getByRole('button', { name: '常用问题', exact: true }).click()
    await expect(editor(card)).toContainText('请列出项目周报中需要包含的内容。')

    await editor(card).fill('更新后的输入')
    await expect(card.locator('.tr-sender-word-counter')).toContainText('6/300')
    await card.locator('.tr-action-button').click()
    await expect(editor(card)).toHaveText('')
    expectNoConsoleErrors(consoleErrors)
  })

  test('sender-toolbar: preserves ordering, custom state, visibility, disabled guards, and narrow layout', async ({
    page,
  }) => {
    const { card, host, consoleErrors } = await openExample(page, 'sender-toolbar')
    const toolbar = card.locator('.tr-chat-toolbar')

    const toolbarButtons = toolbar.getByRole('button')
    await expect(toolbarButtons).toHaveCount(4)
    await expect(toolbarButtons.nth(0)).toHaveAccessibleName('Qwen3.7 Flash')
    await expect(toolbarButtons.nth(1)).toHaveAccessibleName('深度思考')
    await expect(toolbarButtons.nth(2)).toHaveAccessibleName('联网搜索')
    await expect(toolbarButtons.nth(3)).toHaveAccessibleName('生成式 UI')
    const gui = toolbar.getByRole('button', { name: '生成式 UI', exact: true })
    await gui.click()
    await expect(gui).toHaveAttribute('aria-pressed', 'true')

    await card.getByRole('button', { name: '禁用联网搜索', exact: true }).click()
    await expect(toolbar.getByRole('button', { name: '联网搜索', exact: true })).toBeDisabled()
    await card.getByRole('button', { name: '隐藏联网搜索', exact: true }).click()
    await expect(toolbar.getByRole('button', { name: '联网搜索', exact: true })).toHaveCount(0)

    await card.getByRole('button', { name: '窄输入区', exact: true }).click()
    await expect(host).toHaveCSS('max-width', '600px')
    await expect(gui.locator('.tr-chat-toolbar-button__label')).toBeHidden()
    expectNoConsoleErrors(consoleErrors)
  })

  test('extension-tabs: matches tab actions, name details, header actions, and overlay restoration', async ({
    page,
  }) => {
    const { card, consoleErrors } = await openExample(page, 'extension-tabs')
    const skillsTab = card.getByRole('tab', { name: 'Skills', exact: true })
    const mcpTab = card.getByRole('tab', { name: 'MCP', exact: true })

    await expect(skillsTab).toHaveAttribute('aria-selected', 'true')
    await expect(mcpTab).toHaveAttribute('aria-selected', 'false')
    await expect(card.getByText('简洁回答', { exact: true })).toBeVisible()
    await card.getByRole('switch', { name: '启用简洁回答', exact: true }).click()
    await expect(card.locator('[data-event-log]')).toContainText('extension-action: concise-answer/toggle/false')

    await card.getByText('简洁回答', { exact: true }).click()
    await expect(card.getByRole('heading', { name: '简洁回答', exact: true })).toBeVisible()
    await expect(card.getByText('随应用内置，让回答保持简短并突出结论。', { exact: true })).toBeVisible()
    await card.getByRole('button', { name: '返回扩展列表', exact: true }).click()
    await expect(skillsTab).toBeVisible()

    await card.getByRole('button', { name: '导入 Skill', exact: true }).click()
    await expect(card.getByRole('heading', { name: '导入 Skill', exact: true })).toBeVisible()
    await card.getByRole('button', { name: '返回扩展列表', exact: true }).click()

    await mcpTab.click()
    await expect(card.getByText('项目检索', { exact: true })).toBeVisible()
    await expect(card.locator('[data-event-log]')).toContainText('extension-tab-change: mcp')
    expectNoConsoleErrors(consoleErrors)
  })

  test('bubble-options: matches built-in and custom Bubble renderer behavior', async ({ page }) => {
    const { card, host, consoleErrors } = await openExample(page, 'bubble-options')
    const markdown = card.locator('[data-type="markdown"]').filter({ hasText: '内置 Markdown Renderer' })
    const tool = card.locator('[data-type="tool-call"]')
    const statusCard = card.locator('[data-bubble-status-card="primary"]')

    await expect(markdown.locator('h2')).toHaveText('内置 Markdown Renderer')
    await expect(markdown.locator('strong')).toHaveText('安全渲染')
    await expect(tool).toContainText('lookup_release')
    await expect(statusCard).toContainText('发布状态')
    await expect(statusCard).toContainText('ready')
    await expect(card.getByText('普通文本保持默认渲染。', { exact: true })).toBeVisible()
    await expect(card.locator('.tr-bubble[data-role="user"]')).toHaveAttribute('data-placement', 'end')
    const assistantBubbles = card.locator('.tr-bubble[data-role="assistant"]')
    await expect(assistantBubbles).toHaveCount(2)
    expect(
      await assistantBubbles.evaluateAll((items) => items.map((item) => item.getAttribute('data-placement'))),
    ).toEqual(['start', 'start'])

    await statusCard.getByRole('button', { name: '确认状态', exact: true }).click()
    await expect(statusCard.getByRole('button', { name: '已确认 1 次', exact: true })).toBeVisible()

    await tool.locator('.expand-icon').click()
    await expect(tool.locator('.detail')).toBeVisible()
    await expect(tool.locator('.detail')).toContainText('version')

    await expect(host).toHaveAttribute('data-bubble-renderer-aborts', '0')
    await card.getByRole('button', { name: '替换自定义 Renderer', exact: true }).click()
    await expect(card.locator('[data-bubble-status-card="replacement"]')).toContainText('备用状态：ready')
    await expect
      .poll(async () => Number((await host.getAttribute('data-bubble-renderer-aborts')) ?? '0'))
      .toBeGreaterThan(0)
    expectNoConsoleErrors(consoleErrors)
  })

  test('runtime-error: reports a failed send and recovers on the same Runtime', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'runtime-error')
    await expect(card.getByText('发送包含“失败”的内容可查看错误提示，发送其他内容可查看正常回复。')).toBeVisible()
    await expect(card.getByRole('status')).toHaveText('尚未收到操作失败通知')

    await editor(card).fill('这次会失败')
    await card.locator('.tr-sender-submit-button').click()
    await expect(card.getByRole('status')).toHaveText('已收到发送失败通知')
    await expect(card.locator('.tr-bubble[data-role="assistant"]')).toContainText('模拟请求失败：模型服务暂时不可用。')

    await editor(card).fill('恢复验证')
    await card.locator('.tr-sender-submit-button').click()
    await expect(card.getByText('正常回复：恢复验证', { exact: true })).toBeVisible()
    expectNoConsoleErrors(consoleErrors)
  })

  test('event-contract: exposes DOM defaults, repeat detail updates, and cancelable history actions', async ({
    page,
  }) => {
    const { card, consoleErrors } = await openExample(page, 'event-contract')
    const inputStatus = card.getByTestId('event-contract-input')
    const cancelStatus = card.getByTestId('event-contract-cancel')
    await expect(card.getByText('Vue baseline: ../chat/controlled-ui.vue')).toHaveAttribute(
      'href',
      /docs\/demos\/chat\/controlled-ui\.vue$/,
    )

    await expect(inputStatus).toHaveText('等待 input-value-update')
    await editor(card).fill('第一次更新')
    await expect(inputStatus).toHaveText(
      'detail=第一次更新 · bubbles=true · composed=true · cancelable=false · count=1',
    )
    await editor(card).fill('第二次更新')
    await expect(inputStatus).toHaveText(
      'detail=第二次更新 · bubbles=true · composed=true · cancelable=false · count=2',
    )

    await card.getByRole('button', { name: '展开会话列表', exact: true }).click()
    const menuTrigger = card.getByRole('button', { name: '协议会话 更多操作' })
    await menuTrigger.focus()
    await menuTrigger.press('ArrowDown')
    await card.getByRole('menuitem', { name: '删除' }).click()
    await expect(cancelStatus).toHaveText(
      'history-action · bubbles=true · composed=true · cancelable=true · prevented=true · count=1',
    )
    await expect(card.locator('.tr-history__item').filter({ hasText: '协议会话' })).toBeVisible()
    expectNoConsoleErrors(consoleErrors)
  })

  test('initialization-timing: preserves pre-upgrade state and emits ready once across reconnect', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'initialization-timing')
    const status = card.getByTestId('initialization-status')
    await expect(card.getByText('Vue baseline: ../chat/basic.vue')).toHaveAttribute(
      'href',
      /docs\/demos\/chat\/basic\.vue$/,
    )

    await expect(status).toHaveText('未注册 · ready=0 · pre-upgrade property=待验证')
    await card.getByRole('button', { name: '执行延迟注册', exact: true }).click()
    await expect(status).toHaveText(
      '已升级 · ready=1 · data=保留 · renderers=保留 · input=升级前草稿 · initialPanel=missing · panel=preview · panelUpdates=1 · rightAsideOpen=true · layouts=1',
    )
    const element = card.locator('tr-chat-ui-timing')
    await expect(element.locator('.tr-layout')).toBeVisible()

    await card.getByRole('button', { name: '连接后写入 Property', exact: true }).click()
    await expect(status).toHaveText('连接后写入 · input=连接后草稿 · rightAsideOpen=false · ready=1')
    await expect(element.locator('.tr-sender-editor')).toContainText('连接后草稿')

    await card.getByRole('button', { name: '调用公开方法', exact: true }).click()
    await expect(status).toHaveText('公开方法 · rightAsideOpen=true · rightUpdates=1 · ready=1')
    await expect(element.locator('.tr-layout__aside--right')).toBeVisible()

    await card.getByRole('button', { name: '移除并重新连接', exact: true }).click()
    await expect(status).toHaveText('已重连 · ready=1 · input=连接后草稿')
    await expect(element.locator('.tr-sender-editor')).toContainText('连接后草稿')
    expectNoConsoleErrors(consoleErrors)
  })

  test('history-groups: renders grouped history and the active item in the side bar', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'history-groups')
    await expect(card.getByText('置顶', { exact: true })).toBeVisible()
    await expect(card.getByText('昨天', { exact: true })).toBeVisible()
    await expect(card.getByText('30天内', { exact: true })).toBeVisible()
    await expect(card.locator('.tr-history__item')).toHaveCount(5)
    await card.getByText('square-pen 含义解释', { exact: true }).click()
    await expect(card.locator('.tr-history__item.selected')).toContainText('square-pen 含义解释')
    await expect(card.getByText('这是“square-pen 含义解释”的示例回答。', { exact: false })).toBeVisible()

    const menuTrigger = card.getByRole('button', { name: 'square-pen 含义解释 更多操作' })
    await menuTrigger.focus()
    await menuTrigger.press('ArrowDown')
    await card.getByRole('menuitem', { name: '重命名' }).click()
    const renameEditor = card.locator('.tr-history__item-editor')
    await renameEditor.fill('图标含义说明')
    await renameEditor.press('Enter')
    await expect(card.locator('.tr-history__item').getByText('图标含义说明', { exact: true })).toBeVisible()
    expectNoConsoleErrors(consoleErrors)
  })

  test('slots-basic: matches the original header, feedback, and composer slot behavior', async ({ page }) => {
    const { card, host, consoleErrors } = await openExample(page, 'slots-basic')
    const header = card.locator('[data-slot-header]')
    const asideToggle = header.getByRole('button', { name: '展开会话列表', exact: true })
    const feedback = card.locator('[data-slot-feedback]')

    await expect(header.getByText('插槽定制', { exact: true })).toBeVisible()
    await expect(
      card.getByText('这个示例通过插槽自定义页头、添加消息按钮，并在输入框下方显示提示。', { exact: true }),
    ).toBeVisible()
    await expect(asideToggle).toHaveAttribute('aria-expanded', 'false')
    await expect(asideToggle).toHaveCSS('border-style', 'solid')
    await expect(asideToggle).toHaveCSS('font-size', '14px')
    await expect(header.getByRole('button', { name: '新建会话', exact: true })).toBeVisible()
    await expect(feedback).toHaveText('有帮助')
    await expect(feedback).toHaveCSS('border-style', 'solid')
    await expect(feedback).toHaveCSS('font-size', '14px')
    await expect(feedback).toHaveCount(1)
    await expect(card.locator('.tr-bubble[data-role="user"] [data-slot-feedback]')).toHaveCount(0)
    await expect(card.locator('[data-slot-composer-after]')).toHaveText('内容由 AI 生成，请仔细甄别。')
    await expect(card.getByRole('button', { name: '深度思考', exact: true })).toBeVisible()
    await expect(card.getByRole('button', { name: '联网搜索', exact: true })).toBeVisible()
    await expect(card.getByRole('button', { name: 'Qwen3.7 Flash', exact: true })).toBeVisible()
    await expect(host).toHaveCSS('height', '600px')

    await feedback.click()
    await expect(feedback).toHaveText('已标记')
    await expect(feedback).toBeDisabled()

    await asideToggle.click()
    const collapseToggle = header.getByRole('button', { name: '收起会话列表', exact: true })
    await expect(collapseToggle).toHaveAttribute('aria-expanded', 'true')
    await expect(card.locator('.tr-layout__aside--left')).toHaveClass(/tr-layout__aside--expanded/)
    await expect(feedback).toHaveText('已标记')
    await expect(feedback).toBeDisabled()

    await header.getByRole('button', { name: '新建会话', exact: true }).click()
    await expect(header.getByText('新对话', { exact: true })).toBeVisible()
    await expect(card.getByText('TinyRobot AI 助手', { exact: true })).toBeVisible()
    await expect(feedback).toHaveCount(0)
    await expect(card.locator('[data-slot-composer-after]')).toHaveText('内容由 AI 生成，请仔细甄别。')
    expectNoConsoleErrors(consoleErrors)
  })

  test('right-aside-panel: opens, activates, and closes the renderer-backed panel', async ({ page }) => {
    const { card, element, consoleErrors } = await openExample(page, 'right-aside-panel')
    await expect(card.getByText('发布方案预览', { exact: true })).toBeVisible()
    await expect(card.getByTitle('发布方案网页预览')).toBeVisible()
    await expect(card.locator('.tr-layout__aside--right')).toHaveClass(/tr-layout__aside--expanded/)

    await card.getByRole('button', { name: '查看引用资料', exact: true }).click()
    await expect(card.getByText('引用资料', { exact: true })).toBeVisible()
    await expect(card.getByRole('button', { name: '需求文档', exact: true })).toBeVisible()
    await card.getByRole('button', { name: '需求文档', exact: true }).click()
    await expect(card.getByText('发布方案预览', { exact: true })).toBeVisible()

    await element.evaluate((node: ChatUIElement & { closeRightAside(): void }) => node.closeRightAside())
    const rightAside = card.locator('.tr-layout__aside--right')
    await expect(rightAside).toHaveClass(/tr-layout__aside--hidden/)
    await expect(rightAside).toHaveAttribute('inert', '')
    expectNoConsoleErrors(consoleErrors)
  })

  test('floating-layout: renders at the controlled rect and reports drag and resize updates', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'floating-layout')
    const floating = page.locator('.tr-layout--floating')
    await expect(floating).toHaveCount(0)
    await expect(card.getByRole('status')).toHaveText('当前状态：top-right · x 24px · y 72px · 520 × 520px')

    await card.getByRole('button', { name: '打开浮动聊天', exact: true }).click()
    await expect(floating).toBeVisible()
    await expect(floating.locator('.tr-layout__body')).toHaveCSS('display', 'grid')
    await expect(floating).toContainText('浮动助手')
    await expect(floating.getByRole('button', { name: '关闭浮动聊天', exact: true })).toBeVisible()
    const initial = await floating.boundingBox()
    expect(initial).toMatchObject({ x: 736, y: 72, width: 520, height: 520 })

    const dragBar = floating.locator('.tr-layout__drag-bar')
    const dragBox = await dragBar.boundingBox()
    expect(dragBox).not.toBeNull()
    await page.mouse.move(dragBox!.x + dragBox!.width / 2, dragBox!.y + dragBox!.height / 2)
    await page.mouse.down()
    await page.mouse.move(dragBox!.x + dragBox!.width / 2 - 40, dragBox!.y + dragBox!.height / 2 + 30)
    await page.mouse.up()
    await expect(card.getByRole('status')).not.toHaveText('当前状态：top-right · x 24px · y 72px · 520 × 520px')
    await expect(card.locator('[data-event-log]')).toContainText('floating-state-update')
    const moved = await floating.boundingBox()
    expect(moved!.x).toBeLessThan(initial!.x)
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
    await floating.getByRole('button', { name: '关闭浮动聊天', exact: true }).click()
    await expect(floating).toHaveCount(0)
    await card.getByRole('button', { name: '打开浮动聊天', exact: true }).click()
    await expect(floating).toBeVisible()
    await card.getByRole('button', { name: '关闭浮动聊天', exact: true }).click()
    await expect(floating).toHaveCount(0)
    expectNoConsoleErrors(consoleErrors)
  })

  test('responsive-layout: switches between narrow and wide containers without overflow', async ({ page }) => {
    const { card, host, consoleErrors } = await openExample(page, 'responsive-layout')
    await expect(card.getByRole('button', { name: '桌面 Dock', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(host).toHaveCSS('max-width', '760px')
    await expect(card.locator('.tr-layout')).toHaveClass(/tr-layout--left-expanded/)

    await card.getByRole('button', { name: '移动端 Drawer', exact: true }).click()
    await expect(card.getByRole('button', { name: '移动端 Drawer', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(host).toHaveCSS('max-width', '390px')
    await expect(card.locator('.tr-layout')).toHaveClass(/tr-layout--left-drawer/)
    expect(await host.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(2)

    const drawerToggle = card.getByRole('button', { name: '展开会话列表', exact: true })
    await expect(drawerToggle).toHaveAttribute('aria-expanded', 'false')
    await expect(drawerToggle).toHaveAttribute('aria-controls', /.+/)
    await drawerToggle.click()
    const drawer = card.getByRole('dialog', { name: '收起会话列表' })
    await expect(drawer).toBeVisible()
    await expect(drawer).toHaveAttribute('aria-modal', 'true')
    const drawerId = await drawer.getAttribute('id')
    await expect
      .poll(() =>
        page.evaluate((id) => document.activeElement?.closest<HTMLElement>('[role="dialog"]')?.id === id, drawerId),
      )
      .toBe(true)
    await page.keyboard.press('Escape')
    await expect(card.getByRole('button', { name: '展开会话列表', exact: true })).toBeFocused()
    await expect(drawer).toBeHidden()

    const messageLog = card.getByRole('log')
    await expect(messageLog).toHaveAttribute('aria-live', 'polite')
    await expect(messageLog).toHaveAttribute('aria-relevant', 'additions text')
    await expect(messageLog).toHaveAttribute('aria-busy', 'false')

    await card.getByRole('button', { name: '桌面 Dock', exact: true }).click()
    await expect(host).toHaveCSS('max-width', '760px')
    await expect(card.locator('.tr-layout')).toHaveClass(/tr-layout--left-expanded/)
    expect(await host.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(2)
    expectNoConsoleErrors(consoleErrors)
  })

  test('controlled-ui: mirrors the Vue submit, cancel, message, loading, and recovery flow', async ({ page }) => {
    const { card, element, consoleErrors } = await openExample(page, 'controlled-ui')
    await card.getByRole('button', { name: '外部更新', exact: true }).click()
    await expect(element).toHaveJSProperty('inputValue', '由宿主更新的值')
    await editor(card).fill('浏览器受控输入')
    await expect(element).toHaveJSProperty('inputValue', '浏览器受控输入')
    await expect(card.locator('[data-event-log]')).toContainText('input-value-update: 浏览器受控输入')

    await card.locator('.tr-sender-submit-button').click()
    await expect(card.locator('.tr-bubble').getByText('浏览器受控输入', { exact: true })).toBeVisible()
    await expect(card.locator('.tr-sender-submit-button')).toHaveClass(/is-loading/)
    await expect(element).toHaveJSProperty('inputValue', '')
    await card.locator('.tr-sender-submit-button').click()
    await expect(card.locator('[data-event-log]')).toContainText('cancel: 已停止')
    await page.waitForTimeout(1600)
    await expect(card.getByText('已收到：浏览器受控输入', { exact: true })).toHaveCount(0)

    await editor(card).fill('取消后恢复')
    await card.locator('.tr-sender-submit-button').click()
    await expect(card.getByText('已收到：取消后恢复', { exact: true })).toBeVisible()
    await editor(card).fill('可以继续输入')
    await expect(card.locator('.tr-sender-submit-button')).not.toHaveClass(/is-loading/)
    expectNoConsoleErrors(consoleErrors)
  })

  test('runtime-actions: exposes ready, streaming, abort, recovery, and completion states', async ({ page }) => {
    const { card, host, consoleErrors } = await openExample(page, 'runtime-actions')
    await expect(card.getByRole('status')).toHaveText('等待发送')
    await card.getByRole('button', { name: '发送预设问题', exact: true }).click()
    await expect(card.locator('.tr-bubble').getByText('介绍一下这个项目', { exact: true })).toBeVisible()
    await expect(card.getByRole('status')).toHaveText('正在生成')
    await expect(card.getByRole('button', { name: '停止回答', exact: true })).toBeEnabled()
    await card.getByRole('button', { name: '停止回答', exact: true }).click()
    await expect(host).toHaveAttribute('data-abort-status', 'complete')
    await expect(card.getByRole('status')).toHaveText('已停止')
    await page.waitForTimeout(700)
    await expect(card.getByText('Web Component 流式响应已完成', { exact: true })).toHaveCount(0)

    await card.getByRole('button', { name: '发送预设问题', exact: true }).click()
    await expect(card.getByRole('status')).toHaveText('正在生成')
    await expect(card.getByText('Web Component 流式响应已完成', { exact: true })).toBeVisible()
    await expect(card.getByRole('status')).toHaveText('已完成')
    expectNoConsoleErrors(consoleErrors)
  })

  test('runtime-before-send: rejects logged-out send and continues after login', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'runtime-before-send')
    await expect(card.getByRole('status')).toHaveText('先输入问题并发送，再勾选“已登录”重试。')
    const bubbles = card.locator('.tr-bubble')
    const initialCount = await bubbles.count()
    await editor(card).fill('输入必须保留')
    await card.locator('.tr-sender-submit-button').click()
    await expect(card.getByRole('status')).toHaveText('检查返回 reject：请先登录；输入保留，不追加消息。')
    await expect(bubbles).toHaveCount(initialCount)
    await expect(editor(card)).toContainText('输入必须保留')

    await card.getByRole('checkbox', { name: '已登录（模拟）' }).check()
    await card.locator('.tr-sender-submit-button').click()
    await expect(card.getByRole('status')).toHaveText('检查返回 continue：允许发送。')
    await expect(card.locator('.tr-bubble').getByText('输入必须保留', { exact: true })).toBeVisible()
    await expect(card.locator('.tr-bubble[data-role="assistant"]')).toContainText('Web Component 已收到：输入必须保留')
    await expect(editor(card)).toHaveText('')
    expectNoConsoleErrors(consoleErrors)
  })

  test('runtime-composer: matches the native controls, status, preset input, and composer states', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'runtime-composer')
    const sender = card.locator('.tr-sender')
    const preset = card.getByRole('button', { name: '填入预设问题', exact: true })

    await expect(card.getByRole('radio', { name: '正常', exact: true })).toBeChecked()
    await expect(card.getByRole('status')).toContainText(
      'composer: { disabled: false, submitDisabled: false } — 可以编辑，内容非空时可发送。',
    )
    await preset.click()
    await expect(editor(card)).toContainText('介绍一下这个项目')

    await card.getByRole('radio', { name: '禁用输入区', exact: true }).check()
    await expect(sender).toHaveClass(/is-disabled/)
    await expect(preset).toBeDisabled()
    await expect(card.getByRole('status')).toContainText(
      'composer: { disabled: true, submitDisabled: false } — 无法编辑或发送。',
    )

    await card.getByRole('radio', { name: '仅禁用提交', exact: true }).check()
    await expect(sender).not.toHaveClass(/is-disabled/)
    await editor(card).fill('提交状态验证')
    await expect(card.locator('.tr-sender-submit-button')).toHaveClass(/is-disabled/)
    await expect(card.getByRole('status')).toContainText(
      'composer: { disabled: false, submitDisabled: true } — 可以编辑和清空，但不能发送。',
    )

    await card.getByRole('radio', { name: '正常', exact: true }).check()
    await expect(card.locator('.tr-sender-submit-button')).not.toHaveClass(/is-disabled/)
    await expect(preset).toBeEnabled()
    expectNoConsoleErrors(consoleErrors)
  })

  test('runtime-conversations: loads history, creates a conversation, and switches both directions', async ({
    page,
  }) => {
    const { card, consoleErrors } = await openExample(page, 'runtime-conversations')
    await expect(card.getByText('这个项目提供什么功能？', { exact: true })).toBeVisible()
    await expect(card.getByText('项目介绍', { exact: true }).first()).toBeVisible()

    await card.getByLabel('会话标题').fill('浏览器新会话')
    await card.getByRole('button', { name: '立即创建会话', exact: true }).click()
    await expect(card.getByText('浏览器新会话', { exact: true }).first()).toBeVisible()
    await expect(card.getByText('这个项目提供什么功能？', { exact: true })).toHaveCount(0)

    await card.getByText('使用帮助', { exact: true }).first().click()
    await expect(card.getByText('如何管理历史会话？', { exact: true })).toBeVisible()
    await card.getByText('项目介绍', { exact: true }).first().click()
    await expect(card.getByText('这个项目提供什么功能？', { exact: true })).toBeVisible()
    expectNoConsoleErrors(consoleErrors)
  })

  test('runtime-send: preserves default and custom empty-text send semantics', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'runtime-send')
    await expect(card.getByRole('heading', { name: '默认发送', exact: true })).toBeVisible()
    await expect(card.getByRole('heading', { name: '自定义 send', exact: true })).toBeVisible()
    const sendEmptyButtons = card.getByRole('button', { name: '发送空文本', exact: true })

    await sendEmptyButtons.nth(0).click()
    await expect(card.getByText('结果：false', { exact: true })).toBeVisible()

    await sendEmptyButtons.nth(1).click()
    await expect(card.getByText('结果：自定义 send 收到 text: ""，结果: true', { exact: true })).toBeVisible()
    expectNoConsoleErrors(consoleErrors)
  })

  test('runtime-adapter: binds the real adapter input, send, and response lifecycle to ChatUI', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'runtime-adapter')
    await expect(card.getByText('动作状态：正常', { exact: true })).toBeVisible()
    await editor(card).fill('业务状态浏览器验证')
    await card.locator('.tr-sender-submit-button').click()
    await expect(card.locator('.tr-bubble').getByText('业务状态浏览器验证', { exact: true })).toBeVisible()
    await expect(card.locator('.tr-bubble').getByText('Runtime 已收到：业务状态浏览器验证')).toBeVisible()
    await expect(editor(card)).toHaveText('')
    expectNoConsoleErrors(consoleErrors)
  })

  test('runtime-subscription: publishes framework-neutral request snapshots without polling', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'runtime-subscription')
    await expect(card.getByRole('status')).toHaveText('空闲 · 0 个会话')

    await card.getByRole('button', { name: '发送预设问题', exact: true }).click()
    await expect(card.getByRole('status')).toContainText('生成中')
    await expect(card.locator('[data-event-log]')).toContainText('processing')
    await card.getByRole('button', { name: '停止回答', exact: true }).click()
    await expect(card.getByRole('status')).toContainText('已停止')

    await card.getByRole('button', { name: '发送预设问题', exact: true }).click()
    await expect(card.getByText('Web Component 流式响应已完成', { exact: true })).toBeVisible()
    await expect(card.getByRole('status')).toContainText('已完成')
    await expect(card.locator('[data-event-log]')).toContainText('completed')
    expectNoConsoleErrors(consoleErrors)
  })

  test('complex-properties: requires reassignment and replaces every complex UI property', async ({ page }) => {
    const { card, consoleErrors } = await openExample(page, 'complex-properties')
    await expect(card.getByText('属性版本一', { exact: true }).first()).toBeVisible()

    await card.getByRole('button', { name: '嵌套修改', exact: true }).click()
    await expect(card.getByText('属性版本一', { exact: true }).first()).toBeVisible()
    await expect(card.locator('[data-event-log]')).toContainText('未触发渲染（符合契约）')

    await card.getByRole('button', { name: '整体替换', exact: true }).click()
    await expect(card.getByText('属性版本二', { exact: true })).toBeVisible()
    await expect(card.getByText('DOM Header v2', { exact: true })).toBeVisible()
    await expect(card.getByText('结构化卡片 v2', { exact: true })).toBeVisible()

    await card.getByRole('button', { name: '恢复初始', exact: true }).click()
    await expect(card.getByText('属性版本一', { exact: true }).first()).toBeVisible()
    expectNoConsoleErrors(consoleErrors)
  })

  test('runtime-ownership: disposes owned runtimes, preserves injected runtime, and isolates storage', async ({
    page,
  }) => {
    const { card, consoleErrors } = await openExample(page, 'runtime-ownership')
    await expect(card.getByRole('status')).toContainText('owned-a')

    await card.getByRole('button', { name: '启动长请求', exact: true }).click()
    await card.getByRole('button', { name: '切换 owned-b', exact: true }).click()
    await expect(card.locator('[data-event-log]')).toContainText('owned-a disposed: true')
    await expect(card.getByRole('status')).toContainText('owned-b')

    await card.getByRole('button', { name: '注入 Runtime', exact: true }).click()
    await card.getByRole('button', { name: '发送到当前 Runtime', exact: true }).click()
    await expect(card.getByText('Injected Runtime 已收到：所有权验证', { exact: true })).toBeVisible()
    await card.getByRole('button', { name: '移除并恢复', exact: true }).click()
    await expect(card.locator('[data-event-log]')).toContainText('injected survives: true')

    await card.getByRole('button', { name: '验证多实例存储', exact: true }).click()
    await expect(card.locator('[data-event-log]')).toContainText('storage isolated: true')
    expectNoConsoleErrors(consoleErrors)
  })
})
