import { expect, test } from '@playwright/experimental-ct-vue'
import SenderActionsFixture from './fixtures/SenderActions.fixture.vue'

function uploadButton(component: { getByTestId: (id: string) => import('@playwright/test').Locator }) {
  return component.getByTestId('child-actions').locator('.tr-action-button').nth(3)
}

function voiceButton(component: { getByTestId: (id: string) => import('@playwright/test').Locator }) {
  return component.getByTestId('child-actions').locator('.tr-action-button').nth(4)
}

test.describe('Sender action children', () => {
  test('COMPACT-CHILD-UPLOAD checks native chooser attributes then selects a file', async ({ mount, page }) => {
    const component = await mount(SenderActionsFixture)
    const chooserPromise = page.waitForEvent('filechooser')

    await uploadButton(component).click()
    const chooser = await chooserPromise
    expect(await chooser.element().getAttribute('accept')).toBe('image/*,.txt')
    expect(chooser.isMultiple()).toBe(true)
    await chooser.setFiles({ name: 'note.txt', mimeType: 'text/plain', buffer: Buffer.from('note') })
    await expect(component.getByTestId('selected-files')).toHaveText('["note.txt"]')
  })

  test('CHILD-03 reports a maxCount error for a user-selected over-limit set', async ({ mount, page }) => {
    const component = await mount(SenderActionsFixture)
    const chooserPromise = page.waitForEvent('filechooser')

    await uploadButton(component).click()
    const chooser = await chooserPromise
    await chooser.setFiles([
      { name: 'one.txt', mimeType: 'text/plain', buffer: Buffer.from('1') },
      { name: 'two.txt', mimeType: 'text/plain', buffer: Buffer.from('2') },
      { name: 'three.txt', mimeType: 'text/plain', buffer: Buffer.from('3') },
    ])
    await expect(component.getByTestId('upload-error')).toContainText('最多只能选择 2 个文件')
  })

  test('CHILD-04 reports a maxSize error for a user-selected oversized file', async ({ mount, page }) => {
    const component = await mount(SenderActionsFixture)
    const chooserPromise = page.waitForEvent('filechooser')

    await uploadButton(component).click()
    const chooser = await chooserPromise
    await chooser.setFiles({
      name: 'large.bin',
      mimeType: 'application/octet-stream',
      buffer: Buffer.alloc(1024 * 1024 + 1),
    })
    await expect(component.getByTestId('upload-error')).toContainText('large.bin')
  })

  test('CHILD-05 disables UploadButton and prevents opening the chooser', async ({ mount }) => {
    const component = await mount(SenderActionsFixture, { props: { disabled: true } })
    const button = uploadButton(component)

    await expect(button).toBeDisabled()
    await button.click({ force: true })
    await expect(component.getByTestId('file-input-click-count')).toHaveText('0')
  })

  test('CHILD-06 starts and stops a fake speech handler through real clicks', async ({ mount }) => {
    const component = await mount(SenderActionsFixture)
    const button = voiceButton(component)

    await button.click()
    await expect(component.getByTestId('voice-events')).toHaveText('["start"]')
    await button.click()
    await expect(component.getByTestId('voice-events')).toHaveText('["start","end"]')
  })

  test('CHILD-07 inserts final speech text by default and honors autoInsert=false', async ({ mount }) => {
    const component = await mount(SenderActionsFixture)
    const button = voiceButton(component)
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await button.click()
    await component.getByTestId('emit-voice-final').click()
    await expect(editor).toHaveText('语音结果 ')
    await component.getByTestId('toggle-auto-insert').click()
    await editor.press('ControlOrMeta+A')
    await editor.press('Backspace')
    await button.click()
    await component.getByTestId('emit-voice-final').click()
    await expect(editor).toHaveText('')
    await expect(component.getByTestId('voice-events')).toContainText('final:语音结果')
  })

  test('CHILD-08 honors speech interception and unload cleanup', async ({ mount }) => {
    const component = await mount(SenderActionsFixture)

    await component.getByTestId('toggle-voice-intercept').click()
    await voiceButton(component).click()
    await expect(component.getByTestId('voice-events')).toHaveText('[]')
    await component.getByTestId('toggle-voice-intercept').click()
    await voiceButton(component).click()
    await expect(component.getByTestId('voice-events')).toHaveText('["start"]')
    await component.getByTestId('toggle-voice-mounted').click()
    await expect(component.getByTestId('voice-button')).toHaveCount(0)
    await expect(component.getByTestId('voice-events')).toHaveText('["start"]')
  })
})
