import { expect, test } from '@playwright/experimental-ct-vue'
import SenderCoreFixture from './fixtures/SenderCore.fixture.vue'

test.describe('Sender core public contract', () => {
  test('CORE-02 initializes from modelValue', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, { props: { modelValue: 'model text' } })

    await expect(component.getByTestId('sender-root').locator('.ProseMirror')).toHaveText('model text')
    await expect(component.getByTestId('model-value')).toHaveText('model text')
  })

  test('CORE-03 uses defaultValue only during initialization', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, { props: { defaultValue: 'initial default' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await expect(editor).toHaveText('initial default')
    await component.getByTestId('replacement-default-input').fill('changed default')
    await component.getByTestId('set-default-value').click()
    await expect(editor).toHaveText('initial default')
  })

  test('CORE-04 gives modelValue priority, including an explicit empty string', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, {
      props: { modelValue: 'model text', defaultValue: 'fallback text' },
    })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await expect(editor).toHaveText('model text')
    await component.getByTestId('external-model-input').fill('')
    await component.getByTestId('set-external-model').click()
    await expect(editor).toHaveText('')
    await expect(editor).not.toContainText('fallback text')
  })

  test('COMPACT-CORE-EMPTY mounts the empty editable Sender and blocks submission', async ({ mount }) => {
    const component = await mount(SenderCoreFixture)

    const sender = component.getByTestId('sender-root')
    await expect(sender).toBeVisible()
    await expect(sender).toHaveClass(/tr-sender--single/)
    await expect(sender.locator('.ProseMirror')).toHaveAttribute('contenteditable', 'true')
    await expect(sender.locator('.tr-sender-submit-button')).toHaveCount(0)
    await component.getByTestId('call-submit').click()
    await expect(component.getByTestId('submit-count')).toHaveText('0')
  })

  test('CORE-06 treats all-whitespace content as not submittable', async ({ mount }) => {
    const component = await mount(SenderCoreFixture)
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('   ')
    await expect(editor).toHaveText('   ')
    await expect(component.getByTestId('sender-root').locator('.tr-sender-submit-button')).toHaveCount(0)
  })

  test('CORE-07 emits input and update:modelValue with the typed value', async ({ mount }) => {
    const component = await mount(SenderCoreFixture)

    await component.getByTestId('sender-root').locator('.ProseMirror').pressSequentially('abc')
    await expect(component.getByTestId('model-value')).toHaveText('abc')
    await expect(component.getByTestId('update-count')).toHaveText('3')
    await expect(component.getByTestId('input-count')).toHaveText('3')
  })

  test('CORE-08 applies an external model update without echoing the same text', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, { props: { modelValue: 'same text' } })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('external-model-input').fill('changed text')
    await component.getByTestId('set-external-model').click()
    await expect(editor).toHaveText('changed text')
    await expect(component.getByTestId('update-count')).toHaveText('0')
    await expect(component.getByTestId('input-count')).toHaveText('0')

    await editor.click()
    await editor.press('End')
    const before = await editor.evaluate((element) => ({
      text: element.textContent,
      childCount: element.childNodes.length,
    }))
    await component.getByTestId('external-model-input').fill('changed text')
    await component.getByTestId('set-external-model').click()
    const after = await editor.evaluate((element) => ({
      text: element.textContent,
      childCount: element.childNodes.length,
    }))

    expect(after).toEqual(before)
    await expect(component.getByTestId('update-count')).toHaveText('0')
    await expect(component.getByTestId('input-count')).toHaveText('0')
  })

  test('CORE-09 submits exact plain text once and does not clear it', async ({ mount }) => {
    const component = await mount(SenderCoreFixture)
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('plain')
    await component.getByTestId('sender-root').locator('.tr-sender-submit-button').click()

    await expect(component.getByTestId('submit-count')).toHaveText('1')
    await expect(component.getByTestId('last-submit')).toHaveText('["plain",null]')
    await expect(editor).toHaveText('plain')
  })

  test('CORE-10 exposes setContent and getContent', async ({ mount }) => {
    const component = await mount(SenderCoreFixture)

    await component.getByTestId('call-set-content').click()
    await expect(component.getByTestId('sender-root').locator('.ProseMirror')).toHaveText('方法设置')
    await component.getByTestId('call-get-content').click()
    await expect(component.getByTestId('last-action')).toHaveText('getContent:方法设置')
  })

  test('CORE-11 exposes focus and blur and emits both events', async ({ mount }) => {
    const component = await mount(SenderCoreFixture)
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('call-focus').click()
    await expect(editor).toBeFocused()
    await expect(component.getByTestId('focus-count')).toHaveText('1')
    await component.getByTestId('call-blur').click()
    await expect(editor).not.toBeFocused()
    await expect(component.getByTestId('blur-count')).toHaveText('1')
  })

  test('CORE-12 uses the same validation for exposed submit and the submit button', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, {
      props: { defaultActions: { submit: { disabled: true } } },
    })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('blocked')
    await component.getByTestId('call-submit').click()
    await expect(component.getByTestId('submit-count')).toHaveText('0')
    await expect(component.getByTestId('sender-root').locator('.tr-sender-submit-button')).toHaveClass(/is-disabled/)
    await component.getByTestId('sender-root').locator('.tr-sender-submit-button').click()
    await expect(component.getByTestId('submit-count')).toHaveText('0')
    await component.getByTestId('toggle-submit-disabled').click()
    await component.getByTestId('call-submit').click()
    await expect(component.getByTestId('submit-count')).toHaveText('1')
  })

  test('CORE-13 blocks submission while disabled', async ({ mount }) => {
    const component = await mount(SenderCoreFixture)
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await editor.pressSequentially('disabled')
    await component.getByTestId('toggle-disabled').click()
    await expect(editor).toHaveText('disabled')
    await component.getByTestId('call-submit').click()
    await expect(component.getByTestId('submit-count')).toHaveText('0')
    await expect(component.getByTestId('sender-root')).toHaveClass(/is-disabled/)
  })

  test('COMPACT-CORE-CANCEL keeps loading parent-controlled for button and exposed cancel', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, { props: { modelValue: 'loading', loading: true } })
    const submitButton = component.getByTestId('sender-root').locator('.tr-sender-submit-button')

    await submitButton.click()
    await expect(component.getByTestId('submit-count')).toHaveText('0')
    await expect(component.getByTestId('cancel-count')).toHaveText('1')
    await expect(submitButton).toHaveClass(/is-loading/)
    await component.getByTestId('call-cancel').click()
    await expect(component.getByTestId('cancel-count')).toHaveText('2')
    await expect(submitButton).toHaveClass(/is-loading/)
    await expect(component.getByTestId('submit-count')).toHaveText('0')
  })

  test('CORE-15 enforces maxLength at N and N+1 without truncating, then recovers after deletion', async ({
    mount,
  }) => {
    const component = await mount(SenderCoreFixture, {
      props: { maxLength: 2, showWordLimit: true },
    })
    const sender = component.getByTestId('sender-root')
    const editor = sender.locator('.ProseMirror')
    const counter = sender.locator('.tr-sender-word-counter')

    await editor.pressSequentially('ab')
    await expect(counter).toHaveText('2/2')
    await expect(sender.locator('.tr-sender-submit-button')).not.toHaveClass(/is-disabled/)
    await editor.pressSequentially('c')
    await expect(counter).toHaveText('3/2')
    await expect(counter.locator('.is-over-limit')).toHaveText('3')
    await expect(editor).toHaveText('abc')
    await expect(sender.locator('.tr-sender-submit-button')).toHaveClass(/is-disabled/)
    await editor.press('ControlOrMeta+A')
    await editor.press('Backspace')
    await editor.pressSequentially('a')
    await expect(counter).toHaveText('1/2')
    await expect(sender.locator('.tr-sender-submit-button')).not.toHaveClass(/is-disabled/)
  })

  test('CORE-16 clears editor content, emits clear, and restores focus', async ({ mount }) => {
    const component = await mount(SenderCoreFixture, {
      props: { modelValue: 'clear me', clearable: true },
    })
    const sender = component.getByTestId('sender-root')
    const editor = sender.locator('.ProseMirror')

    await sender.locator('.tr-action-buttons-group .tr-action-button').click()
    await expect(editor).toHaveText('')
    await expect(component.getByTestId('clear-count')).toHaveText('1')
    await expect(editor).toBeFocused()
  })
})
