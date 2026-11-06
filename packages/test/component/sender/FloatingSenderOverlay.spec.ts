import { expect, test } from '@playwright/experimental-ct-vue'
import FloatingSenderOverlayFixture from './FloatingSenderOverlay.fixture.vue'

test.describe('Sender popups in floating Layout', () => {
  for (const type of ['mention', 'suggestion'] as const) {
    test(`${type} popup mounts in the floating overlay host and remains interactive`, async ({ mount, page }) => {
      await mount(FloatingSenderOverlayFixture, { props: { type } })
      const editor = page.locator('.tiptap')
      const surface = page.locator('[data-tr-layout-mode="floating"]')
      const host = surface.locator('[data-tr-floating-overlay-host]')
      const popup = page.locator(type === 'mention' ? '.mention-list' : '.suggestion-list')

      await editor.fill(type === 'mention' ? '@' : 'E')
      await expect(popup).toBeVisible()
      await expect
        .poll(() => popup.evaluate((element) => element.parentElement?.hasAttribute('data-tr-floating-overlay-host')))
        .toBe(true)
      await expect(popup).toHaveCSS('pointer-events', 'auto')
      await expect(host).toHaveCSS('pointer-events', 'none')

      await popup.locator(type === 'mention' ? '.mention-item' : '.suggestion-list__item').click()
      await expect(popup).toHaveCount(0)
      await expect(editor).toContainText(type === 'mention' ? 'Alice' : 'ECS')
    })
  }

  test('moves an open popup when Layout switches between normal and floating modes', async ({ mount, page }) => {
    const component = await mount(FloatingSenderOverlayFixture, { props: { type: 'suggestion', mode: 'normal' } })
    const editor = page.locator('.tiptap')
    const popup = page.locator('.suggestion-list')

    await editor.fill('E')
    await expect(popup).toBeVisible()
    await expect.poll(() => popup.evaluate((element) => element.parentElement === document.body)).toBe(true)

    await component.getByTestId('toggle-mode').click()
    await expect
      .poll(() => popup.evaluate((element) => element.parentElement?.hasAttribute('data-tr-floating-overlay-host')))
      .toBe(true)

    await component.getByTestId('toggle-mode').click()
    await expect.poll(() => popup.evaluate((element) => element.parentElement === document.body)).toBe(true)
  })

  test('tracks an outer Layout mode change through a nested normal Layout', async ({ mount, page }) => {
    const component = await mount(FloatingSenderOverlayFixture, { props: { type: 'suggestion', nested: true } })
    const editor = page.locator('.tiptap')
    const popup = page.locator('.suggestion-list')

    await editor.fill('E')
    await expect(popup).toBeVisible()
    await expect
      .poll(() => popup.evaluate((element) => element.parentElement?.hasAttribute('data-tr-floating-overlay-host')))
      .toBe(true)

    await component.getByTestId('toggle-mode').click()
    await expect.poll(() => popup.evaluate((element) => element.parentElement === document.body)).toBe(true)

    await component.getByTestId('toggle-mode').click()
    await expect
      .poll(() => popup.evaluate((element) => element.parentElement?.hasAttribute('data-tr-floating-overlay-host')))
      .toBe(true)
  })
})
