import { expect, test } from '@playwright/experimental-ct-vue'
import type { Locator } from '@playwright/test'
import SenderModelSyncFixture from './SenderModelSync.fixture.vue'

async function setModel(component: Locator, value: string) {
  await component.getByTestId('model').evaluate((element, text) => {
    const input = element as HTMLInputElement
    input.value = text
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }, value)
}

async function endComposition(editor: Locator, text?: string) {
  await editor.evaluate((element, value) => {
    if (value !== undefined) {
      element.querySelector('p')!.firstChild!.nodeValue = value
      const range = document.createRange()
      range.selectNodeContents(element)
      range.collapse(false)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)
    }
    element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: value ?? '' }))
    if (value !== undefined) {
      element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }))
    }
  }, text)
}

test.describe('Sender model synchronization after composition', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
    await page.clock.pauseAt(new Date('2026-01-01T00:01:00Z'))
  })

  test('preserves the final DOM input instead of restoring the stale model', async ({ mount, page }) => {
    const component = await mount(SenderModelSyncFixture)
    const editor = component.locator('.tiptap')

    await editor.focus()
    await editor.dispatchEvent('compositionstart')
    await setModel(component, 'niha')
    await endComposition(editor, '你好')
    await page.clock.runFor(30)

    await expect(editor).toHaveText('你好')
    await expect(component.getByTestId('model')).toHaveValue('你好')
  })

  test('preserves external updates when composition produces no new input', async ({ mount, page }) => {
    const component = await mount(SenderModelSyncFixture)
    const editor = component.locator('.tiptap')

    await editor.dispatchEvent('compositionstart')
    await setModel(component, 'external')
    await endComposition(editor)
    await page.clock.runFor(30)

    await expect(editor).toHaveText('external')
  })

  test('defers model changes during the pending synchronization and uses the latest value', async ({ mount, page }) => {
    const component = await mount(SenderModelSyncFixture)
    const editor = component.locator('.tiptap')

    await editor.dispatchEvent('compositionstart')
    await setModel(component, 'first')
    await endComposition(editor)
    await setModel(component, 'latest')
    await expect(editor).toHaveText('nihao')
    await page.clock.runFor(30)

    await expect(editor).toHaveText('latest')
  })

  test('cancels the previous synchronization when a new composition starts', async ({ mount, page }) => {
    const component = await mount(SenderModelSyncFixture)
    const editor = component.locator('.tiptap')

    await editor.dispatchEvent('compositionstart')
    await setModel(component, 'external')
    await endComposition(editor)
    await editor.dispatchEvent('compositionstart')
    await page.clock.runFor(30)
    await expect(editor).toHaveText('nihao')
    await endComposition(editor)
    await page.clock.runFor(30)

    await expect(editor).toHaveText('external')
  })

  test('cancels pending synchronization on unmount', async ({ mount, page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    const component = await mount(SenderModelSyncFixture)
    const editor = component.locator('.tiptap')

    await editor.dispatchEvent('compositionstart')
    await setModel(component, 'external')
    await endComposition(editor)
    await component.unmount()
    await page.clock.runFor(30)

    expect(errors).toEqual([])
  })

  test('applies ordinary external model updates without waiting for a timer', async ({ mount }) => {
    const component = await mount(SenderModelSyncFixture)

    await setModel(component, 'external')

    await expect(component.locator('.tiptap')).toHaveText('external')
  })
})
