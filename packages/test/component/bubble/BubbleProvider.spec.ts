import { expect, test } from '@playwright/experimental-ct-vue'
import BubbleProviderFixture from './BubbleProvider.fixture.vue'

test.describe('BubbleProvider', () => {
  test('uses the lowest-priority matching content and box renderers', async ({ mount }) => {
    const component = await mount(BubbleProviderFixture)
    const provider = component.getByTestId('matched-provider')

    await expect(provider.getByTestId('test-content-renderer')).toContainText('Provider content')
    await expect(provider.getByTestId('secondary-content-renderer')).toHaveCount(0)
    await expect(provider.getByTestId('test-box-renderer')).toBeVisible()
  })

  test('merges provider and match attributes onto renderer roots', async ({ mount }) => {
    const component = await mount(BubbleProviderFixture)
    const provider = component.getByTestId('matched-provider')

    await expect(provider.getByTestId('test-box-renderer')).toHaveAttribute('data-provider-box-index', '0')
    await expect(provider.getByTestId('test-box-renderer')).toHaveAttribute('data-match-attribute', 'box-priority')
    await expect(provider.getByTestId('test-content-renderer')).toHaveAttribute('data-provider-content-index', '0')
    await expect(provider.getByTestId('test-content-renderer')).toHaveAttribute(
      'data-match-attribute',
      'content-priority',
    )
  })

  test('provides store data and preserves the outer store across nested providers', async ({ mount }) => {
    const component = await mount(BubbleProviderFixture)

    await expect(component.getByTestId('matched-provider').getByTestId('test-content-renderer')).toHaveAttribute(
      'data-store-label',
      'provider-store',
    )
    await expect(component.getByTestId('nested-provider').getByTestId('test-content-renderer')).toHaveAttribute(
      'data-store-label',
      'outer-store',
    )
  })

  test('uses provider fallbacks while preserving Bubble-level fallback precedence', async ({ mount }) => {
    const component = await mount(BubbleProviderFixture)
    const provider = component.getByTestId('provider-fallbacks')

    await expect(provider.getByTestId('fallback-box-renderer')).toHaveCount(2)
    await expect(provider.getByTestId('secondary-content-renderer')).toHaveCount(1)
    await expect(provider.getByTestId('prop-fallback-bubble').getByTestId('fallback-content-renderer')).toBeVisible()
  })

  test('renders contentResolver output in custom content renderers', async ({ mount }) => {
    const component = await mount(BubbleProviderFixture)

    await expect(component.getByTestId('resolved-provider').getByTestId('test-content-renderer')).toContainText(
      'Resolved provider content',
    )
  })

  test('maps renderer state and custom events to Bubble payload indexes', async ({ mount }) => {
    const component = await mount(BubbleProviderFixture)
    const provider = component.getByTestId('matched-provider')

    await provider.getByRole('button', { name: 'Update bubble state' }).click()
    await expect(provider.getByTestId('state-output')).toHaveText(
      JSON.stringify({ key: 'expanded', value: true, contentIndex: 0, messageIndex: 0 }),
    )

    await provider.getByRole('button', { name: 'Retry bubble' }).click()
    await expect(provider.getByTestId('event-output')).toHaveText(
      JSON.stringify({ name: 'retry', payload: { source: 'renderer' }, contentIndex: 0, messageIndex: 0 }),
    )
  })
})
