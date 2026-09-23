import { expect, test } from '@playwright/experimental-ct-vue'
import BubbleListAutoScrollDemo from '../../../../docs/demos/bubble/list-auto-scroll.vue'

test.describe('BubbleList auto-scroll demo', () => {
  test('does not render the asynchronous region before it is triggered', async ({ mount }) => {
    const component = await mount(BubbleListAutoScrollDemo)

    await expect(component.locator('.async-content')).toHaveCount(0)
  })

  test('renders a visibly bounded 336px asynchronous region after the delay', async ({ mount }) => {
    const component = await mount(BubbleListAutoScrollDemo)
    const region = component.locator('.async-content')

    await component.getByRole('button', { name: '模拟异步增高' }).click()
    await expect(region).toBeVisible()
    await expect(region).toHaveCSS('height', '336px')
    await expect(region).toHaveCSS('border-top-style', 'dashed')
    await expect
      .poll(() => region.evaluate((element) => getComputedStyle(element).backgroundColor))
      .not.toBe('rgba(0, 0, 0, 0)')
  })
})
