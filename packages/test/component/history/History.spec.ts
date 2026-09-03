import { expect, test } from '@playwright/experimental-ct-vue'
import type { Locator } from '@playwright/test'
import HistoryFixture from './History.fixture.vue'

const openRenameEditor = async (history: Locator, title: string) => {
  const trigger = history.getByRole('button', { name: `${title} 更多操作` })
  await trigger.focus()
  await trigger.press('ArrowDown')
  await history.getByRole('menuitem', { name: '重命名' }).click()
  return history.getByRole('textbox')
}

test.describe('History', () => {
  test('renders empty, flat, and grouped data with selection', async ({ mount }) => {
    const component = await mount(HistoryFixture)
    const flat = component.getByTestId('flat-history')
    const grouped = component.getByTestId('grouped-history')

    await expect(component.getByTestId('empty-history')).toContainText('暂无内容')
    await expect(flat.locator('.tr-history__item')).toHaveCount(2)
    await expect(flat.locator('.tr-history__item.selected')).toContainText('Second chat')
    await expect(grouped.locator('.tr-history__group-title')).toHaveText(['Today', 'Earlier'])
    await expect(grouped.locator('.tr-history__item')).toHaveCount(2)
  })

  test('passes the complete item to prefix and title slots', async ({ mount }) => {
    const component = await mount(HistoryFixture)

    await expect(component.getByTestId('prefix-chat-1')).toHaveText('work')
    await expect(component.getByTestId('title-chat-1')).toHaveText('First chat custom')
    await expect(component.getByTestId('prefix-chat-2')).toHaveText('personal')
  })

  test('emits the clicked item and custom menu action', async ({ mount }) => {
    const component = await mount(HistoryFixture)
    const flat = component.getByTestId('flat-history')

    await flat.getByTestId('title-chat-1').click()
    await expect(flat.getByTestId('item-click-output')).toHaveText(
      JSON.stringify({ id: 'chat-1', title: 'First chat', kind: 'work' }),
    )

    const secondMenuTrigger = flat.getByRole('button', { name: 'Second chat 更多操作' })
    await secondMenuTrigger.focus()
    await secondMenuTrigger.press('ArrowDown')
    await flat.getByRole('menuitem', { name: '归档' }).click()
    await expect(flat.getByTestId('item-action-output')).toHaveText(
      JSON.stringify({
        action: { id: 'archive', text: '归档' },
        item: { id: 'chat-2', title: 'Second chat', kind: 'personal' },
      }),
    )
    await expect(flat.getByTestId('item-action-identity')).toHaveText('same')
  })

  test('focuses and selects the title when rename starts, then confirms with Enter', async ({ mount }) => {
    const component = await mount(HistoryFixture)
    const history = component.getByTestId('confirm-history')
    const editor = await openRenameEditor(history, 'First chat')

    await expect(editor).toBeFocused()
    await expect(editor).toHaveJSProperty('selectionStart', 0)
    await expect(editor).toHaveJSProperty('selectionEnd', 'First chat'.length)

    await editor.fill('Renamed chat')
    await editor.press('Enter')
    await expect(history.getByTestId('confirm-output')).toHaveText(
      JSON.stringify({
        newTitle: 'Renamed chat',
        item: { id: 'chat-1', title: 'First chat', kind: 'work' },
      }),
    )
    await expect(history.getByTestId('confirm-identity')).toHaveText('same')
    await expect(editor).toHaveCount(0)
  })

  test('opens and operates the action menu from the keyboard', async ({ mount }) => {
    const component = await mount(HistoryFixture)
    const history = component.getByTestId('flat-history')
    const trigger = history.getByRole('button', { name: 'First chat 更多操作' })

    await trigger.focus()
    await trigger.press('ArrowDown')
    await expect(history.getByRole('menuitem', { name: '重命名' })).toBeFocused()
    await history.getByRole('menuitem', { name: '重命名' }).press('ArrowDown')
    await expect(history.getByRole('menuitem', { name: '归档' })).toBeFocused()
    await history.getByRole('menuitem', { name: '归档' }).press('Enter')

    await expect(history.getByTestId('item-action-output')).toContainText('archive')
    await expect(trigger).toBeFocused()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await trigger.press('ArrowDown')
    await history.getByRole('menuitem', { name: '重命名' }).press('Escape')
    await expect(trigger).toBeFocused()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('cancels rename with Escape without emitting a title change', async ({ mount }) => {
    const component = await mount(HistoryFixture)
    const history = component.getByTestId('cancel-history')
    const editor = await openRenameEditor(history, 'First chat')

    await editor.fill('Discarded title')
    await editor.press('Escape')
    await expect(editor).toHaveCount(0)
    await expect(history.getByTestId('cancel-output')).toBeEmpty()
  })

  test('supports explicit rename confirmation and cancellation controls', async ({ mount }) => {
    const component = await mount(HistoryFixture)
    const history = component.getByTestId('confirm-history')
    let editor = await openRenameEditor(history, 'Second chat')

    await editor.fill('Confirmed by button')
    await history.getByRole('button', { name: '确认重命名' }).click()
    await expect(history.getByTestId('confirm-output')).toContainText('Confirmed by button')

    editor = await openRenameEditor(history, 'Second chat')
    await editor.fill('Cancelled by button')
    await history.getByRole('button', { name: '取消重命名' }).click()
    await expect(editor).toHaveCount(0)
    await expect(history.getByTestId('confirm-output')).not.toContainText('Cancelled by button')
  })

  test('confirms rename when clicking outside the editor', async ({ mount }) => {
    const component = await mount(HistoryFixture)
    const confirmHistory = component.getByTestId('confirm-history')
    const confirmEditor = await openRenameEditor(confirmHistory, 'First chat')

    await confirmEditor.fill('Confirmed outside')
    await component.getByTestId('outside-confirm').click()
    await expect(confirmHistory.getByTestId('confirm-output')).toContainText('Confirmed outside')
  })

  test('cancels rename when configured to cancel on outside clicks', async ({ mount }) => {
    const component = await mount(HistoryFixture)

    const cancelHistory = component.getByTestId('cancel-history')
    const cancelEditor = await openRenameEditor(cancelHistory, 'First chat')

    await cancelEditor.fill('Cancelled outside')
    await component.getByTestId('outside-cancel').click()
    await expect(cancelEditor).toHaveCount(0)
    await expect(cancelHistory.getByTestId('cancel-output')).toBeEmpty()
  })

  test('leaves rename open when outside clicks are disabled', async ({ mount }) => {
    const component = await mount(HistoryFixture)

    const noneHistory = component.getByTestId('none-history')
    const noneEditor = await openRenameEditor(noneHistory, 'First chat')

    await expect(noneEditor).toBeVisible()
    await noneEditor.fill('Still editing')
    await component.getByTestId('outside-none').click()
    await expect(noneEditor).toHaveValue('Still editing')
    await expect(noneHistory.getByTestId('none-output')).toBeEmpty()
  })
})
