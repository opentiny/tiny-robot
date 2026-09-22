import { expect, test } from '@playwright/experimental-ct-vue'
import type { Locator } from '@playwright/test'
import BubbleListFixture from './BubbleList.fixture.vue'

const distanceToBottom = (scroller: Locator) =>
  scroller.evaluate((element) => element.scrollHeight - element.clientHeight - element.scrollTop)

const expectAtBottom = async (scroller: Locator) => {
  await expect.poll(() => distanceToBottom(scroller)).toBeLessThanOrEqual(1)
}

const waitForStableScroll = (scroller: Locator) =>
  scroller.evaluate(
    (element) =>
      new Promise<void>((resolve) => {
        let previous = element.scrollTop
        let stableFrames = 0
        const check = () => {
          const current = element.scrollTop
          stableFrames = current === previous ? stableFrames + 1 : 0
          previous = current
          if (stableFrames >= 3) resolve()
          else requestAnimationFrame(check)
        }
        requestAnimationFrame(check)
      }),
  )

test.describe('BubbleList', () => {
  test('groups messages by the default divider strategy', async ({ mount }) => {
    const component = await mount(BubbleListFixture)
    const list = component.getByTestId('divider-list')

    await expect(list.getByTestId('list-prefix')).toHaveText([
      'user:0:1',
      'assistant:1,2:2',
      'user:3:1',
      'assistant:4:1',
    ])
    await expect(list.locator('.tr-bubble')).toHaveCount(4)
  })

  test('forwards every named slot with original message indexes', async ({ mount }) => {
    const component = await mount(BubbleListFixture)
    const list = component.getByTestId('divider-list')

    await expect(list.getByTestId('list-suffix')).toHaveText(['user:0', 'assistant:1,2', 'user:3', 'assistant:4'])
    await expect(list.getByTestId('list-after')).toHaveCount(4)
    await expect(list.getByTestId('list-footer')).toHaveText([
      'user:0:undefined',
      'assistant:1,2:undefined',
      'user:3:undefined',
      'assistant:4:undefined',
    ])
  })

  test('groups consecutive roles while isolating adjacent hidden roles', async ({ mount }) => {
    const component = await mount(BubbleListFixture)
    const list = component.getByTestId('consecutive-list')

    await expect(list.getByTestId('consecutive-group')).toHaveText(['assistant:0,1', 'secret:2,3', 'user:4'])
    await expect(list.locator('.tr-bubble')).toHaveCount(3)
    await expect(list.locator('.tr-bubble').nth(1)).toBeHidden()
  })

  test('uses fallbackRole configuration and the list contentResolver', async ({ mount }) => {
    const component = await mount(BubbleListFixture)
    const bubble = component.getByTestId('fallback-list').locator('.tr-bubble')

    await expect(bubble).toHaveAttribute('data-placement', 'end')
    await expect(bubble.locator('[data-box-type="box"]')).toHaveAttribute('data-shape', 'rounded')
    await expect(bubble).toContainText('Resolved fallback')
  })

  test('preserves non-contiguous custom indexes and maps state events globally', async ({ mount }) => {
    const component = await mount(BubbleListFixture)
    const list = component.getByTestId('custom-list')

    await expect(list.getByTestId('custom-indexes')).toHaveText('2,0')
    await expect(list.getByTestId('test-content-renderer')).toHaveCount(2)

    await list.getByRole('button', { name: 'Update bubble state' }).first().click()
    await expect(list.getByTestId('list-state-output')).toHaveText(
      JSON.stringify({ key: 'expanded', value: true, contentIndex: 0, messageIndex: 2 }),
    )
  })

  test('maps custom bubble events back to the original message index', async ({ mount }) => {
    const component = await mount(BubbleListFixture)
    const list = component.getByTestId('custom-list')

    await list.getByRole('button', { name: 'Retry bubble' }).nth(1).click()
    await expect(list.getByTestId('list-event-output')).toHaveText(
      JSON.stringify({ name: 'retry', payload: { source: 'renderer' }, contentIndex: 0, messageIndex: 0 }),
    )
  })

  test('exposes scrollToBottom and auto-scrolls a newly appended user message', async ({ mount }) => {
    const component = await mount(BubbleListFixture)
    const section = component.getByTestId('scroll-section')
    const list = section.getByTestId('scroll-list')

    await list.evaluate((element) => {
      element.scrollTop = 0
    })
    await section.getByRole('button', { name: 'Scroll to bottom' }).click()
    await expectAtBottom(list)

    await section.getByRole('button', { name: 'Append user message' }).click()
    await expect(list).toContainText('Latest user message')
    await expectAtBottom(list)
  })

  test('keeps the public root as the padded scroll container', async ({ mount }) => {
    const component = await mount(BubbleListFixture)
    const list = component.getByTestId('scroll-list')

    await expect(list).toHaveClass(/tr-bubble-list/)
    await expect(list.locator(':scope > .tr-bubble-list__content')).toHaveCount(1)
    await expect(list).toHaveCSS('overflow-y', 'auto')
    await expect(list).toHaveCSS('padding-top', '12px')
    await expect(list.locator(':scope > .tr-bubble-list__content')).toHaveCSS('padding-top', '0px')
    await expect.poll(() => list.evaluate((element) => element.clientHeight)).toBeLessThanOrEqual(220)
  })

  test('follows large asynchronously rendered content growth', async ({ mount }) => {
    const component = await mount(BubbleListFixture)
    const section = component.getByTestId('scroll-section')
    const list = section.getByTestId('scroll-list')

    await expectAtBottom(list)
    await section.getByRole('button', { name: 'Grow rendered content' }).click()
    await expectAtBottom(list)
  })

  test('preserves the reading position when rendered content grows after an upward scroll', async ({ mount }) => {
    const component = await mount(BubbleListFixture)
    const section = component.getByTestId('scroll-section')
    const list = section.getByTestId('scroll-list')

    await expectAtBottom(list)
    await waitForStableScroll(list)
    await list.evaluate((element) => {
      element.scrollTop = element.scrollHeight - element.clientHeight - 100
      element.dispatchEvent(new Event('scroll'))
    })
    await list.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))
    const before = await list.evaluate((element) => element.scrollTop)

    await section.getByRole('button', { name: 'Grow rendered content' }).click()
    await expect.poll(() => list.evaluate((element) => element.scrollTop)).toBe(before)
  })

  test('reactively disables and restores following', async ({ mount }) => {
    const component = await mount(BubbleListFixture)
    const section = component.getByTestId('scroll-section')
    const list = section.getByTestId('scroll-list')

    await expectAtBottom(list)
    await section.getByRole('button', { name: 'Toggle BubbleList auto scroll' }).click()
    await section.getByRole('button', { name: 'Grow rendered content' }).click()
    await expect.poll(() => distanceToBottom(list)).toBeGreaterThan(100)
    await section.getByRole('button', { name: 'Toggle BubbleList auto scroll' }).click()
    await expectAtBottom(list)
  })
})
