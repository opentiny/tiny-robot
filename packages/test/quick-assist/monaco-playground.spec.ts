import { expect, test } from '@playwright/test'

test('Monaco demo loads and submits inside the real Playground REPL preview', async ({ page }) => {
  test.setTimeout(180_000)
  test.skip(
    process.env.QUICK_ASSIST_PLAYGROUND_CDN !== '1',
    'Set QUICK_ASSIST_PLAYGROUND_CDN=1 to verify live CDN modules',
  )
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/quick-assist/monaco-playground.html')
  const preview = page.frameLocator('iframe')
  const demo = preview.locator('#qa-monaco-manual')
  await expect.poll(() => demo.getByRole('status').textContent(), { timeout: 60_000 }).not.toBe('正在加载编辑器…')
  await expect(demo.getByRole('status')).toHaveText('编辑器已就绪')
  const editor = demo.locator('.monaco-editor')
  await expect(editor).toBeVisible()
  await expect(editor.locator('.view-line').first()).toContainText('function calculatePrice')
  // Language registration must share the editor's registry, not a second bundle.
  await expect(editor.locator('.view-line .mtk6').first()).toBeVisible()
  await editor.locator('.view-lines').click({ position: { x: 10, y: 10 } })
  await page.keyboard.press('Shift+ArrowRight')
  const trigger = preview.locator('.tr-quick-assist__trigger')
  await expect(trigger).toBeVisible()
  await trigger.click()
  await expect(preview.locator('.tr-quick-assist__input')).toHaveValue('')
  await preview.getByRole('button', { name: '解释这段代码', exact: true }).click()
  await expect(demo.getByText('示例助手已收到请求')).toBeVisible()
  await expect(demo.locator('.qa-monaco-demo__result small')).toContainText('语言：typescript')
  expect(errors).toEqual([])
  await test.info().attach('monaco-playground-preview', { body: await page.screenshot(), contentType: 'image/png' })
})
