import { expect, test } from '@playwright/experimental-ct-vue'
import SenderEditorFixture from './fixtures/SenderEditor.fixture.vue'

async function dispatchPaste(editor: import('@playwright/test').Locator, text?: string, html?: string) {
  await editor.evaluate(
    (element, data) => {
      const transfer = new DataTransfer()
      if (data.text !== undefined) transfer.setData('text/plain', data.text)
      if (data.html !== undefined) transfer.setData('text/html', data.html)
      element.dispatchEvent(
        new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: transfer,
        }),
      )
    },
    { text, html },
  )
}

test.describe('Sender editor behavior', () => {
  test('EDITOR-01 initializes and updates placeholder text', async ({ mount }) => {
    const component = await mount(SenderEditorFixture, { props: { placeholder: '初始占位' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await expect(editor.locator('p.is-editor-empty')).toHaveAttribute('data-placeholder', '初始占位')
    await component.getByTestId('placeholder-input').fill('动态占位')
    await expect(editor.locator('p.is-editor-empty')).toHaveAttribute('data-placeholder', '动态占位')
  })

  test('EDITOR-02 autofocus focuses the real editor', async ({ mount }) => {
    const component = await mount(SenderEditorFixture, { props: { autofocus: true } })

    await expect(component.getByTestId('sender-root').locator('.ProseMirror')).toBeFocused()
  })

  test('EDITOR-03 applies enterkeyhint to the editor DOM', async ({ mount }) => {
    const component = await mount(SenderEditorFixture, { props: { enterkeyhint: 'search' } })

    await expect(component.getByTestId('sender-root').locator('.ProseMirror')).toHaveAttribute('enterkeyhint', 'search')
  })

  test('EDITOR-04 converts pasted line breaks to spaces in single mode', async ({ mount }) => {
    const component = await mount(SenderEditorFixture, { props: { mode: 'single' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.click()
    await dispatchPaste(editor, 'first\nsecond')
    await expect(editor).toHaveText('first second')
    await expect(component.getByTestId('model-value')).toHaveText('first second')
  })

  test('EDITOR-05 preserves pasted line breaks in multiple mode', async ({ mount }) => {
    const component = await mount(SenderEditorFixture, { props: { mode: 'multiple' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.click()
    await dispatchPaste(editor, 'first\r\nsecond')
    await expect(component.getByTestId('model-value')).toHaveText('first\nsecond')
  })

  test('EDITOR-06 prefers clipboard text/plain when HTML is also present', async ({ mount }) => {
    const component = await mount(SenderEditorFixture)
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.click()
    await dispatchPaste(editor, 'plain text', '<strong>rich text</strong>')
    await expect(editor).toHaveText('plain text')
    await expect(editor).not.toContainText('rich text')
  })

  test('EDITOR-07 replaces a legal text selection through keyboard input', async ({ mount }) => {
    const component = await mount(SenderEditorFixture)
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('before')
    await editor.press('ControlOrMeta+A')
    await editor.pressSequentially('after')
    await expect(editor).toHaveText('after')
  })

  test('EDITOR-08 leaves content unchanged for an empty clipboard', async ({ mount }) => {
    const component = await mount(SenderEditorFixture)
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('unchanged')
    await dispatchPaste(editor)
    await expect(editor).toHaveText('unchanged')
  })

  test('COMPACT-EDITOR-HISTORY undoes a real edit then restores it with redo', async ({ mount }) => {
    const component = await mount(SenderEditorFixture)
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('redo me')
    await editor.press('ControlOrMeta+Z')
    await expect(editor).toHaveText('')
    await editor.press('ControlOrMeta+Shift+Z')
    await expect(editor).toHaveText('redo me')
  })

  test('EDITOR-11 keeps the editor usable after rapid input, deletion, and re-entry', async ({ mount }) => {
    const component = await mount(SenderEditorFixture)
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('快速输入测试')
    await editor.press('ControlOrMeta+A')
    await editor.press('Backspace')
    await editor.pressSequentially('再次输入')
    await expect(editor).toHaveText('再次输入')
  })
})
