import { expect, test } from '@playwright/test'

interface HeapSnapshot {
  usedJSHeapSize: number
  documents: number
  nodes: number
  jsEventListeners: number
}

function duration(text: string) {
  const match = text.match(/duration=(\d+)ms/)
  expect(match, `Expected a duration in status: ${text}`).not.toBeNull()
  return Number(match?.[1])
}

test('keeps long-session work and repeated mounts within conservative Chromium budgets', async ({
  context,
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Heap and DOM counters use the Chromium DevTools protocol.')
  test.setTimeout(45_000)

  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  await page.goto('/experiments/chat-web-component')
  const card = page.locator('[data-example-id="performance-stress"]')
  await expect(card).toHaveAttribute('data-mount-status', 'ready')

  const cdp = await context.newCDPSession(page)
  await cdp.send('Performance.enable')
  const snapshot = async (): Promise<HeapSnapshot> => {
    await page.requestGC()
    const counters = await cdp.send('Memory.getDOMCounters')
    const metrics = await cdp.send('Performance.getMetrics')
    const heapMetric = metrics.metrics.find(({ name }) => name === 'JSHeapUsedSize')
    expect(heapMetric, 'Chromium must expose JSHeapUsedSize for this memory budget').toBeDefined()
    const usedJSHeapSize = heapMetric!.value
    return { usedJSHeapSize, ...counters }
  }

  const before = await snapshot()
  await card.getByRole('button', { name: '执行长会话压力', exact: true }).click()
  await expect(card.getByTestId('performance-status')).toContainText('updates=100')
  const updateDurationMs = duration((await card.getByTestId('performance-status').textContent()) ?? '')

  await card.getByRole('button', { name: '执行重挂载压力', exact: true }).click()
  await expect(card.getByTestId('performance-status')).toContainText('remounts=30')
  const remountDurationMs = duration((await card.getByTestId('performance-status').textContent()) ?? '')
  const after = await snapshot()

  const measurements = {
    updateDurationMs,
    remountDurationMs,
    before,
    after,
    delta: {
      usedJSHeapSize: after.usedJSHeapSize - before.usedJSHeapSize,
      documents: after.documents - before.documents,
      nodes: after.nodes - before.nodes,
      jsEventListeners: after.jsEventListeners - before.jsEventListeners,
    },
  }
  await testInfo.attach('performance-memory.json', {
    body: JSON.stringify(measurements, null, 2),
    contentType: 'application/json',
  })
  expect(updateDurationMs).toBeLessThan(5_000)
  expect(remountDurationMs).toBeLessThan(20_000)
  expect(measurements.delta.usedJSHeapSize).toBeLessThan(16 * 1024 * 1024)
  expect(measurements.delta.documents).toBeLessThanOrEqual(2)
  expect(measurements.delta.nodes).toBeLessThanOrEqual(1_000)
  expect(measurements.delta.jsEventListeners).toBeLessThanOrEqual(300)
  await expect(card.locator('tr-chat-ui .tr-layout')).toHaveCount(1)
  expect(consoleErrors).toEqual([])
})
