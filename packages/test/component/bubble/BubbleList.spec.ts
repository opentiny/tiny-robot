import { expect, test } from '@playwright/experimental-ct-vue'
import BubbleListFixture from './BubbleList.fixture.vue'

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
    await expect
      .poll(() => list.evaluate((element) => element.scrollHeight - element.scrollTop - element.clientHeight))
      .toBeLessThanOrEqual(1)

    await section.getByRole('button', { name: 'Append user message' }).click()
    await expect(list).toContainText('Latest user message')
    await expect
      .poll(() => list.evaluate((element) => element.scrollHeight - element.scrollTop - element.clientHeight))
      .toBeLessThanOrEqual(1)
  })
})
