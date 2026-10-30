import { expect, test } from '@playwright/experimental-ct-vue'
import ChatBubbleRenderersFixture from './ChatBubbleRenderers.fixture.vue'

test.describe('native Chat bubble renderers', () => {
  test('uses built-in renderer ids and DOM matches with normalized content context', async ({ mount }) => {
    const component = await mount(ChatBubbleRenderersFixture)

    const markdown = component.locator('[data-type="markdown"]').filter({ hasText: 'Built-in Markdown' })
    await expect(markdown).toHaveCount(1)
    await expect(markdown.locator('strong')).toHaveText('Rendered safely.')
    await expect(component.locator('[data-type="tool-call"]')).toContainText('lookup_release')
    await expect(component.getByTestId('dom-status-renderer')).toHaveText('Deployment|1|ready')
    await expect(component.getByTestId('dom-status-renderer')).toHaveAttribute('data-match', 'status-card')
    await expect(component.getByTestId('dom-status-box')).toHaveAttribute('data-placement', 'start')
    await expect(component.getByTestId('dom-status-box')).toHaveAttribute('data-shape', 'corner')
    await expect(component.getByTestId('dom-status-box').getByTestId('dom-status-renderer')).toBeVisible()
    await expect(component.getByText('Plain unmatched text', { exact: true })).toBeVisible()
    await expect(component.getByTestId('vue-status-renderer')).toHaveCount(0)
  })

  test('aborts active DOM renderers before replacement and applies the new match array', async ({ mount }) => {
    const component = await mount(ChatBubbleRenderersFixture)
    await expect(component.getByTestId('dom-status-renderer')).toBeVisible()

    await component.getByTestId('replace-matches').click()

    await expect(component.getByTestId('replacement-status-renderer')).toHaveText('ready|1')
    await expect(component.getByTestId('dom-status-renderer')).toHaveCount(0)
    await expect
      .poll(async () => Number(await component.getByTestId('bubble-renderer-aborts').textContent()))
      .toBeGreaterThan(0)
  })

  test('aborts and rerenders DOM matches when streamed message content changes', async ({ mount }) => {
    const component = await mount(ChatBubbleRenderersFixture)
    await expect(component.getByTestId('dom-status-renderer')).toHaveText('Deployment|1|ready')

    const abortsBeforeUpdate = Number(await component.getByTestId('bubble-renderer-aborts').textContent())
    await component.getByTestId('update-message').click()

    await expect(component.getByTestId('dom-status-renderer')).toHaveText('Deployment|1|streaming')
    await expect
      .poll(async () => Number(await component.getByTestId('bubble-renderer-aborts').textContent()))
      .toBeGreaterThan(abortsBeforeUpdate)
  })

  test('reports an unknown built-in id and recovers after renderer replacement', async ({ mount }) => {
    const component = await mount(ChatBubbleRenderersFixture)

    await component.getByTestId('unknown-renderer').click()
    await expect(component.getByTestId('bubble-renderer-error')).toContainText('unknown-renderer')
    await expect(component.getByText('Plain unmatched text', { exact: true })).toBeVisible()

    await component.getByTestId('recover-renderers').click()
    await expect(component.getByTestId('dom-status-renderer')).toHaveText('Deployment|1|ready')
  })

  test('contains a throwing find rule and remains recoverable', async ({ mount }) => {
    const component = await mount(ChatBubbleRenderersFixture)

    await component.getByTestId('throwing-match').click()
    await expect(component.getByTestId('bubble-renderer-error')).toHaveText('bubble match failed')
    await expect(component.getByText('Plain unmatched text', { exact: true })).toBeVisible()

    await component.getByTestId('recover-renderers').click()
    await expect(component.getByTestId('dom-status-renderer')).toHaveText('Deployment|1|ready')
  })
})
