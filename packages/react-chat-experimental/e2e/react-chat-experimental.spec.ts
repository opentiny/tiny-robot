import { expect, test, type Page } from '@playwright/test'
import type { TrChatHTMLElement, TrChatUIHTMLElement } from '@opentiny/tiny-robot-chat/experimental'

async function openProbe(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'TrChat 跨框架契约探针' })).toBeVisible()
  return consoleErrors
}

test('synchronizes controlled right-aside open state between React and TrChat', async ({ page }) => {
  const consoleErrors = await openProbe(page)
  const status = page.getByTestId('aside-binding-status')
  const element = page.getByTestId('react-tr-chat')

  await expect(status).toHaveText('右侧面板：关闭 · 当前面板：发布预览')
  await page.getByRole('button', { name: '打开发布预览', exact: true }).click()
  await expect(status).toHaveText('右侧面板：打开 · 当前面板：发布预览')
  await expect(element.getByText('React 发布方案', { exact: true })).toBeVisible()
  await expect.poll(() => element.evaluate((host: TrChatHTMLElement) => host.rightAsideOpen)).toBe(true)

  await element.getByRole('button', { name: '关闭详情', exact: true }).click()
  await expect(status).toHaveText('右侧面板：关闭 · 当前面板：发布预览')
  await expect.poll(() => element.evaluate((host: TrChatHTMLElement) => host.rightAsideOpen)).toBe(false)
  expect(consoleErrors).toEqual([])
})

test('writes active right-aside panel updates back into React state', async ({ page }) => {
  const consoleErrors = await openProbe(page)
  const status = page.getByTestId('aside-binding-status')
  const element = page.getByTestId('react-tr-chat')

  await page.getByRole('button', { name: '打开参考资料', exact: true }).click()
  await expect(status).toHaveText('右侧面板：打开 · 当前面板：参考资料')
  await expect(element.getByText('React 参考资料', { exact: true })).toBeVisible()
  await expect.poll(() => element.evaluate((host: TrChatHTMLElement) => host.activeRightAsidePanelId)).toBe('sources')

  await element.getByRole('button', { name: '切换到发布预览', exact: true }).click()
  await expect(status).toHaveText('右侧面板：打开 · 当前面板：发布预览')
  await expect(element.getByText('React 发布方案', { exact: true })).toBeVisible()
  await expect.poll(() => element.evaluate((host: TrChatHTMLElement) => host.activeRightAsidePanelId)).toBe('preview')
  expect(consoleErrors).toEqual([])
})

test('writes floating drag and resize updates back into a React-owned state object', async ({ page }) => {
  const consoleErrors = await openProbe(page)
  const status = page.getByTestId('floating-binding-status')
  await expect(status).toHaveText('浮动窗口：关闭 · x 24px · y 72px · 520 × 520px')

  await page.getByRole('button', { name: '打开浮动验收', exact: true }).click()
  const floating = page.locator('.tr-layout--floating')
  const element = page.getByTestId('react-floating-chat')
  await expect(floating).toBeVisible()
  await expect(status).toHaveText('浮动窗口：打开 · x 24px · y 72px · 520 × 520px')

  const dragBox = await floating.locator('.tr-layout__drag-bar').boundingBox()
  expect(dragBox).not.toBeNull()
  await page.mouse.move(dragBox!.x + dragBox!.width / 2, dragBox!.y + dragBox!.height / 2)
  await page.mouse.down()
  await page.mouse.move(dragBox!.x + dragBox!.width / 2 - 40, dragBox!.y + dragBox!.height / 2 + 30)
  await page.mouse.up()

  const stateAfterDrag = await element.evaluate((host: TrChatUIHTMLElement) => host.floatingState)
  expect(stateAfterDrag?.offsetX).toBeGreaterThan(24)

  const resizeBox = await floating.locator('.tr-layout__floating-resize-trigger--se').boundingBox()
  expect(resizeBox).not.toBeNull()
  await page.mouse.move(resizeBox!.x + resizeBox!.width / 2, resizeBox!.y + resizeBox!.height / 2)
  await page.mouse.down()
  await page.mouse.move(resizeBox!.x + resizeBox!.width / 2 + 40, resizeBox!.y + resizeBox!.height / 2 + 30)
  await page.mouse.up()

  const stateAfterResize = await element.evaluate((host: TrChatUIHTMLElement) => host.floatingState)
  expect(stateAfterResize?.width).toBeGreaterThan(stateAfterDrag?.width ?? 0)
  expect(stateAfterResize?.height).toBeGreaterThan(stateAfterDrag?.height ?? 0)
  await expect(status).toHaveText(
    `浮动窗口：打开 · x ${stateAfterResize?.offsetX}px · y ${stateAfterResize?.offsetY}px · ${stateAfterResize?.width} × ${stateAfterResize?.height}px`,
  )
  expect(consoleErrors).toEqual([])
})
