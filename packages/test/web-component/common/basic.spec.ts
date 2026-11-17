import { expect, test } from '../support/test'
import type { Page } from '@playwright/test'

test.beforeEach(async ({ request }) => {
  const candidate = await request.get('/candidate.json')
  expect(candidate.ok()).toBe(true)
  expect((await candidate.json()).id).toBe(process.env.WC_CANDIDATE_ID)
})

async function openDemo(page: Page, path: string) {
  await page.goto(`/#${path}`)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('TrChat Web Component')
  await expect(page.locator('tr-chat')).toHaveCount(1)
  await expect(page.getByTestId('ready-state')).toHaveText('已就绪')
}

test('注册真实包并提供已就绪的聊天界面', async ({ page }) => {
  await openDemo(page, '/basic/props')
  await expect(page.locator('tr-chat').getByText('我的助手', { exact: true })).toBeVisible()
})

test('内置输入框完成发送和本地回复', async ({ page }) => {
  await openDemo(page, '/basic/props')
  await page.locator('tr-chat [contenteditable="true"]').fill('你好，三个宿主')
  await page.locator('tr-chat .tr-sender-submit-button').click()
  await expect(page.locator('tr-chat').getByText('你好，我是本地演示助手。', { exact: true })).toBeVisible()
  await expect(page.locator('tr-chat').getByText('你好，三个宿主', { exact: true })).toBeVisible()
  await page.getByLabel('强制空状态').check()
  await expect(page.locator('tr-chat').getByText('你好，欢迎使用', { exact: true })).toBeVisible()
  await page.getByLabel('强制空状态').uncheck()
  await expect(page.locator('tr-chat').getByText('你好，三个宿主', { exact: true })).toBeVisible()
})

test('宿主绑定更新标题和对象配置', async ({ page }) => {
  await openDemo(page, '/basic/props')
  await page.getByLabel('标题').fill('宿主更新后的标题')
  await page.getByRole('button', { name: '应用标题', exact: true }).click()
  await expect(page.locator('tr-chat').getByText('宿主更新后的标题', { exact: true })).toBeVisible()
  await page.getByLabel('显示页头').uncheck()
  await expect(page.locator('tr-chat').getByText('宿主更新后的标题', { exact: true })).toHaveCount(0)
  await page.getByLabel('显示页头').check()
  await expect(page.locator('tr-chat').getByText('宿主更新后的标题', { exact: true })).toBeVisible()
})

test('连接后再传入 Runtime，并在当前元素上发出一次就绪通知', async ({ page }) => {
  await openDemo(page, '/basic/runtime')
  await page.getByRole('button', { name: '延后接入', exact: true }).click()
  await expect(page.getByTestId('ready-state')).toHaveText('等待 Runtime')
  await page.getByRole('button', { name: '接入 Runtime', exact: true }).click()
  await expect(page.getByTestId('ready-state')).toHaveText('已就绪')
  await expect(page.getByTestId('event-log').getByText('ready []', { exact: true })).toHaveCount(1)
})

test('浮窗属性控制初始与更新后的位置尺寸', async ({ page }) => {
  await openDemo(page, '/basic/floating')
  await page.getByLabel('浮窗模式').check()
  const floating = page.locator('.tr-layout--floating')
  await expect(floating).toHaveCSS('width', '500px')
  await expect(floating).toHaveCSS('height', '400px')
  await page.getByLabel('浮窗宽度').fill('560')
  await page.getByLabel('浮窗高度').fill('440')
  await page.getByLabel('横向偏移').fill('48')
  await page.getByLabel('纵向偏移').fill('80')
  await page.getByLabel('浮窗位置').selectOption('top-right')
  await page.getByRole('button', { name: '应用浮窗状态', exact: true }).click()
  await expect(floating).toHaveCSS('width', '560px')
  await expect(floating).toHaveCSS('height', '440px')
  await expect(floating).toHaveCSS('left', '832px')
  await expect(floating).toHaveCSS('top', '80px')
})

test('卸载并重挂后仍可聊天且没有重复就绪通知', async ({ page }) => {
  await openDemo(page, '/basic/runtime')
  await page.getByRole('button', { name: '卸载组件', exact: true }).click()
  await expect(page.locator('tr-chat')).toHaveCount(0)
  await page.getByRole('button', { name: '重新挂载', exact: true }).click()
  await expect(page.getByTestId('ready-state')).toHaveText('已就绪')
  await expect(page.getByTestId('event-log').getByText('ready []', { exact: true })).toHaveCount(1)
  await page.locator('tr-chat [contenteditable="true"]').fill('重挂后的消息')
  await page.locator('tr-chat .tr-sender-submit-button').click()
  await expect(page.locator('tr-chat').getByText('你好，我是本地演示助手。', { exact: true })).toBeVisible()
})

test('拖动浮窗会向宿主提供可读取的状态事件', async ({ page }) => {
  await openDemo(page, '/basic/floating')
  await page.getByLabel('浮窗模式').check()
  const floating = page.locator('.tr-layout--floating')
  await expect(floating).toHaveCSS('width', '500px')
  const header = floating.locator('.tr-layout__drag-bar')
  const before = await floating.boundingBox()
  const handle = await header.boundingBox()
  expect(before).toBeTruthy()
  expect(handle).toBeTruthy()
  await page.mouse.move(handle!.x + handle!.width / 2, handle!.y + handle!.height / 2)
  await page.mouse.down()
  await page.mouse.move(handle!.x + handle!.width / 2 - 80, handle!.y + handle!.height / 2 - 60, { steps: 10 })
  await page.mouse.up()
  await expect.poll(async () => (await floating.boundingBox())?.x).toBeLessThan(before!.x - 40)
  await expect(
    page.getByTestId('event-log').getByRole('listitem').filter({ hasText: 'floating-state-update' }).first(),
  ).toContainText('"width":500')
})
