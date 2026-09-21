import { expect, test } from '@playwright/test'

const distanceToBottom = (selector: string) =>
  document.querySelector<HTMLElement>(selector)!.scrollHeight -
  document.querySelector<HTMLElement>(selector)!.clientHeight -
  document.querySelector<HTMLElement>(selector)!.scrollTop

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Bubble 组件' }).click()
  await expect(page.getByRole('heading', { level: 2, name: 'Bubble 自动滚动测试' })).toBeVisible()
  await expect.poll(() => page.evaluate(distanceToBottom, '[data-testid="observed-scroll"]')).toBeLessThanOrEqual(1)
  await expect.poll(() => page.evaluate(distanceToBottom, '[data-testid="legacy-scroll"]')).toBeLessThanOrEqual(1)
})

test('contentTarget 大幅增高时保持跟随底部', async ({ page }) => {
  await page.getByTestId('grow-observed').click()
  await expect.poll(() => page.evaluate(distanceToBottom, '[data-testid="observed-scroll"]')).toBeLessThanOrEqual(1)
  await page.getByTestId('grow-observed').click()
  await expect.poll(() => page.evaluate(distanceToBottom, '[data-testid="observed-scroll"]')).toBeLessThanOrEqual(1)
})

test('用户向上滚动后内容增高时保持阅读位置', async ({ page }) => {
  const scroller = page.getByTestId('observed-scroll')
  await scroller.evaluate((node) => {
    node.scrollTop = node.scrollHeight - node.clientHeight - 100
    node.dispatchEvent(new Event('scroll'))
  })
  await expect.poll(() => scroller.evaluate((node) => node.scrollTop)).toBe(200)
  const before = await scroller.evaluate((node) => node.scrollTop)
  await page.getByTestId('grow-observed').click()
  await expect.poll(() => scroller.evaluate((node) => node.scrollTop)).toBe(before)
})

test('enabled 为 false 时停止跟随，重新启用后恢复保留的跟随意图', async ({ page }) => {
  await page.getByTestId('toggle-enabled').click()
  await page.getByTestId('grow-observed').click()
  await expect.poll(() => page.evaluate(distanceToBottom, '[data-testid="observed-scroll"]')).toBeGreaterThan(100)
  await page.getByTestId('toggle-enabled').click()
  await expect.poll(() => page.evaluate(distanceToBottom, '[data-testid="observed-scroll"]')).toBeLessThanOrEqual(1)
})

test('旧 source 参数变化仍触发滚动', async ({ page }) => {
  await page.getByTestId('grow-legacy').click()
  await expect.poll(() => page.evaluate(distanceToBottom, '[data-testid="legacy-scroll"]')).toBeLessThanOrEqual(1)
})

test('scrollOnMount 为 false 时 ResizeObserver 不会触发初始滚动', async ({ page }) => {
  await expect(page.getByTestId('no-mount-scroll')).toHaveJSProperty('scrollTop', 0)
})
