import { expect, test } from '@playwright/test'

test('activation documentation demo submits from button and custom metric anchors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(process.env.QUICK_ASSIST_DOCS_URL ?? '/quick-assist/activation-demo.html')
  const demo = page.locator('#qa-manual-activation')
  await expect(demo).toBeVisible()
  await demo.scrollIntoViewIfNeeded()
  await expect(demo.getByRole('checkbox', { name: '直接显示输入框（跳过“智能帮助”按钮）' })).toBeChecked()
  await demo.getByRole('button', { name: '解释“按需计费”' }).click()
  await expect(page.locator('.tr-quick-assist__trigger')).toHaveCount(0)
  await expect(page.locator('.tr-quick-assist__popover textarea')).toHaveValue('按需计费')
  await expect(page.locator('.tr-quick-assist__suggestion')).toHaveText(['解释术语', '适用场景'])
  await page.locator('.tr-quick-assist__popover textarea').press('Enter')
  await expect(demo.locator('dd').nth(1)).toHaveText('manual')
  await expect(demo.locator('dd').nth(2)).toContainText('billing')

  const metric = demo.getByRole('button', { name: '服务可用性 99.95%' })
  await metric.hover()
  await expect(metric).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.tr-quick-assist__trigger')).toHaveCount(0)
  await expect(page.locator('.tr-quick-assist__popover textarea')).toHaveValue('服务可用性：99.95%')
  await expect(page.locator('.tr-quick-assist__suggestion')).toHaveText(['解读这个指标', '异常时如何排查'])
  await page.locator('.tr-quick-assist__popover textarea').press('Enter')
  await expect(demo.locator('dd').nth(1)).toHaveText('dashboard')
  await expect(demo.locator('dd').nth(2)).toContainText('availability')
  // 单次覆盖不影响实例默认推荐；关闭开关可恢复入口按钮流程。
  await demo.getByRole('checkbox').uncheck()
  await demo.getByRole('button', { name: '解释“按需计费”' }).click()
  await page.locator('.tr-quick-assist__trigger').click()
  await expect(page.locator('.tr-quick-assist__suggestion')).toHaveText(['解释术语', '适用场景'])
  await page.keyboard.press('Escape')
  expect(errors).toEqual([])
  if (process.env.QUICK_ASSIST_ACTIVATION_SCREENSHOT_PATH) {
    await demo.screenshot({ path: process.env.QUICK_ASSIST_ACTIVATION_SCREENSHOT_PATH })
  }
})
