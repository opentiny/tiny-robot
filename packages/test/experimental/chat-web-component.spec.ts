import { expect, test } from '@playwright/test'
import { EXAMPLE_IDS, readCompatibilityMatrix } from './matrix'

test('validates the complete Chromium example matrix and normalized layout invariants', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'The complete matrix runs in Chromium.')
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  await page.goto('/experiments/chat-web-component')

  const cards = page.locator('[data-example-id]')
  await expect(cards).toHaveCount(EXAMPLE_IDS.length)

  for (const id of EXAMPLE_IDS) {
    const card = page.locator(`[data-example-id="${id}"]`)
    await expect(card).toHaveAttribute('data-mount-status', 'ready')
    await expect(card.locator(`[data-example-host="${id}"] > :is(tr-chat, tr-chat-ui)`)).toBeVisible()
    await expect(card.getByText(`Vue baseline: ../chat/${id}.vue`)).toBeVisible()

    const geometry = await card.locator('[data-example-host]').evaluate((host) => ({
      width: host.getBoundingClientRect().width,
      height: host.getBoundingClientRect().height,
      horizontalOverflow: host.scrollWidth - host.clientWidth,
    }))
    expect(geometry.width).toBeGreaterThan(240)
    expect(geometry.height).toBeGreaterThanOrEqual(400)
    expect(geometry.horizontalOverflow).toBeLessThanOrEqual(2)
  }

  const controlled = page.locator('[data-example-id="controlled-ui"]')
  await controlled.getByRole('button', { name: '外部更新' }).click()
  await expect(controlled.locator('tr-chat-ui')).toHaveJSProperty('inputValue', '由宿主更新的值')

  const rightAside = page.locator('[data-example-id="right-aside-panel"]')
  await rightAside.getByRole('button', { name: '打开详情' }).click()
  await expect(rightAside.getByText('当前面板：details')).toBeVisible()
  await rightAside.locator('[data-action="关闭详情"]').click()

  const runtimeError = page.locator('[data-example-id="runtime-error"]')
  await runtimeError.getByRole('button', { name: '触发失败' }).click()
  await expect(runtimeError.locator('[data-event-log]')).toContainText('runtime-action-error')
  await runtimeError.getByRole('button', { name: '恢复 Runtime' }).click()
  await expect(runtimeError.locator('[data-event-log]')).toContainText('已恢复')

  const beforeSend = page.locator('[data-example-id="runtime-before-send"]')
  await beforeSend.getByRole('button', { name: '尝试发送' }).click()
  await expect(beforeSend.locator('[data-event-log]')).toContainText('false')
  await beforeSend.getByRole('checkbox', { name: '已登录' }).check()
  await beforeSend.getByRole('button', { name: '尝试发送' }).click()
  await expect(beforeSend.locator('[data-event-log]')).toContainText('true')

  expect(consoleErrors).toEqual([])
  expect(readCompatibilityMatrix().examples.map(({ id }) => id)).toEqual(EXAMPLE_IDS)
})
