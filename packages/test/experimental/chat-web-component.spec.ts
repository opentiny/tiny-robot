import { expect, test } from '@playwright/test'
import { EXAMPLE_IDS, readCompatibilityMatrix } from './matrix'

test('validates the complete Chromium example matrix and normalized layout invariants', async ({ page }, testInfo) => {
  test.setTimeout(60_000)
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
    if (id === 'floating-layout') {
      await expect(card.locator(`[data-example-host="${id}"] > :is(tr-chat, tr-chat-ui)`)).toHaveCount(0)
      await card.getByRole('button', { name: '打开浮动聊天', exact: true }).click()
      await expect(page.locator('.tr-layout--floating')).toBeVisible()
      await card.getByRole('button', { name: '关闭浮动聊天', exact: true }).click()
      await expect(page.locator('.tr-layout--floating')).toHaveCount(0)
    } else if (id === 'runtime-send') {
      await expect(card.locator(`[data-example-host="${id}"] > :is(tr-chat, tr-chat-ui)`)).toHaveCount(0)
      await expect(card.getByRole('button', { name: '发送空文本', exact: true })).toHaveCount(2)
    } else if (id === 'initialization-timing') {
      await expect(card.locator('tr-chat-ui-timing')).toHaveCount(1)
      await card.getByRole('button', { name: '执行延迟注册', exact: true }).click()
      await expect(card.locator('tr-chat-ui-timing .tr-layout')).toHaveCount(1)
    } else {
      await expect(card.locator(`[data-example-host="${id}"] > :is(tr-chat, tr-chat-ui)`)).toBeVisible()
    }
    await expect(card.getByText('Vue baseline:', { exact: false })).toBeVisible()

    const geometry = await card.locator('[data-example-host]').evaluate((host) => ({
      width: host.getBoundingClientRect().width,
      height: host.getBoundingClientRect().height,
      horizontalOverflow: host.scrollWidth - host.clientWidth,
    }))
    expect(geometry.width).toBeGreaterThan(240)
    expect(geometry.height).toBeGreaterThanOrEqual(id === 'runtime-send' ? 180 : 400)
    expect(geometry.horizontalOverflow).toBeLessThanOrEqual(2)
  }

  const controlled = page.locator('[data-example-id="controlled-ui"]')
  await controlled.getByRole('button', { name: '外部更新' }).click()
  await expect(controlled.locator('tr-chat-ui')).toHaveJSProperty('inputValue', '由宿主更新的值')

  const rightAside = page.locator('[data-example-id="right-aside-panel"]')
  await rightAside.getByRole('button', { name: '查看引用资料', exact: true }).click()
  await expect(rightAside.getByText('引用资料', { exact: true })).toBeVisible()
  await rightAside.getByRole('button', { name: '需求文档', exact: true }).click()
  await expect(rightAside.getByText('发布方案预览', { exact: true })).toBeVisible()

  const runtimeError = page.locator('[data-example-id="runtime-error"]')
  await runtimeError.locator('.tr-sender-editor').fill('这次会失败')
  await runtimeError.locator('.tr-sender-submit-button').click()
  await expect(runtimeError.getByText('已收到发送失败通知', { exact: true })).toBeVisible()
  await expect(runtimeError.getByText('模拟请求失败：模型服务暂时不可用。', { exact: true })).toBeVisible()
  await runtimeError.locator('.tr-sender-editor').fill('恢复验证')
  await runtimeError.locator('.tr-sender-submit-button').click()
  await expect(runtimeError.getByText('正常回复：恢复验证', { exact: true })).toBeVisible()

  const beforeSend = page.locator('[data-example-id="runtime-before-send"]')
  await beforeSend.locator('.tr-sender-editor').fill('矩阵拦截验证')
  await beforeSend.locator('.tr-sender-submit-button').click()
  await expect(beforeSend.getByRole('status')).toContainText('reject')
  await beforeSend.getByRole('checkbox', { name: '已登录（模拟）' }).check()
  await beforeSend.locator('.tr-sender-submit-button').click()
  await expect(beforeSend.getByRole('status')).toContainText('continue')
  await expect(beforeSend.locator('.tr-bubble').getByText('矩阵拦截验证', { exact: true })).toBeVisible()

  const runtimeActions = page.locator('[data-example-id="runtime-actions"]')
  await runtimeActions.getByRole('button', { name: '发送预设问题' }).click()
  await expect(runtimeActions.getByText('流式响应', { exact: false })).toBeVisible()
  await runtimeActions.getByRole('button', { name: '停止回答' }).click()
  await expect(runtimeActions.locator('[data-example-host]')).toHaveAttribute('data-abort-status', 'complete')

  expect(consoleErrors).toEqual([])
  expect(readCompatibilityMatrix().examples.map(({ id }) => id)).toEqual(EXAMPLE_IDS)
})
