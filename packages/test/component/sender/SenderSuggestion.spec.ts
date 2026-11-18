import { expect, test } from '@playwright/experimental-ct-vue'
import SenderExtensionsFixture from './fixtures/SenderExtensions.fixture.vue'
import SenderSuggestionFixture from './SenderSuggestion.fixture.vue'

const list = (page: import('@playwright/test').Page) => page.locator('.suggestion-list')
const items = (page: import('@playwright/test').Page) => page.locator('.suggestion-list__item')

test.describe('Sender Suggestion extension', () => {
  test('SUGGESTION-01 keeps the list closed for empty content', async ({ mount, page }) => {
    await mount(SenderExtensionsFixture, { props: { kind: 'suggestion' } })
    await expect(list(page)).toHaveCount(0)
  })

  test('SUGGESTION-02 shows all Ref items without a filter function', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'suggestion' } })
    await component.getByTestId('sender-root').locator('.ProseMirror').pressSequentially('J')

    await expect(list(page)).toBeVisible()
    await expect(items(page)).toHaveCount(6)
    await expect(items(page).first()).toContainText('Java')
    await expect(items(page).first()).toHaveClass(/highlighted/)
  })

  test('SUGGESTION-03 applies the configured filter function', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'suggestion', suggestionMode: 'filter' },
    })
    await component.getByTestId('sender-root').locator('.ProseMirror').pressSequentially('Java')

    await expect(items(page)).toHaveCount(2)
    await expect(items(page).nth(0)).toContainText('Java')
    await expect(items(page).nth(1)).toContainText('JavaScript')
  })

  test('SUGGESTION-04 refreshes the open list when its Ref items change', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'suggestion' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('J')
    await expect(items(page)).toHaveCount(6)
    await component.getByTestId('update-suggestion-ref').click()
    await expect(items(page)).toHaveCount(1)
    await expect(items(page).first()).toContainText('新建议')
  })

  test('SUGGESTION-05 selects the default highlighted item with Enter', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'suggestion' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('J')
    await editor.press('Enter')
    await expect(editor).toHaveText('Java')
    await expect(list(page)).toHaveCount(0)
  })

  test('SUGGESTION-06 selects with a configured Space key', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'suggestion', suggestionMode: 'space' },
    })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('J')
    await editor.press('Space')
    await expect(editor).toHaveText('Java')
    await expect(list(page)).toHaveCount(0)
  })

  test('SUGGESTION-07 wraps keyboard navigation at both ends', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'suggestion' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('J')
    await editor.press('ArrowUp')
    await expect(items(page).nth(5)).toHaveClass(/highlighted/)
    await editor.press('ArrowDown')
    await expect(items(page).nth(0)).toHaveClass(/highlighted/)
    for (let index = 0; index < 6; index += 1) await editor.press('ArrowDown')
    await expect(items(page).nth(0)).toHaveClass(/highlighted/)
  })

  test('SUGGESTION-08 supports mouse hover and selection', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'suggestion' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('T')
    await items(page).nth(2).hover()
    await expect(items(page).nth(2)).toHaveClass(/highlighted/)
    await items(page).nth(2).click()
    await expect(editor).toHaveText('TypeScript')
    await expect(list(page)).toHaveCount(0)
  })

  test('SUGGESTION-09 re-fills the editor with the exact Enter item content', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'suggestion' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('T')
    await editor.press('ArrowDown')
    await editor.press('ArrowDown')
    await editor.press('Enter')
    await expect(editor).toHaveText('TypeScript')
    await expect(component.getByTestId('submit-count')).toHaveText('0')
  })

  test('SUGGESTION-10 uses Tab to complete the current item', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'suggestion' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('Ja')
    await expect(list(page)).toBeVisible()
    await editor.press('Tab')
    await expect(editor).toHaveText('Java')
    await expect(list(page)).toHaveCount(0)
  })

  test('SUGGESTION-11 closes on Escape and preserves the query', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'suggestion' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('P')
    await expect(list(page)).toBeVisible()
    await editor.press('Escape')
    await expect(list(page)).toHaveCount(0)
    await expect(editor).toHaveText('P')
  })

  test('SUGGESTION-12 hides autocomplete decoration when configured off', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'suggestion', showAutoComplete: false },
    })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('Ja')
    await expect(list(page)).toBeVisible()
    await expect(editor.locator('.suggestion-autocomplete')).toHaveCount(0)
  })

  test('SUGGESTION-13 applies a legal numeric popup width', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'suggestion', popupWidth: 240 },
    })
    await component.getByTestId('sender-root').locator('.ProseMirror').pressSequentially('J')

    await expect(list(page)).toHaveCSS('width', '240px')
  })

  test('SUGGESTION-14 honors onSelect=false without replacing the query', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'suggestion', suggestionMode: 'no-fill' },
    })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('J')
    await editor.press('Enter')
    await expect(editor).toHaveText('J')
    await expect(list(page)).toHaveCount(0)
  })

  test('SUGGESTION-15A renders automatic highlights', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'suggestion', highlightMode: 'auto' } })
    await component.getByTestId('sender-root').locator('.ProseMirror').pressSequentially('J')
    await expect(page.locator('.suggestion-list__item').first().locator('.suggestion-list__text--match')).toHaveCount(1)
  })

  test('SUGGESTION-15B renders configured array highlights', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'suggestion', highlightMode: 'array' } })
    await component.getByTestId('sender-root').locator('.ProseMirror').pressSequentially('E')
    await expect(page.locator('.suggestion-list__item').first().locator('.suggestion-list__text--match')).toHaveCount(2)
    await expect(page.locator('.suggestion-list__item').nth(1).locator('.suggestion-list__text--match')).toHaveCount(1)
  })

  test('SUGGESTION-15C renders configured function highlights', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'suggestion', highlightMode: 'function' } })
    await component.getByTestId('sender-root').locator('.ProseMirror').pressSequentially('自')
    await expect(page.locator('.suggestion-list__text--match')).toHaveText('自定义')
    await expect(page.locator('.suggestion-list__text--normal')).toHaveText('高亮')
  })

  test('SUGGESTION-16 reopens after new input and closes after clearing', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'suggestion' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('J')
    await editor.press('Enter')
    await expect(list(page)).toHaveCount(0)
    await editor.press('ControlOrMeta+A')
    await editor.press('Backspace')
    await editor.pressSequentially('P')
    await expect(editor).toHaveText('P')
    await expect(list(page)).toBeVisible()
    await editor.press('ControlOrMeta+A')
    await editor.press('Backspace')
    await expect(editor).toHaveText('')
    await expect(list(page)).toHaveCount(0)
  })

  test('SUGGESTION-16A reopens after synchronous close, clear, and input transactions', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'suggestion' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('J')
    await expect(list(page)).toBeVisible()
    await component.getByTestId('run-suggestion-sync-sequence').click()

    await expect(editor).toHaveText('P')
    await expect(component.getByTestId('suggestion-sync-steps')).toHaveText(
      JSON.stringify([
        { step: 'close', text: 'Java', active: false, itemCount: 0 },
        { step: 'clear', text: '', active: false, itemCount: 0 },
        { step: 'input', text: 'P', active: true, itemCount: 6 },
      ]),
    )
    await expect(list(page)).toBeVisible()
  })
})

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
