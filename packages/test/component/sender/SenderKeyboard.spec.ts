import { expect, test } from '@playwright/experimental-ct-vue'
import SenderCoreFixture from './fixtures/SenderCore.fixture.vue'

const expectParagraphBreak = async (
  component: { getByTestId: (testId: string) => import('@playwright/test').Locator },
  editor: import('@playwright/test').Locator,
) => {
  await expect(editor.locator('p')).toHaveCount(2)
  await expect.poll(() => component.getByTestId('model-value').textContent()).toBe('first\n\n')
}

test.describe('Sender keyboard shortcuts', () => {
  test('KEY-01 submitType enter submits on Enter', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, { props: { submitType: 'enter' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('send')
    await editor.press('Enter')
    await expect(component.getByTestId('submit-count')).toHaveText('1')
    await expect(component.getByTestId('last-submit')).toHaveText('["send",null]')
  })

  test('KEY-02 submitType enter treats Shift+Enter as a newline', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, { props: { submitType: 'enter' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('first')
    await editor.press('Shift+Enter')
    await expectParagraphBreak(component, editor)
    await expect(component.getByTestId('submit-count')).toHaveText('0')
  })

  test('KEY-03 submitType enter treats Ctrl+Enter as a newline', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, { props: { submitType: 'enter' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('first')
    await editor.press('Control+Enter')
    await expectParagraphBreak(component, editor)
    await expect(component.getByTestId('submit-count')).toHaveText('0')
  })

  test('KEY-04 submitType enter treats Meta+Enter as a newline', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, { props: { submitType: 'enter' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('first')
    await editor.press('Meta+Enter')
    await expectParagraphBreak(component, editor)
    await expect(component.getByTestId('submit-count')).toHaveText('0')
  })

  test('KEY-05 submitType ctrlEnter submits on Ctrl+Enter', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, { props: { submitType: 'ctrlEnter' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('send')
    await editor.press('Control+Enter')
    await expect(component.getByTestId('submit-count')).toHaveText('1')
  })

  test('KEY-06 submitType ctrlEnter submits on Meta+Enter', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, { props: { submitType: 'ctrlEnter' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('send')
    await editor.press('Meta+Enter')
    await expect(component.getByTestId('submit-count')).toHaveText('1')
  })

  test('KEY-07 submitType ctrlEnter inserts a newline on plain Enter', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, { props: { submitType: 'ctrlEnter' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('first')
    await editor.press('Enter')
    await expectParagraphBreak(component, editor)
    await expect(component.getByTestId('submit-count')).toHaveText('0')
  })

  test('KEY-08 submitType ctrlEnter does not submit with Shift+Enter', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, { props: { submitType: 'ctrlEnter' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('first')
    await editor.press('Shift+Enter')
    await expect(component.getByTestId('submit-count')).toHaveText('0')
  })

  test('KEY-09 submitType shiftEnter submits on Shift+Enter', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, { props: { submitType: 'shiftEnter' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('send')
    await editor.press('Shift+Enter')
    await expect(component.getByTestId('submit-count')).toHaveText('1')
  })

  test('KEY-10 submitType shiftEnter inserts a newline on plain Enter', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, { props: { submitType: 'shiftEnter' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('first')
    await editor.press('Enter')
    await expectParagraphBreak(component, editor)
    await expect(component.getByTestId('submit-count')).toHaveText('0')
  })

  test('KEY-11 submitType shiftEnter does not submit with Ctrl+Enter', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, { props: { submitType: 'shiftEnter' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('first')
    await editor.press('Control+Enter')
    await expect(component.getByTestId('submit-count')).toHaveText('0')
  })

  test('KEY-12 submitType shiftEnter does not submit with Meta+Enter', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, { props: { submitType: 'shiftEnter' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('first')
    await editor.press('Meta+Enter')
    await expect(component.getByTestId('submit-count')).toHaveText('0')
  })
})
