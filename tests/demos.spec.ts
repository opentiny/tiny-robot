import { test, expect } from '@playwright/test'
import { fileURLToPath } from 'node:url'

test.beforeEach(async ({ page }) => {
  // The default demo experience must work without contacting a model service.
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:4175(?:\/|$))/, (route) => route.abort())
})

test('seven demos are discoverable and an unknown URL opens the chat example', async ({ page }) => {
  await page.goto('/#unknown')
  const nav = page.getByRole('navigation', { name: 'Demo 导航' })
  await expect(nav.getByRole('link')).toHaveCount(7)
  await expect(page.getByRole('heading', { name: '会话与附件', exact: true })).toBeVisible()
  await nav.getByRole('link', { name: '多行输入首行提示', exact: true }).click()
  await page.getByRole('button', { name: '起草客户回复' }).click()
  await page.locator('[contenteditable=true]').fill('保留客户反馈')
  await page.getByRole('button', { name: '重置示例' }).click()
  await expect(page.locator('[contenteditable=true]')).toHaveText('')
  await expect(page.getByRole('button', { name: '起草客户回复' })).toHaveAttribute('aria-pressed', 'false')
})

test('chat reopens history and streams a local reply with an attached image', async ({ page }) => {
  await page.goto('/#chat')
  await expect(page.getByLabel('回复来源')).toHaveValue('mock')
  await page.getByText('本周产品进展', { exact: true }).click()
  await expect(page.getByText('帮我梳理一下本周的产品进展。')).toBeVisible()
  const chooser = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: '添加图片', exact: true }).click()
  await (
    await chooser
  ).setFiles(fileURLToPath(new URL('../public/samples/chat-architecture.png', import.meta.url)))
  await expect(page.getByText('chat-architecture.png', { exact: true })).toBeVisible()
  const editor = page.locator('[contenteditable=true]')
  await editor.fill('请整理这张图的要点。')
  const sent = page.waitForRequest('**/api/demo/chat/completions')
  await page.locator('.tr-sender-submit-button').click()
  const body = (await sent).postDataJSON()
  expect(body.messages.some((m: { content: unknown }) => m.content === '帮我梳理一下本周的产品进展。')).toBe(
    true,
  )
  expect(body.messages.at(-1).content).toEqual([
    { type: 'text', text: '请整理这张图的要点。' },
    { type: 'image_url', image_url: { url: expect.stringMatching(/^data:image\/png;base64,/) } },
  ])
  await expect(page.locator('.tr-bubble__image')).toBeVisible()
  await expect(page.getByText('已收到图片和问题。', { exact: false })).toBeVisible()
  await expect(page.getByText('这是本地模拟回复，不分析图片内容。', { exact: false })).toBeVisible()
})

test('missing live credentials produce useful feedback instead of sending a mock reply', async ({ page }) => {
  await page.goto('/#chat')
  await page.getByLabel('回复来源').selectOption('live')
  await page.locator('[contenteditable=true]').fill('你好')
  await page.locator('.tr-sender-submit-button').click()
  await expect(page.getByRole('alert').filter({ hasText: 'DASHSCOPE_API_KEY' }).first()).toBeVisible()
})

