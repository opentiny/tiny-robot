import { expect, test } from '@playwright/experimental-ct-vue'
import BubbleFixture from './Bubble.fixture.vue'

test.describe('Bubble', () => {
  test('renders presentation props and default text content', async ({ mount }) => {
    const component = await mount(BubbleFixture)
    const bubble = component.getByTestId('presentation-bubble')
    const box = bubble.locator('[data-box-type="box"]')

    await expect(bubble).toContainText('Hello bubble')
    await expect(bubble).toHaveAttribute('data-role', 'user')
    await expect(bubble).toHaveAttribute('data-placement', 'end')
    await expect(box).toHaveAttribute('data-placement', 'end')
    await expect(box).toHaveAttribute('data-shape', 'rounded')
    await expect(bubble.getByTestId('bubble-avatar')).toHaveText('U')
  })

  test('forwards messages and role to every named slot', async ({ mount }) => {
    const component = await mount(BubbleFixture)
    const bubble = component.getByTestId('presentation-bubble')

    await expect(bubble.getByTestId('bubble-prefix')).toHaveText('user:1')
    await expect(bubble.getByTestId('bubble-suffix')).toHaveText('user:1')
    await expect(bubble.getByTestId('bubble-after')).toHaveText('user:1')
    await expect(bubble.getByTestId('bubble-footer')).toHaveText('user:1:undefined')
  })

  test('renders an empty message without text and hides hidden messages', async ({ mount }) => {
    const component = await mount(BubbleFixture)

    await expect(component.getByTestId('empty-bubble').locator('[data-type="text"]')).toHaveCount(0)
    await expect(component.getByTestId('hidden-bubble')).toBeHidden()
  })

  test('splits array content into boxes and exposes each footer index', async ({ mount }) => {
    const component = await mount(BubbleFixture)
    const bubble = component.getByTestId('split-bubble')

    await expect(bubble.locator('[data-box-type="box"]')).toHaveCount(2)
    await expect(bubble.locator('[data-type="text"]')).toHaveText(['First segment', 'Second segment'])
    await expect(bubble.getByTestId('split-footer')).toHaveText(['footer-0', 'footer-1'])
  })

  test('renders content returned by contentResolver', async ({ mount }) => {
    const component = await mount(BubbleFixture)

    await expect(component.getByTestId('resolved-bubble')).toContainText('Resolved content')
    await expect(component.getByTestId('resolved-bubble')).not.toContainText('Original content')
  })

  test('prefers a Bubble-level fallback content renderer', async ({ mount }) => {
    const component = await mount(BubbleFixture)

    await expect(component.getByTestId('fallback-bubble').getByTestId('fallback-content-renderer')).toHaveText(
      'Fallback content 0',
    )
  })
})
