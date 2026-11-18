import { expect, test } from '@playwright/test'
import { markdownReply } from './markdown-fixture.mjs'
import type { TrChatHTMLElement } from '../../chat/src/experimental'

test.beforeEach(async ({ page }) => {
  // The browser must never contact real model services during validation.
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') await route.abort()
    else await route.continue()
  })
})

test('工作台独立页面使用头像入口，关闭重开保留会话草稿与浮窗位置', async ({ page }) => {
  await page.goto('/workspace')
  await expect(page.getByRole('heading', { name: '项目工作台', exact: true })).toBeVisible()
  const launcher = page.getByRole('button', { name: '打开 AI 助手', exact: true })
  await launcher.click()
  await expect(launcher).toBeHidden()
  const chat = page.locator('tr-chat')
  const surface = page.locator('.tr-layout--floating')
  await expect(surface.locator('[contenteditable=true]')).toBeVisible()
  await expect(surface.getByRole('button', { name: '历史会话', exact: true })).toBeVisible()
  await expect(surface.getByRole('button', { name: '新建会话', exact: true })).toBeVisible()
  await expect(surface.getByRole('button', { name: '展开会话列表', exact: true })).toHaveCount(0)
  const before = await surface.boundingBox()
  expect(before!.width).toBe(640)
  expect(before!.height).toBe(760)
  expect(before!.x).toBe(400)
  const handle = await surface.locator('.tr-layout__drag-bar').boundingBox()
  await page.mouse.move(handle!.x + handle!.width / 2, handle!.y + handle!.height / 2)
  await page.mouse.down()
  await page.mouse.move(handle!.x + handle!.width / 2 - 80, handle!.y + handle!.height / 2 - 20, { steps: 5 })
  await page.mouse.up()
  await expect.poll(async () => (await surface.boundingBox())?.x).toBeLessThan(before!.x - 40)
  const resize = await surface.locator('.tr-layout__floating-resize-trigger--se').boundingBox()
  await page.mouse.move(resize!.x + resize!.width / 2, resize!.y + resize!.height / 2)
  await page.mouse.down()
  await page.mouse.move(resize!.x + resize!.width / 2 + 40, resize!.y + resize!.height / 2 + 20, { steps: 5 })
  await page.mouse.up()
  await expect.poll(async () => (await surface.boundingBox())?.width).toBeGreaterThan(before!.width + 20)
  const movedState = await chat.evaluate((element) => (element as TrChatHTMLElement).floatingState)
  await surface.locator('[contenteditable=true]').fill('悬浮助手提问')
  await surface.locator('.tr-sender-submit-button').click()
  await expect(surface.getByText('收到：悬浮助手提问。这是本地协议验证回复。', { exact: true })).toBeVisible()
  await expect(surface.getByRole('button', { name: '复制回复', exact: true })).toBeVisible()
  const id = await chat.evaluate((element) => (element as TrChatHTMLElement).runtime!.activeConversation.value?.id)
  await surface.locator('[contenteditable=true]').fill('保留草稿')
  await surface.getByRole('button', { name: '关闭 AI 助手', exact: true }).click()
  await expect(surface).toHaveCount(0)
  await expect(launcher).toBeFocused()
  await launcher.click()
  await expect(surface.locator('[contenteditable=true]')).toHaveText('保留草稿')
  expect(await chat.evaluate((element) => (element as TrChatHTMLElement).floatingState)).toEqual(movedState)
  expect(await chat.evaluate((element) => (element as TrChatHTMLElement).runtime!.activeConversation.value?.id)).toBe(
    id,
  )
  await page.getByRole('link', { name: '完整聊天', exact: true }).click()
  await expect(page).toHaveURL(/\/chat$/)
  await expect(chat.locator('[contenteditable=true]')).toBeVisible()
  await chat.getByRole('button', { name: '展开会话列表', exact: true }).click()
  await chat.getByText('悬浮助手提问', { exact: true }).first().click()
  await expect(chat.getByText('收到：悬浮助手提问。这是本地协议验证回复。', { exact: true })).toBeVisible()
})

