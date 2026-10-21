import { expect, test } from '@playwright/test'

test('published API powers the actual Monaco documentation demo', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(process.env.QUICK_ASSIST_DOCS_URL ?? '/quick-assist/monaco-manual.html')
  const demo = page.locator('#qa-monaco-manual')
  await expect(demo.getByRole('status')).toHaveText('编辑器已就绪')
  const editor = demo.locator('.monaco-editor')
  await expect(editor).toBeVisible()
  await editor.scrollIntoViewIfNeeded()
  const first = await editor.locator('.view-line').nth(0).boundingBox()
  const third = await editor.locator('.view-line').nth(2).boundingBox()
  const editorBox = await editor.boundingBox()
  await page.mouse.move(first!.x + 1, first!.y + first!.height / 2)
  await page.mouse.down()
  await page.mouse.move(Math.min(third!.x + 450, editorBox!.x + editorBox!.width - 20), third!.y + third!.height / 2, {
    steps: 10,
  })
  await expect(page.locator('.tr-quick-assist__trigger')).toHaveCount(0)
  await page.mouse.up()
  await expect(demo.getByRole('button', { name: '解释选中代码' })).toHaveCount(0)
  await expect(page.locator('.tr-quick-assist__trigger')).toBeVisible()
  await page.locator('.tr-quick-assist__trigger').click()
  await expect(page.locator('.tr-quick-assist__popover textarea')).toHaveValue(/function calculatePrice/)
  // Esc 的 keyup 和编辑器重获焦点不能立即重新激活同一选区。
  await page.keyboard.press('Escape')
  await page.keyboard.press('Shift')
  await expect(page.locator('.tr-quick-assist__trigger')).toHaveCount(0)
  // 清空后重新划选代码，再通过选区入口提交。
  await editor.locator('.view-lines').click({ position: { x: 10, y: 10 } })
  await page.keyboard.press('ArrowLeft')
  await expect(demo.locator('.qa-monaco-demo__hint')).toHaveText('尚未选择代码')
  const reselectFirst = await editor.locator('.view-line').nth(0).boundingBox()
  const reselectThird = await editor.locator('.view-line').nth(2).boundingBox()
  const reselectBox = await editor.boundingBox()
  await page.mouse.move(reselectFirst!.x + 1, reselectFirst!.y + reselectFirst!.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    Math.min(reselectThird!.x + 450, reselectBox!.x + reselectBox!.width - 20),
    reselectThird!.y + reselectThird!.height / 2,
    { steps: 10 },
  )
  await page.mouse.up()
  await page.locator('.tr-quick-assist__trigger').click()
  await page.getByRole('button', { name: '解释这段代码', exact: true }).click()
  await expect(demo.getByText('示例助手已收到请求')).toBeVisible()
  await expect(page.locator('.qa-monaco-demo__result pre')).toContainText('calculatePrice')
  await expect(page.locator('.qa-monaco-demo__result small')).toContainText('来源：monaco')
  await expect(page.locator('.tr-quick-assist__popover')).toHaveCount(0)
  if (process.env.QUICK_ASSIST_DOCS_SCREENSHOT_PATH) {
    await demo.screenshot({ path: process.env.QUICK_ASSIST_DOCS_SCREENSHOT_PATH })
  }
  expect(errors).toEqual([])
})

test('Monaco keyboard selection automatically activates and an empty selection resets dismissal', async ({ page }) => {
  await page.goto('/quick-assist/monaco-manual.html')
  const demo = page.locator('#qa-monaco-manual')
  await expect(demo.getByRole('status')).toHaveText('编辑器已就绪')
  await demo.locator('.view-lines').click({ position: { x: 10, y: 10 } })
  await page.keyboard.press('Shift+ArrowRight')
  await expect(page.locator('.tr-quick-assist__trigger')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('.tr-quick-assist__trigger')).toHaveCount(0)
  await page.keyboard.press('ArrowLeft')
  await expect(demo.locator('.qa-monaco-demo__hint')).toHaveText('尚未选择代码')
  await page.keyboard.press('Shift+ArrowRight')
  await expect(page.locator('.tr-quick-assist__trigger')).toBeVisible()
})
