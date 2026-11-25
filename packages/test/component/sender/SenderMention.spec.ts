import { expect, test } from '@playwright/experimental-ct-vue'
import SenderExtensionsFixture from './fixtures/SenderExtensions.fixture.vue'

const list = (page: import('@playwright/test').Page) => page.locator('.mention-list')
const items = (page: import('@playwright/test').Page) => page.locator('.mention-list .mention-item')

test.describe('Sender Mention extension', () => {
  test('MENTION-03 supports a configured trigger character', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'mention', mentionChar: '#' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('#')
    await expect(list(page)).toBeVisible()
    await expect(items(page)).toHaveCount(4)
    await editor.press('Escape')
    await editor.pressSequentially('@')
    await expect(list(page)).toHaveCount(0)
    await expect(editor).toHaveText('#@')
  })

  test('COMPACT-MENTION-PREFIX ignores ordinary text and opens after its following trigger', async ({
    mount,
    page,
  }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'mention' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('Hello ')
    await expect(list(page)).toHaveCount(0)
    await editor.pressSequentially('@')
    await expect(list(page)).toBeVisible()
  })

  test('COMPACT-MENTION-TRIGGER opens the default Ref items and closes after deleting the trigger', async ({
    mount,
    page,
  }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'mention' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('@')
    await expect(list(page)).toBeVisible()
    await expect(items(page)).toHaveCount(4)
    await expect(items(page).first()).toHaveText('小小画家')
    await expect(editor).toContainText('@')
    await editor.press('Backspace')
    await expect(list(page)).toHaveCount(0)
  })

  test('MENTION-08 filters by item value', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'mention' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('@analytics')
    await expect(items(page)).toHaveCount(1)
    await expect(items(page).first()).toHaveText('数据分析')
  })

  test('MENTION-09 does not keep a query containing spaces by default', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'mention', allowSpaces: false } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('@小小 ')
    await expect(list(page)).toHaveCount(0)
  })

  test('MENTION-10 allows spaces when configured', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'mention', allowSpaces: true, mentionItemsWithSpaces: true },
    })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('@小小 画')
    await expect(list(page)).toBeVisible()
    await expect(items(page)).toHaveCount(1)
    await expect(items(page).first()).toHaveText('小小 画家')
  })

  test('MENTION-11 closes when filtering produces no items', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'mention' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('@不存在')
    await expect(list(page)).toHaveCount(0)
  })

  test('MENTION-12 navigates with ArrowUp and ArrowDown without wrapping', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'mention' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('@')
    await expect(items(page).nth(0)).toHaveClass(/is-selected/)
    await editor.press('ArrowDown')
    await expect(items(page).nth(1)).toHaveClass(/is-selected/)
    await editor.press('ArrowUp')
    await expect(items(page).nth(0)).toHaveClass(/is-selected/)
    await editor.press('ArrowUp')
    await expect(items(page).nth(0)).toHaveClass(/is-selected/)
    await editor.press('ArrowDown')
    await editor.press('ArrowDown')
    await editor.press('ArrowDown')
    await editor.press('ArrowDown')
    await expect(items(page).nth(3)).toHaveClass(/is-selected/)
  })

  test('MENTION-13 supports mouse hover followed by mouse selection', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'mention' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('@')
    await items(page).nth(2).hover()
    await expect(items(page).nth(2)).toHaveClass(/is-selected/)
    await items(page).nth(2).click()
    await expect(component.getByTestId('sender-root').locator('.mention')).toHaveText('@文案大师')
    await editor.pressSequentially(' 后续')
    await expect(editor).toHaveText('@文案大师 后续')
    await expect(list(page)).toHaveCount(0)
    await expect(component.getByTestId('submit-count')).toHaveText('0')
  })

  test('MENTION-15 selects with Tab without submitting the Sender', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'mention' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('@')
    await editor.press('Tab')
    await expect(component.getByTestId('sender-root').locator('.mention')).toHaveText('@小小画家')
    await expect(component.getByTestId('submit-count')).toHaveText('0')
  })

  test('COMPACT-MENTION-FILTER filters by label and closes on Escape without changing query', async ({
    mount,
    page,
  }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'mention' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('@画')
    await expect(list(page)).toBeVisible()
    await expect(items(page)).toHaveCount(1)
    await expect(items(page).first()).toHaveText('小小画家')
    await editor.press('Escape')
    await expect(list(page)).toHaveCount(0)
    await expect(editor).toHaveText('@画')
  })

  test('COMPACT-MENTION-ATOM selects with Enter without submission then restores trigger by Backspace', async ({
    mount,
    page,
  }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'mention' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')
    const mention = component.getByTestId('sender-root').locator('.mention')

    await editor.pressSequentially('@')
    await editor.press('Enter')
    await expect(mention).toHaveCount(1)
    await expect(mention).toHaveText('@小小画家')
    await expect(component.getByTestId('submit-count')).toHaveText('0')
    await component.getByTestId('select-mention-end').click()
    await expect(component.getByTestId('selection-state')).toHaveText('empty|paragraph|mention|text')
    await editor.press('Backspace')
    await expect(mention).toHaveCount(0)
    await expect(editor).toHaveText('@')
    await expect(list(page)).toBeVisible()
  })

  test('MENTION-18 submits mixed text and mention structured data in order', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, { props: { kind: 'mention' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('前文 ')
    await editor.pressSequentially('@')
    await items(page).nth(1).click()
    await editor.pressSequentially(' 后文')
    await component.getByTestId('sender-root').locator('.tr-sender-submit-button').click()

    await expect(component.getByTestId('last-submit')).toHaveText(
      '["前文 @代码助手 后文",[{"type":"text","content":"前文 "},{"type":"mention","content":"代码助手","value":"coder-value"},{"type":"text","content":" 后文"}]]',
    )
  })
})
