import { expect, test } from '@playwright/experimental-ct-vue'
import ChatPausedTurn from './ChatPausedTurn.fixture.vue'

for (const mode of ['single', 'multiple'] as const) {
  test(`${mode}: paused turns show the normal placeholder while stop remains available`, async ({ mount }) => {
    const component = await mount(ChatPausedTurn, { props: { mode } })

    await expect(component.locator('.ProseMirror p')).toHaveAttribute('data-placeholder', '请输入你的问题...')
    await expect(component.locator('.tr-sender-submit-button.is-loading')).toBeVisible()
    if (mode === 'multiple') await expect(component.locator('.tr-sender-placeholder')).toHaveText('请输入你的问题...')
  })

  test(`${mode}: repeated clicks do not restart pending abort cleanup`, async ({ mount }) => {
    const component = await mount(ChatPausedTurn, { props: { mode, delayedAbort: true } })
    const editor = component.locator('.ProseMirror')
    const stop = component.locator('.tr-sender-submit-button.is-loading')

    await editor.fill('keep draft')
    await stop.click()
    await expect(component.getByTestId('aborts')).toHaveText('1')
    await expect(component.getByTestId('request-state')).toHaveText('paused')
    await stop.click()
    await stop.click()
    await expect(component.getByTestId('aborts')).toHaveText('1')
    await component.getByTestId('finish-abort').click()
    await expect(component.getByTestId('request-state')).toHaveText('aborted')
    await expect(stop).toHaveCount(0)
    await expect(editor).toHaveText('keep draft')
    await component.locator('.tr-sender-submit-button').click()
    await expect(component.getByTestId('sends')).toHaveText('1')
  })

  test(`${mode}: placeholders follow request state and preserve custom and standalone behavior`, async ({ mount }) => {
    const component = await mount(ChatPausedTurn, { props: { mode, standalone: true, requestState: 'processing' } })
    const placeholder = component.locator('.ProseMirror p')
    await expect(placeholder).toHaveAttribute('data-placeholder', '思考中...')

    for (const requestState of ['paused', 'completed', 'aborted', 'error'] as const) {
      await component.update({ props: { mode, standalone: true, requestState } })
      await expect(placeholder).toHaveAttribute('data-placeholder', '请输入你的问题...')
    }
    await component.update({ props: { mode, standalone: true, omitRequest: true } })
    await expect(placeholder).toHaveAttribute('data-placeholder', '思考中...')
    await component.update({
      props: { mode, standalone: true, omitRequest: false, requestState: 'processing', placeholder: 'Custom prompt' },
    })
    await expect(placeholder).toHaveAttribute('data-placeholder', 'Custom prompt')
    await component.update({ props: { mode, standalone: false, placeholder: 'Custom prompt' } })
    await expect(placeholder).toHaveAttribute('data-placeholder', 'Custom prompt')
  })

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
