import { expect, test } from '@playwright/experimental-ct-vue'
import BubbleListAutoScrollDemo from '../../../../docs/demos/bubble/list-auto-scroll.vue'

const earthriseImage = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1900" height="1200">
    <rect width="1900" height="1200" fill="#111827" />
  </svg>
`

test.describe('BubbleList auto-scroll demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://assets.science.nasa.gov/**', async (route) => {
      await route.fulfill({ body: earthriseImage, contentType: 'image/svg+xml' })
    })
  })

  test('does not render the asynchronous region before it is triggered', async ({ mount }) => {
    const component = await mount(BubbleListAutoScrollDemo)

    await expect(component.locator('.async-content')).toHaveCount(0)
  })

  test('shows the loading region for 500ms, then mounts a compact image card at once', async ({ mount, page }) => {
    await page.clock.install()
    const component = await mount(BubbleListAutoScrollDemo)
    const region = component.locator('.async-content')
    const button = component.getByRole('button', { name: '模拟图片异步加载' })
    const list = component.locator('.tr-bubble-list')
    const initialScrollHeight = await list.evaluate((element) => element.scrollHeight)

    await button.click()
    await expect(component.getByRole('button', { name: '图片加载中…' })).toBeDisabled()
    await expect(region).toBeVisible()
    await expect(region).toContainText('图片加载中…')
    await expect(region.getByRole('img')).toHaveCount(0)

    await page.clock.fastForward(400)
    await expect(region).toContainText('图片加载中…')
    await expect(region.getByRole('img')).toHaveCount(0)

    await page.clock.fastForward(100)
    await expect(region.getByRole('img', { name: '从月球地平线上升起的地球' })).toBeVisible()
    await expect(region).toContainText('Earthrise · Apollo 8')

    const sizes = await component.locator('.scroll-container').evaluate((container) => {
      const content = container.querySelector<HTMLElement>('.async-content')!
      return { contentHeight: content.offsetHeight, containerHeight: container.clientHeight }
    })

    expect(sizes.contentHeight).toBeGreaterThan(100)
    expect(sizes.contentHeight).toBeLessThan(sizes.containerHeight)
    await expect.poll(() => list.evaluate((element) => element.scrollHeight)).toBeGreaterThan(initialScrollHeight)
    await expect.poll(() => list.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true)
    await expect
      .poll(() => list.evaluate((element) => element.scrollHeight - element.clientHeight - element.scrollTop))
      .toBeLessThanOrEqual(1)
  })

  test('creates one asynchronous region per source message', async ({ mount, page }) => {
    await page.clock.install()
    const component = await mount(BubbleListAutoScrollDemo)
    const sourceBubble = component.locator('.tr-bubble').filter({
      hasText: '当然，这是 Apollo 8 拍摄的 Earthrise：',
    })
    const loadButton = component.getByRole('button', { name: '模拟图片异步加载' })

    await loadButton.click()
    await page.clock.fastForward(500)
    await expect(sourceBubble.getByRole('img', { name: '从月球地平线上升起的地球' })).toBeVisible()

    await component.getByRole('button', { name: '添加消息' }).click()
    const laterBubble = component.locator('.tr-bubble').filter({ hasText: '第 3 条消息' })
    await loadButton.click()

    await expect(laterBubble).toBeVisible()
    await expect(laterBubble.locator('.async-content')).toContainText('图片加载中…')
    await expect(component.locator('.async-content')).toHaveCount(2)
    await expect(sourceBubble.getByRole('img', { name: '从月球地平线上升起的地球' })).toBeVisible()

    await page.clock.fastForward(500)
    await expect(laterBubble.getByRole('img', { name: '从月球地平线上升起的地球' })).toBeVisible()
  })

  test('replays asynchronous loading for the current source message', async ({ mount, page }) => {
    await page.clock.install()
    const component = await mount(BubbleListAutoScrollDemo)
    const region = component.locator('.async-content')
    const loadButton = component.getByRole('button', { name: '模拟图片异步加载' })

    await loadButton.click()
    await page.clock.fastForward(500)
    await expect(region.getByRole('img', { name: '从月球地平线上升起的地球' })).toBeVisible()

    await loadButton.click()
    await expect(region).toHaveCount(1)
    await expect(region).toContainText('图片加载中…')
    await expect(region.getByRole('img')).toHaveCount(0)

    await page.clock.fastForward(500)
    await expect(region.getByRole('img', { name: '从月球地平线上升起的地球' })).toBeVisible()
  })

  test('aligns a loaded user asynchronous region to the end', async ({ mount, page }) => {
    await page.clock.install()
    const component = await mount(BubbleListAutoScrollDemo)

    await component.getByRole('button', { name: '添加消息' }).click()
    const userBubble = component.locator('.tr-bubble').filter({ hasText: '第 3 条消息' })
    await component.getByRole('button', { name: '模拟图片异步加载' }).click()
    await page.clock.fastForward(500)
    await expect(userBubble.getByRole('img', { name: '从月球地平线上升起的地球' })).toBeVisible()

    const alignment = await userBubble.evaluate((bubble) => {
      const after = bubble.querySelector<HTMLElement>('.tr-bubble__after')!.getBoundingClientRect()
      const region = bubble.querySelector<HTMLElement>('.async-content')!.getBoundingClientRect()
      return { afterRight: after.right, regionRight: region.right }
    })

    expect(Math.abs(alignment.afterRight - alignment.regionRight)).toBeLessThanOrEqual(1)
  })
})