test('浮窗全屏与 Escape 恢复，视口变化后继续适配', async ({ page }) => {
  await page.goto('/workspace')
  await page.getByRole('button', { name: '打开 AI 助手', exact: true }).click()
  const surface = page.locator('.tr-layout--floating')
  await expect(surface.locator('[contenteditable=true]')).toBeVisible()
  const before = await surface.boundingBox()
  await surface.getByRole('button', { name: '历史会话', exact: true }).click()
  const panel = page.getByRole('dialog', { name: '历史会话', exact: true })
  await expect(panel).toBeVisible()
  await surface.getByRole('button', { name: '切换为全屏模式', exact: true }).click()
  await expect.poll(() => surface.boundingBox()).toMatchObject({ x: 0, y: 0, width: 1440, height: 1000 })
  await expect(panel).toBeInViewport()
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
  await expect.poll(() => surface.boundingBox()).toMatchObject({ x: 0, y: 0, width: 1440, height: 1000 })
  await expect(surface.getByRole('button', { name: '切换为悬浮窗口', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect.poll(() => surface.boundingBox()).toEqual(before)
  await surface.getByRole('button', { name: '切换为全屏模式', exact: true }).click()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => surface.boundingBox()).toMatchObject({ x: 0, y: 0, width: 390, height: 844 })
  await page.keyboard.press('Escape')
  const bounds = await surface.boundingBox()
  expect(bounds!.x).toBeGreaterThanOrEqual(0)
  expect(bounds!.y).toBeGreaterThanOrEqual(0)
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844)
  await surface.getByRole('button', { name: '关闭 AI 助手', exact: true }).click()
  await expect(surface).toHaveCount(0)
})

test('浮窗历史面板可搜索、重命名、切换和删除会话', async ({ page }) => {
  await page.goto('/workspace')
  await page.getByRole('button', { name: '打开 AI 助手', exact: true }).click()
  const surface = page.locator('.tr-layout--floating')
  const input = surface.locator('[contenteditable=true]')
  await expect(input).toBeVisible()
  await input.fill('第一条项目咨询')
  await surface.locator('.tr-sender-submit-button').click()
  await expect(surface.getByText('收到：第一条项目咨询。这是本地协议验证回复。', { exact: true })).toBeVisible()
  await surface.getByRole('button', { name: '新建会话', exact: true }).click()
  await input.fill('第二条项目咨询')
  await surface.locator('.tr-sender-submit-button').click()
  await expect(surface.getByText('收到：第二条项目咨询。这是本地协议验证回复。', { exact: true })).toBeVisible()
  await surface.getByRole('button', { name: '历史会话', exact: true }).click()
  const panel = page.getByRole('dialog', { name: '历史会话', exact: true })
  await expect(panel).toBeVisible()
  await panel.getByRole('searchbox', { name: '搜索历史会话', exact: true }).fill('第一条')
  const item = panel.getByRole('listitem').filter({ hasText: '第一条项目咨询' })
  await expect(item).toBeVisible()
  await item.getByRole('button', { name: '重命名', exact: true }).click()
  await expect(panel.getByRole('textbox', { name: '会话标题', exact: true })).toBeFocused()
  await panel.getByRole('textbox', { name: '会话标题', exact: true }).fill('产品咨询')
  await panel.getByRole('button', { name: '保存标题', exact: true }).click()
  await panel.getByRole('searchbox', { name: '搜索历史会话', exact: true }).fill('产品')
  await panel.getByRole('button', { name: '产品咨询', exact: true }).click()
  await expect(panel).toHaveCount(0)
  await expect(surface.getByText('收到：第一条项目咨询。这是本地协议验证回复。', { exact: true })).toBeVisible()
  await surface.getByRole('button', { name: '历史会话', exact: true }).click()
  const saved = panel.getByRole('listitem').filter({ hasText: '产品咨询' })
  await saved.getByRole('button', { name: '删除', exact: true }).click()
  await expect(saved).toHaveCount(0)
  await expect(panel.getByRole('button', { name: '第二条项目咨询', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
  await expect(surface.getByRole('button', { name: '历史会话', exact: true })).toBeFocused()
})

test('浮窗历史面板在流式更新中保留搜索与标题编辑内容', async ({ page }) => {
  await page.goto('/workspace')
  await page.getByRole('button', { name: '打开 AI 助手', exact: true }).click()
  const surface = page.locator('.tr-layout--floating')
  const input = surface.locator('[contenteditable=true]')
  await expect(input).toBeVisible()
  await input.fill('已保存的项目咨询')
  await surface.locator('.tr-sender-submit-button').click()
  await expect(surface.getByText('收到：已保存的项目咨询。这是本地协议验证回复。', { exact: true })).toBeVisible()
  await surface.getByRole('button', { name: '新建会话', exact: true }).click()
  await input.fill('慢速生成中的咨询')
  await surface.locator('.tr-sender-submit-button').click()
  await expect(surface.getByText(/片段0/)).toBeVisible()
  await surface.getByRole('button', { name: '历史会话', exact: true }).click()
  const panel = page.getByRole('dialog', { name: '历史会话', exact: true })
  await panel.getByRole('searchbox', { name: '搜索历史会话', exact: true }).fill('已保存')
  await expect(surface.getByText(/片段4/)).toBeVisible()
  const search = panel.getByRole('searchbox', { name: '搜索历史会话', exact: true })
  await expect(search).toHaveValue('已保存')
  await search.focus()
  await search.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 1))
  await expect(surface.getByText(/片段9/)).toBeVisible()
  await expect(search).toBeFocused()
  expect(await search.evaluate((node: HTMLInputElement) => node.selectionStart)).toBe(1)
  await page.keyboard.type('X')
  await expect(search).toHaveValue('已X保存')
  await search.fill('已保存')
  await panel.getByRole('button', { name: '重命名', exact: true }).click()
  const title = panel.getByRole('textbox', { name: '会话标题', exact: true })
  await title.fill('待保存的标题')
  await title.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 1))
  await expect(surface.getByText(/片段14/)).toBeVisible()
  await expect(title).toBeFocused()
  expect(await title.evaluate((node: HTMLInputElement) => node.selectionStart)).toBe(1)
  await page.keyboard.type('X')
  await expect(title).toHaveValue('待X保存的标题')
})