test('model selection searches and applies reasoning settings', async ({ page }) => {
  await page.goto('/#model')
  await page.getByRole('button', { name: '通用助手', exact: true }).click()
  await page.getByPlaceholder('搜索模型').fill('推理')
  await page.getByRole('option', { name: /推理助手/ }).click()
  await page.getByRole('button', { name: '深度', exact: true }).click()
  await expect(page.getByRole('button', { name: '深度', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByRole('button', { name: '推理助手 · 深度', exact: true })).toBeVisible()
})

test('extensions install a service and import an actual local Skill', async ({ page }) => {
  await page.goto('/#extensions')
  const available = page.locator('[data-tab-id="mcp"][data-section-key="available"]')
  await available.getByRole('button', { name: '安装', exact: true }).first().click()
  await expect(page.getByRole('switch', { name: '启用日程助手' })).toBeChecked()
  await page.getByRole('button', { name: '导入本地 Skill' }).click()
  await page
    .getByLabel('Skill 包')
    .setInputFiles(fileURLToPath(new URL('../samples/weekly-report', import.meta.url)))
  await page.getByRole('button', { name: '确定', exact: true }).click()
  await expect(page.getByRole('switch', { name: '启用周报整理' })).toBeChecked()
  await page.getByRole('button', { name: '周报整理', exact: true }).click()
  await expect(page.getByRole('dialog').getByText('周报整理', { exact: true }).first()).toBeVisible()
})

test('tool approval allows saving and restores a pending request after reload', async ({ page }) => {
  await page.goto('/#approval')
  const editor = page.locator('[contenteditable=true]')
  await editor.fill('请保存周报')
  await page.locator('.tr-sender-submit-button').click()
  await page.getByRole('button', { name: '允许', exact: true }).click()
  await expect(page.getByText('周报已保存到演示工作区。', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '重置示例' }).click()
  await editor.fill('请保存周报')
  await page.locator('.tr-sender-submit-button').click()
  await expect(page.getByText('等待确认', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText('请保存周报', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '拒绝', exact: true }).click()
  await expect(page.getByText('已取消保存，周报内容保留在当前对话中。', { exact: true })).toBeVisible()
})

test('input prefix follows task changes while preserving draft and multiline input', async ({ page }) => {
  await page.goto('/#input-prefix')
  await page.getByRole('button', { name: '起草客户回复' }).click()
  const editor = page.locator('[contenteditable=true]')
  await editor.fill('客户反馈登录失败。')
  await page.getByRole('button', { name: '生成交接摘要' }).click()
  await expect(editor).toHaveText('客户反馈登录失败。')
  await expect(page.locator('.input-prefix')).toHaveText('交接摘要')
  await editor.press('Control+Enter')
  await expect(page.getByRole('status')).toContainText('已提交 · 交接摘要')
  await expect(page.getByRole('status')).toContainText('客户反馈登录失败。')
  await editor.pressSequentially('第一行')
  await editor.press('Enter')
  await editor.pressSequentially('第二行')
  await expect(editor.locator('p')).toHaveCount(2)
  await expect(editor.locator('p').last()).toHaveText('第二行')
})

test('anchor jumps to a historical question and returns to the latest message', async ({ page }) => {
  await page.goto('/#anchor')
  const anchor = page.locator('.tr-anchor')
  await anchor.locator('button').first().hover()
  await anchor.getByRole('button', { name: '上线前需要准备哪些材料？' }).click()
  await expect(anchor.locator('[aria-current=location]')).toHaveAccessibleName('上线前需要准备哪些材料？')
  // The current item updates before the smooth scroll reaches the first message.
  await expect
    .poll(() => page.locator('.chat-main-scroll-host').evaluate((el) => el.scrollTop))
    .toBeLessThan(8)
  await page.getByRole('button', { name: '滚动到底部' }).click()
  await expect(anchor.locator('[aria-current=location]')).toHaveAccessibleName(
    '请整理一份发布结束后的检查清单。',
  )
})

test('floating chat moves and resizes with the actual handle', async ({ page }) => {
  await page.goto('/#floating')
  await page.getByRole('button', { name: '打开聊天浮窗' }).click()
  const bar = page.locator('.tr-layout__drag-bar')
  await expect(bar).toBeVisible()
  const start = (await bar.boundingBox())!
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  await page.mouse.move(start.x + start.width / 2 + 70, start.y + start.height / 2 + 30, { steps: 12 })
  await page.mouse.up()
  await expect.poll(async () => (await bar.boundingBox())!.x).toBeGreaterThan(start.x + 60)
  const corner = page.locator('.tr-layout__floating-resize-trigger--se')
  const original = (await corner.boundingBox())!
  await page.mouse.move(original.x + original.width / 2, original.y + original.height / 2)
  await page.mouse.down()
  await page.mouse.move(original.x + original.width / 2 + 70, original.y + original.height / 2 + 30, {
    steps: 12,
  })
  await page.mouse.up()
  await expect.poll(async () => (await corner.boundingBox())!.x).toBeGreaterThan(original.x + 60)
})

test('navigation and standalone input work on a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#input-prefix')
  await expect(page.getByRole('navigation', { name: 'Demo 导航' }).getByRole('link')).toHaveCount(7)
  await page.getByRole('button', { name: '起草客户回复' }).click()
  await page.locator('[contenteditable=true]').fill('移动端草稿')
  await expect(page.locator('[contenteditable=true]')).toHaveText('移动端草稿')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('a narrow floating chat has an operable close button inside the window', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#floating')
  await page.getByRole('button', { name: '打开聊天浮窗' }).click()
  await page.locator('.tr-layout--floating').getByRole('button', { name: '关闭浮窗', exact: true }).click()
  await expect(page.getByRole('button', { name: '打开聊天浮窗' })).toBeVisible()
  await page.getByRole('button', { name: '打开聊天浮窗' }).click()
  await expect(page.locator('.tr-layout__drag-bar')).toBeVisible()
})

for (const decision of ['允许', '拒绝']) {
  test(`a tool request is not offered again after ${decision} and immediate reload`, async ({ page }) => {
    await page.goto('/#approval')
    await page.locator('[contenteditable=true]').fill('请保存周报')
    await page.locator('.tr-sender-submit-button').click()
    await page.getByRole('button', { name: decision, exact: true }).click()
    await page.reload()
    await expect(page.getByText('需要将这份周报保存到团队工作区吗？', { exact: false })).toBeVisible()
    // A completed user decision must not be restored as an actionable pending request.
    await expect(page.getByRole('button', { name: '允许', exact: true })).toHaveCount(0)
    await expect(page.getByRole('button', { name: '拒绝', exact: true })).toHaveCount(0)
  })
}
