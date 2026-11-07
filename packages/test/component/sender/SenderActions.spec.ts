import { expect, test } from '@playwright/experimental-ct-vue'
import SenderActionsFixture from './fixtures/SenderActions.fixture.vue'

test.describe('Sender action UI', () => {
  test('ACTION-02 hides Submit when editor is empty', async ({ mount }) => {
    const component = await mount(SenderActionsFixture)

    await expect(component.getByTestId('sender-root').locator('.tr-sender-submit-button')).toHaveCount(0)
  })

  test('ACTION-04 hides Clear when clearable is false', async ({ mount }) => {
    const component = await mount(SenderActionsFixture, { props: { clearable: false } })
    const sender = component.getByTestId('sender-root')

    await sender.locator('.ProseMirror').pressSequentially('content')
    await expect(sender.locator('.tr-action-buttons-group > .tr-action-button')).toHaveCount(0)
  })

  test('COMPACT-ACTION-CANCEL renders stop and cancels without submitting after loading changes', async ({ mount }) => {
    const component = await mount(SenderActionsFixture)
    const sender = component.getByTestId('sender-root')

    await sender.locator('.ProseMirror').pressSequentially('content')
    await component.getByTestId('toggle-loading').click()
    await expect(sender.locator('.tr-sender-submit-button.is-loading')).toBeVisible()
    await sender.locator('.tr-sender-submit-button.is-loading').click()
    await expect(component.getByTestId('cancel-count')).toHaveText('1')
    await expect(component.getByTestId('submit-count')).toHaveText('0')
  })

  test('ACTION-06 renders configured stopText while loading', async ({ mount }) => {
    const component = await mount(SenderActionsFixture, { props: { stopText: '停止生成' } })
    const sender = component.getByTestId('sender-root')

    await sender.locator('.ProseMirror').pressSequentially('content')
    await component.getByTestId('toggle-loading').click()
    await expect(sender.locator('.tr-sender-submit-button__cancel-text')).toHaveText('停止生成')
  })

  test('COMPACT-ACTION-SUBMIT shows Submit and Clear for typed content then submits', async ({ mount }) => {
    const component = await mount(SenderActionsFixture)
    const sender = component.getByTestId('sender-root')

    await sender.locator('.ProseMirror').pressSequentially('send')
    await expect(sender.locator('.tr-sender-submit-button')).toBeVisible()
    await expect(sender.locator('.tr-action-buttons-group > .tr-action-button')).toBeVisible()
    await sender.locator('.tr-sender-submit-button').click()
    await expect(component.getByTestId('submit-count')).toHaveText('1')
  })

  test('ACTION-09 renders tooltip content and the configured placement', async ({ mount, page }) => {
    const component = await mount(SenderActionsFixture)
    const actionButton = component.getByTestId('child-actions').locator('.tr-action-button').first()

    await actionButton.hover()
    const tooltip = page.locator('.tr-action-button-tooltip-popper')
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toContainText('动作提示')
    await expect
      .poll(async () => {
        const buttonBounds = await actionButton.boundingBox()
        const tooltipBounds = await tooltip.boundingBox()
        return !!buttonBounds && !!tooltipBounds && tooltipBounds.y >= buttonBounds.y + buttonBounds.height
      })
      .toBe(true)
  })

  test('ACTION-10 shows the word counter when enabled', async ({ mount }) => {
    const component = await mount(SenderActionsFixture, { props: { maxLength: 10, showWordLimit: true } })
    const sender = component.getByTestId('sender-root')

    await sender.locator('.ProseMirror').pressSequentially('abc')
    await expect(sender.locator('.tr-sender-word-counter')).toHaveText('3/10')
  })

  test('ACTION-11 hides the word counter when disabled', async ({ mount }) => {
    const component = await mount(SenderActionsFixture, { props: { maxLength: 10, showWordLimit: false } })

    await component.getByTestId('sender-root').locator('.ProseMirror').pressSequentially('abc')
    await expect(component.getByTestId('sender-root').locator('.tr-sender-word-counter')).toHaveCount(0)
  })

  test('ACTION-12 counts emoji and combining graphemes as user-visible characters', async ({ mount }) => {
    const component = await mount(SenderActionsFixture, { props: { maxLength: 3, showWordLimit: true } })
    const sender = component.getByTestId('sender-root')

    await sender.locator('.ProseMirror').pressSequentially('👨‍👩‍👧‍👦é')
    await expect(sender.locator('.tr-sender-word-counter')).toHaveText('2/3')
  })

  test('ACTION-13 marks over-limit content and recovers after deletion', async ({ mount }) => {
    const component = await mount(SenderActionsFixture, { props: { maxLength: 2, showWordLimit: true } })
    const sender = component.getByTestId('sender-root')
    const editor = sender.locator('.ProseMirror')

    await editor.pressSequentially('abc')
    await expect(sender.locator('.tr-sender-word-counter')).toHaveText('3/2')
    await expect(sender.locator('.tr-sender-word-counter .is-over-limit')).toHaveText('3')
    await expect(sender.locator('.tr-sender-submit-button')).toHaveClass(/is-disabled/)
    await editor.press('ControlOrMeta+A')
    await editor.press('Backspace')
    await editor.pressSequentially('a')
    await expect(sender.locator('.tr-sender-word-counter')).toHaveText('1/2')
    await expect(sender.locator('.tr-sender-submit-button')).not.toHaveClass(/is-disabled/)
  })

  test('ACTION-14 prioritizes icon slot, active state, normal/small sizes, and custom size', async ({ mount }) => {
    const component = await mount(SenderActionsFixture)
    const buttons = component.getByTestId('child-actions').locator('.tr-action-button')

    await expect(component.getByTestId('slot-icon')).toHaveCount(1)
    await expect(component.getByTestId('prop-icon')).toHaveCount(2)
    await expect(buttons.nth(0)).toHaveClass(/active/)
    await expect(buttons.nth(0)).toHaveCSS('width', '28px')
    await expect(buttons.nth(1)).toHaveCSS('width', '32px')
    await expect(buttons.nth(2)).toHaveCSS('width', '40px')
  })
})