test('宿主卸载时清理浮窗与历史面板', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/workspace')
  await page.getByRole('button', { name: '打开 AI 助手', exact: true }).click()
  const surface = page.locator('.tr-layout--floating')
  await surface.getByRole('button', { name: '历史会话', exact: true }).click()
  const panel = page.getByRole('dialog', { name: '历史会话', exact: true })
  await expect(panel).toBeVisible()
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false })))
  await expect(panel).toHaveCount(0)
  await expect(surface).toHaveCount(0)
  expect(errors).toEqual([])
})

test('窄屏工作台可打开和关闭悬浮助手，窗口保持在视口内', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/workspace')
  await page.getByRole('button', { name: '打开 AI 助手', exact: true }).click()
  const surface = page.locator('.tr-layout--floating')
  await expect(surface.locator('[contenteditable=true]')).toBeVisible()
  const bounds = await surface.boundingBox()
  expect(bounds!.x).toBeGreaterThanOrEqual(0)
  expect(bounds!.y).toBeGreaterThanOrEqual(0)
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await surface.getByRole('button', { name: '历史会话', exact: true }).click()
  const panel = page.getByRole('dialog', { name: '历史会话', exact: true })
  await expect(panel).toBeInViewport()
  const panelBounds = await panel.boundingBox()
  expect(panelBounds!.x).toBeGreaterThanOrEqual(0)
  expect(panelBounds!.x + panelBounds!.width).toBeLessThanOrEqual(390)
  await panel.getByRole('button', { name: '关闭历史会话', exact: true }).click()
  await surface.getByRole('button', { name: '关闭 AI 助手', exact: true }).click()
  await expect(surface).toHaveCount(0)
})

