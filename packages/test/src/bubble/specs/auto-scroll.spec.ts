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
  await expect.poll(() => page.evaluate(distanceToBottom, '[data-testid="bubble-list"]')).toBeLessThanOrEqual(1)
  await page.getByTestId('bubble-list').evaluate(
    (node) =>
      new Promise<void>((resolve) => {
        let previous = node.scrollTop
        let stableFrames = 0
        const check = () => {
          const current = node.scrollTop
          stableFrames = current === previous ? stableFrames + 1 : 0
          previous = current
          if (stableFrames >= 3) resolve()
          else requestAnimationFrame(check)
        }
        requestAnimationFrame(check)
      }),
  )
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

test('BubbleList 保持公开根类和滚动容器语义', async ({ page }) => {
  const root = page.getByTestId('bubble-list')
  await expect(root).toHaveClass(/tr-bubble-list/)
  await expect(root.locator(':scope > .tr-bubble-list__content')).toHaveCount(1)
  await expect(root).toHaveCSS('overflow-y', 'auto')
  await expect(root).toHaveCSS('padding-top', '12px')
  await expect(root.locator(':scope > .tr-bubble-list__content')).toHaveCSS('padding-top', '0px')
  await expect.poll(() => root.evaluate((node) => node.clientHeight)).toBeLessThanOrEqual(220)
})

test('BubbleList 内部异步内容大幅增高时保持底部跟随', async ({ page }) => {
  await page.getByTestId('grow-bubble-content').click()
  await expect
    .poll(() =>
      page.getByTestId('bubble-list').evaluate((node) => node.scrollHeight - node.clientHeight - node.scrollTop),
    )
    .toBeLessThanOrEqual(1)
})

test('BubbleList 用户上滚后异步内容增高时保持阅读位置', async ({ page }) => {
  const root = page.getByTestId('bubble-list')
  await root.evaluate((node) => {
    node.scrollTop = node.scrollHeight - node.clientHeight - 100
    node.dispatchEvent(new Event('scroll'))
  })
  const before = await root.evaluate((node) => node.scrollTop)
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))
  await page.getByTestId('grow-bubble-content').click()
  await expect.poll(() => root.evaluate((node) => node.scrollTop)).toBe(before)
})

test('BubbleList autoScroll 可响应式关闭并恢复跟随', async ({ page }) => {
  const root = page.getByTestId('bubble-list')
  await page.getByTestId('toggle-bubble-auto-scroll').click()
  await page.getByTestId('grow-bubble-content').click()
  await expect
    .poll(() => root.evaluate((node) => node.scrollHeight - node.clientHeight - node.scrollTop))
    .toBeGreaterThan(100)
  await page.getByTestId('toggle-bubble-auto-scroll').click()
  await expect
    .poll(() => root.evaluate((node) => node.scrollHeight - node.clientHeight - node.scrollTop))
    .toBeLessThanOrEqual(1)
})
