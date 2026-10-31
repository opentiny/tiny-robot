import { expect, test } from '@playwright/experimental-ct-vue'
import ChatPausedTurn from './ChatPausedTurn.fixture.vue'

for (const mode of ['single', 'multiple'] as const) {
  test(`${mode}: paused turns without abort support do not expose a stop control`, async ({ mount }) => {
    const component = await mount(ChatPausedTurn, { props: { mode, withoutAbort: true } })
    const editor = component.locator('.ProseMirror')

    await expect(component.locator('.tr-sender-submit-button.is-loading')).toHaveCount(0)
    await editor.fill('next message')
    const submit = component.locator('.tr-sender-submit-button')
    await expect(submit).toHaveClass(/is-disabled/)
    await submit.dispatchEvent('click')
    await editor.press('Enter')
    await expect(component.getByTestId('sends')).toHaveText('0')
    await expect(component.getByTestId('request-state')).toHaveText('paused')
    await expect(editor).toHaveText('next message')
  })

  test(`${mode}: paused turns keep an enabled stop button and can send again after cancellation`, async ({ mount }) => {
    const component = await mount(ChatPausedTurn, { props: { mode } })
    const editor = component.locator('.ProseMirror')
    const stop = component.locator('.tr-sender-submit-button.is-loading')

    await expect(editor).toHaveText('')
    await expect(component.getByTestId('request-state')).toHaveText('paused')
    await expect(stop).toBeVisible()
    await expect(stop).toBeEnabled()

    await editor.fill('next message')
    await editor.press('Enter')
    await expect(component.getByTestId('sends')).toHaveText('0')
    await expect(component.getByTestId('request-state')).toHaveText('paused')
    await stop.click()

    await expect(component.getByTestId('aborts')).toHaveText('1')
    await expect(component.getByTestId('request-state')).toHaveText('aborted')
    await expect(stop).toHaveCount(0)
    await expect(editor).toHaveText('next message')
    await component.locator('.tr-sender-submit-button').click()
    await expect(component.getByTestId('sends')).toHaveText('1')
    await expect(component.getByTestId('request-state')).toHaveText('completed')
    await expect(editor).toHaveText('')
  })
}
