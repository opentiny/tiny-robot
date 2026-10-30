import { expect, test } from '@playwright/test'
import { EXAMPLE_IDS } from './matrix'

test('runs the core Web Component smoke path', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/experiments/chat-web-component')

  await expect(page.locator('[data-example-id]')).toHaveCount(EXAMPLE_IDS.length)
  await expect(page.locator('[data-example-id="basic"]')).toHaveAttribute('data-mount-status', 'ready')
  const slots = page.locator('[data-example-id="slots-basic"]')
  await expect(slots).toHaveAttribute('data-mount-status', 'ready')
  await expect(slots.locator('[data-slot-header]')).toContainText('插槽定制')

  const responsive = page.locator('[data-example-id="responsive-layout"]')
  await responsive.getByRole('button', { name: '移动端 Drawer', exact: true }).click()
  await expect(responsive.locator('[data-example-host]')).toHaveCSS('max-width', '390px')

  const send = page.locator('[data-example-id="runtime-send"]')
  const sendEmptyButtons = send.getByRole('button', { name: '发送空文本', exact: true })
  await sendEmptyButtons.nth(0).click()
  await expect(send.getByText('结果：false', { exact: true })).toBeVisible()
  await sendEmptyButtons.nth(1).click()
  await expect(send.getByText('结果：自定义 send 收到 text: ""，结果: true', { exact: true })).toBeVisible()
  expect(errors).toEqual([])
})