test('真实包应用完成流式对话、模型切换、历史保存与主题切换', async ({ page, request }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/chat')
  const chat = page.locator('tr-chat')
  await expect(chat.locator('[contenteditable=true]')).toBeVisible()
  await chat.locator('[contenteditable=true]').fill('应用首条提问')
  await chat.locator('.tr-sender-submit-button').click()
  await expect(chat.getByText('收到：应用首条提问。这是本地协议验证回复。', { exact: true })).toBeVisible()
  await expect
    .poll(async () => (await request.get('http://127.0.0.1:4550/requests')).json())
    .toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          body: expect.objectContaining({ model: 'qwen3.7-flash', stream: true }),
          authorization: 'Bearer local-test-key',
          origin: new URL(page.url()).origin,
        }),
      ]),
    )
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('tiny-robot-ai-conversations') ?? ''))
    .toContain('收到：应用首条提问。这是本地协议验证回复。')
  await page.reload()
  await expect(chat.locator('[contenteditable=true]')).toBeVisible()
  await chat.getByRole('button', { name: '展开会话列表', exact: true }).click()
  await expect(chat.getByText('应用首条提问', { exact: true }).first()).toBeVisible()
  await chat.getByText('应用首条提问', { exact: true }).first().click()
  await expect(chat.getByText('收到：应用首条提问。这是本地协议验证回复。', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '切换主题', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-tr-color-mode', 'dark')
  await chat.locator('.tr-model-selector__trigger').click()
  await page.getByText('deepseek-v4-flash', { exact: true }).click()
  await chat.locator('[contenteditable=true]').fill('第二个模型')
  await chat.locator('.tr-sender-submit-button').click()
  await expect(chat.getByText('收到：第二个模型。这是本地协议验证回复。', { exact: true })).toBeVisible()
  await expect
    .poll(async () => (await request.get('http://127.0.0.1:4550/requests')).json())
    .toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          origin: new URL(page.url()).origin,
          body: expect.objectContaining({ model: 'deepseek-v4-flash' }),
        }),
      ]),
    )
  expect(errors).toEqual([])
})

test('生成可停止，请求失败后可以继续提问', async ({ page }) => {
  await page.goto('/chat')
  const chat = page.locator('tr-chat')
  const input = chat.locator('[contenteditable=true]')
  await expect(input).toBeVisible()
  await input.fill('慢速生成')
  await chat.locator('.tr-sender-submit-button').click()
  await expect(chat.getByText(/片段0/)).toBeVisible()
  await chat.locator('.tr-sender-submit-button__cancel').click()
  await expect(chat.locator('.tr-sender-submit-button__cancel')).toHaveCount(0)
  await input.fill('模拟失败')
  await chat.locator('.tr-sender-submit-button').click()
  await expect(chat.getByText(/HTTP 503/)).toBeVisible()
  await input.fill('恢复提问')
  await chat.locator('.tr-sender-submit-button').click()
  await expect(chat.getByText('收到：恢复提问。这是本地协议验证回复。', { exact: true })).toBeVisible()
})

test('宿主释放中止当前和后台生成，保留已有历史', async ({ page, request }) => {
  await page.goto('/chat')
  const chat = page.locator('tr-chat')
  const input = chat.locator('[contenteditable=true]')
  await expect(input).toBeVisible()
  await input.fill('慢速 A')
  await chat.locator('.tr-sender-submit-button').click()
  await expect(chat.getByText(/片段0/)).toBeVisible()
  await chat.evaluate((element) => {
    const runtime = (element as TrChatHTMLElement).runtime!
    runtime.actions.createConversation({ title: '后台验证 B' })
    void runtime.actions.send({ text: '慢速 B' })
  })
  await expect(chat.getByText(/片段0/)).toBeVisible()
  const origin = new URL(page.url()).origin
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false })))
  await expect
    .poll(async () => {
      const records = await (await request.get('http://127.0.0.1:4550/requests')).json()
      return records
        .filter(
          (record: { origin: string; body: { messages?: { role: string; content: string }[] } }) =>
            record.origin === origin &&
            ['慢速 A', '慢速 B'].includes(
              record.body.messages?.findLast((message) => message.role === 'user')?.content ?? '',
            ),
        )
        .map((record: { aborted: boolean }) => record.aborted)
    })
    .toEqual([true, true])
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('tiny-robot-ai-conversations') ?? ''))
    .toContain('慢速 A')
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('tiny-robot-ai-conversations') ?? ''))
    .toContain('慢速 B')
})

