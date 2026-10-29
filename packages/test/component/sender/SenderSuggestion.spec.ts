import { expect, test } from '@playwright/experimental-ct-vue'
import SenderSuggestionFixture from './SenderSuggestion.fixture.vue'

test.describe('Sender Suggestion reserved Tab behavior', () => {
  for (const activeSuggestionKeys of [undefined, ['Tab'], []]) {
    test(`Tab applies autocomplete with keys ${JSON.stringify(activeSuggestionKeys)}`, async ({ mount, page }) => {
      const component = await mount(SenderSuggestionFixture, { props: { activeSuggestionKeys } })
      const editor = component.locator('.tiptap')

      await editor.fill('EC')
      await expect(page.locator('.suggestion-list')).toBeVisible()
      await expect(editor.locator('.autocomplete-text')).toHaveText('S')
      await editor.press('Tab')

      await expect(component.getByTestId('content')).toHaveText('ECS')
      await expect(component.getByTestId('selection-count')).toHaveText('1')
      await expect(page.locator('.suggestion-list')).not.toBeVisible()
      await expect(editor).toBeFocused()
    })
  }

  for (const query of ['ECS', 'CDN']) {
    test(`Tab does not select without autocomplete for ${query}`, async ({ mount, page }) => {
      const component = await mount(SenderSuggestionFixture, { props: { activeSuggestionKeys: ['Tab'] } })
      const editor = component.locator('.tiptap')

      await editor.fill(query)
      await expect(page.locator('.suggestion-list')).toBeVisible()
      await expect(editor.locator('.autocomplete-text')).toHaveCount(0)
      await editor.press('Tab')

      await expect(component.getByTestId('next-focus')).toBeFocused()
      await expect(component.getByTestId('selection-count')).toHaveText('0')
      await expect(component.getByTestId('content')).toHaveText(query)
      await expect(page.locator('.suggestion-list')).toBeVisible()
    })
  }

  for (const key of ['Enter', 'Space']) {
    test(`${key} still selects when configured alongside Tab`, async ({ mount, page }) => {
      const component = await mount(SenderSuggestionFixture, { props: { activeSuggestionKeys: ['Tab', 'Enter', ' '] } })
      const editor = component.locator('.tiptap')

      await editor.fill('CDN')
      await expect(page.locator('.suggestion-list')).toBeVisible()
      await editor.press(key)

      await expect(component.getByTestId('content')).toHaveText('ECS')
      await expect(component.getByTestId('selection-count')).toHaveText('1')
      await expect(page.locator('.suggestion-list')).not.toBeVisible()
    })
  }

  test('Tab moves focus normally when suggestions are inactive', async ({ mount, page }) => {
    const component = await mount(SenderSuggestionFixture, { props: { activeSuggestionKeys: ['Tab'] } })
    const editor = component.locator('.tiptap')

    await editor.focus()
    await expect(page.locator('.suggestion-list')).not.toBeVisible()
    await editor.press('Tab')

    await expect(component.getByTestId('next-focus')).toBeFocused()
    await expect(component.getByTestId('selection-count')).toHaveText('0')
    await expect(component.getByTestId('content')).toBeEmpty()
  })
})
