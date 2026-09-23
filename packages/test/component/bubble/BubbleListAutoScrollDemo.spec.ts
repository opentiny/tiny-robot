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

  test('keeps the region hidden while loading, then mounts a compact image card at once', async ({ mount }) => {
    const component = await mount(BubbleListAutoScrollDemo)
    const region = component.locator('.async-content')
    const button = component.getByRole('button', { name: '模拟图片异步加载' })

    await button.click()
    await expect(component.getByRole('button', { name: '图片加载中…' })).toBeDisabled()
    await expect(region).toHaveCount(0)
    await expect(region).toBeVisible()
    await expect(region.getByRole('img', { name: '从月球地平线上升起的地球' })).toBeVisible()
    await expect(region).toContainText('Earthrise · Apollo 8')

    const sizes = await component.locator('.scroll-container').evaluate((container) => {
      const content = container.querySelector<HTMLElement>('.async-content')!
      return { contentHeight: content.offsetHeight, containerHeight: container.clientHeight }
    })

    expect(sizes.contentHeight).toBeGreaterThan(100)
    expect(sizes.contentHeight).toBeLessThan(sizes.containerHeight)
  })

  test('keeps the asynchronous image attached to its source message', async ({ mount }) => {
    const component = await mount(BubbleListAutoScrollDemo)
    const sourceBubble = component.locator('.tr-bubble').filter({
      hasText: '当然，这是 Apollo 8 拍摄的 Earthrise：',
    })

    await component.getByRole('button', { name: '模拟图片异步加载' }).click()
    await component.getByRole('button', { name: '添加消息' }).click()
    const laterBubble = component.locator('.tr-bubble').filter({ hasText: '第 3 条消息' })

    await expect(laterBubble).toBeVisible()
    await expect(sourceBubble.locator('.async-content')).toBeVisible()
    await expect(laterBubble.locator('.async-content')).toHaveCount(0)
  })
})