for (const path of ['/chat', '/workspace']) {
  test(`MCP 按需安装并完成工具发现与调用 ${path}`, async ({ page, request }) => {
    await page.goto(path)
    if (path === '/workspace') await page.getByRole('button', { name: '打开 AI 助手', exact: true }).click()
    const chat = page.locator('tr-chat')
    const view = path === '/workspace' ? page.locator('.tr-layout--floating') : chat
    await expect(view.locator('[contenteditable=true]')).toBeVisible()
    await view.getByRole('button', { name: 'MCP', exact: true }).click()
    const service = page.getByRole('listitem').filter({ hasText: 'Model Context Protocol 文档' })
    await service.getByRole('button', { name: '安装', exact: true }).click()
    await expect
      .poll(() =>
        chat.evaluate((element) =>
          (element as TrChatHTMLElement).runtime!.composer.mcp!.tools.value['model-context-protocol-mcp']?.map(
            (tool) => tool.id,
          ),
        ),
      )
      .toContain('lookup')
    await chat.evaluate((element) =>
      (element as TrChatHTMLElement).runtime!.composer.mcp!.setToolEnabled(
        'model-context-protocol-mcp',
        'lookup',
        true,
      ),
    )
    await view.getByRole('button', { name: '关闭详情', exact: true }).click()
    await view.locator('[contenteditable=true]').fill('调用工具')
    await view.locator('.tr-sender-submit-button').click()
    await expect(view.getByText('收到：调用工具。这是本地协议验证回复。', { exact: true })).toBeVisible()
    const origin = new URL(page.url()).origin
    await expect
      .poll(async () => (await request.get('http://127.0.0.1:4550/requests')).json())
      .toEqual(
        expect.arrayContaining([
          expect.objectContaining({ origin, body: expect.objectContaining({ method: 'tools/call' }) }),
        ]),
      )
  })
}

test('宿主 Markdown 渲染助手正文，底部复制原文并可从复制失败恢复', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/chat')
  const chat = page.locator('tr-chat')
  await chat.locator('[contenteditable=true]').fill('演示 Markdown 排版')
  await chat.locator('.tr-sender-submit-button').click()
  const markdown = chat.locator('.assistant-markdown')
  await expect(markdown.getByRole('heading', { name: '把想法变成可交付的产品' })).toBeVisible()
  await expect(chat.getByRole('button', { name: '复制回复', exact: true })).toHaveCount(0)
  await expect(markdown.locator('table')).toContainText('可交互原型')
  await expect(markdown.locator('pre code')).toContainText('console.log(nextStep)')
  await expect(markdown.locator('blockquote')).toContainText('持续倾听')
  await expect(markdown.getByRole('link', { name: '阅读指南' })).toHaveAttribute('href', 'https://example.com/guide')
  // 原始 HTML 作为文本显示，不能变成可执行节点或危险链接。
  await expect(markdown).toContainText('<img src=x')
  await expect(markdown.locator('img, a[href^="javascript:"]')).toHaveCount(0)
  const copy = chat.getByRole('button', { name: '复制回复', exact: true })
  await expect(copy).toBeVisible()
  await copy.click()
  await expect(chat.getByRole('button', { name: '已复制', exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(markdownReply)
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, 'writeText', {
      configurable: true,
      value: () => Promise.reject(new Error('denied')),
    })
  })
  await chat.getByRole('button', { name: '已复制', exact: true }).click()
  const retry = chat.getByRole('button', { name: '复制失败，点击重试', exact: true })
  await expect(retry).toBeVisible()
  await page.evaluate(() => {
    delete (navigator.clipboard as unknown as Record<string, unknown>).writeText
  })
  await retry.click()
  await expect(chat.getByRole('button', { name: '已复制', exact: true })).toBeVisible()
  await page.screenshot({
    path: `/tmp/trchat-${test.info().project.name}-markdown-desktop.png`,
    animations: 'disabled',
  })
  await page.getByRole('button', { name: '切换主题', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-tr-color-mode', 'dark')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(chat.locator('.tr-chat-ui--mobile')).toBeVisible()
  await markdown.getByRole('heading', { name: '把想法变成可交付的产品' }).scrollIntoViewIfNeeded()
  await expect(markdown.getByRole('heading', { name: '把想法变成可交付的产品' })).toBeVisible()
  await expect(markdown.getByRole('heading', { name: '把想法变成可交付的产品' })).toBeInViewport()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  expect(await markdown.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true)
  await page.screenshot({ path: `/tmp/trchat-${test.info().project.name}-markdown-mobile.png`, animations: 'disabled' })
  await chat.locator('[contenteditable=true]').fill('**保留用户 Markdown**')
  await chat.locator('.tr-sender-submit-button').click()
  await expect(chat.locator('[data-role="user"] strong').getByText('保留用户 Markdown', { exact: true })).toBeVisible()
  await expect(chat.locator('.assistant-markdown').last()).toContainText('这是本地协议验证回复。')
})
