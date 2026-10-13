import { expect, test } from '@playwright/test'

test('runs the core Web Component smoke path', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/experiments/chat-web-component')

  await expect(page.locator('[data-example-id]')).toHaveCount(18)
  await expect(page.locator('[data-example-id="basic"]')).toHaveAttribute('data-mount-status', 'ready')
  await expect(page.locator('[data-example-id="slots-basic"] [data-renderer-output]')).toContainText('Slot 示例')

  const responsive = page.locator('[data-example-id="responsive-layout"]')
  await responsive.getByRole('button', { name: '窄屏' }).click()
  await expect(responsive.locator('[data-example-host]')).toHaveCSS('max-width', '520px')

  const send = page.locator('[data-example-id="runtime-send"]')
  await send.getByRole('button', { name: '调用 send()' }).click()
  await expect(send.locator('[data-event-log]')).toContainText('true')
  expect(errors).toEqual([])
})
