import { expect, test } from '@playwright/experimental-ct-vue'
import ChatEnhancements from './ChatEnhancements.fixture.vue'

for (const path of ['custom', 'center', 'footer'] as const) {
  for (const mode of ['single', 'multiple'] as const) {
    test(`${path}/${mode}: updates slots without replacing the editor`, async ({ mount, page }) => {
      if (path === 'footer') await page.setViewportSize({ width: 600, height: 800 })
      const component = await mount(ChatEnhancements, { props: { path, mode } })
      const editor = component.locator('.ProseMirror')
      await expect(editor).toHaveCount(1)
      await expect(component.getByTestId('extension-creates')).toHaveText('1')
      await editor.fill('draft')
      await editor.evaluate((el) => {
        el.setAttribute('data-editor-identity', 'original')
      })
      await component.getByTestId('add').click()
      await expect(component.getByTestId('tag')).toHaveText('Auto')
      if (mode === 'multiple') {
        await expect(component.getByTestId('footer-tag')).toHaveText('Auto')
        await expect(component.getByTestId('right-tag')).toHaveText('Auto')
        await expect(component.getByTestId('footer-insert')).toBeEnabled()
        await expect(component.getByTestId('footer-scope-state')).toBeEnabled()
      }
      await component.getByTestId('update').click()
      await expect(component.getByTestId('tag')).toHaveText('Updated')
      if (mode === 'multiple') {
        await expect(component.getByTestId('footer-tag')).toHaveText('Updated')
        await expect(component.getByTestId('right-tag')).toHaveText('Updated')
      }
      await component.getByTestId('visible').click()
      await expect(component.locator('.tr-sender-header')).toHaveCount(0)
      await component.getByTestId('visible').click()
      await expect(component.locator('.tr-sender-header')).toHaveCount(1)
      await component.getByTestId('add').click()
      await expect(component.locator('.tr-sender-header')).toHaveCount(0)
      await expect(component.getByTestId('footer-tag')).toHaveCount(0)
      await expect(component.getByTestId('right-tag')).toHaveCount(0)
      await expect(editor).toHaveAttribute('data-editor-identity', 'original')
      await expect(editor).toHaveText('draft')
      await expect(component.getByTestId('extension-creates')).toHaveText('1')
      await expect(component.getByTestId('extension-destroys')).toHaveText('0')
    })
  }

  for (const entry of ['ui', 'runtime'] as const) {
    test(`${entry}/${path}: public input actions preserve attachments and do not send`, async ({ mount }) => {
      const component = await mount(ChatEnhancements, { props: { entry, path } })
      await component.getByTestId('fill').click()
      await expect(component.locator('.ProseMirror')).toHaveText('host prompt')
      await component.getByTestId('clear').click()
      await expect(component.locator('.ProseMirror')).toHaveText('')
      await expect(component.getByTestId('attachment')).toBeVisible()
      await component.getByTestId('focus').click()
      await expect(component.getByTestId('focus-result')).toHaveText('true')
      await expect(component.locator('.ProseMirror')).toBeFocused()
      await expect(component.getByTestId('sends')).toHaveText('0')
    })
  }

  test(`${path}: slot updates preserve an active composition`, async ({ mount }) => {
    const component = await mount(ChatEnhancements, { props: { path } })
    const editor = component.locator('.ProseMirror')
    await editor.focus()
    await editor.dispatchEvent('compositionstart', { data: '中' })
    await component.getByTestId('add').dispatchEvent('click')
    await expect(component.getByTestId('tag')).toHaveText('Auto')
    await component.getByTestId('composition').dispatchEvent('click')
    await expect(component.getByTestId('composing')).toHaveText('true')
    await expect(editor).toBeFocused()
    await expect(component.getByTestId('extension-creates')).toHaveText('1')
    await editor.dispatchEvent('compositionend', { data: '中' })
    await expect(component.getByTestId('sends')).toHaveText('0')
  })
}

test('controlled empty state governs Header, welcome and composer placement together', async ({ mount }) => {
  const component = await mount(ChatEnhancements, { props: { path: 'custom', controlledEmpty: false } })
  await expect(component.getByTestId('empty')).toHaveText('false')
  await expect(component.getByTestId('custom-welcome')).toHaveCount(0)
  await expect(component.locator('.chat-panel-content--footer .ProseMirror')).toHaveCount(1)
  await component.update({ props: { path: 'custom', controlledEmpty: true } })
  await expect(component.getByTestId('empty')).toHaveText('true')
  await expect(component.getByTestId('custom-welcome').locator('.ProseMirror')).toHaveCount(1)
  await expect(component.locator('.chat-panel-content--footer')).toHaveCount(0)
})

test('disabled input reports unsuccessful focus', async ({ mount }) => {
  const component = await mount(ChatEnhancements, { props: { disabled: true } })
  await component.getByTestId('focus').click()
  await expect(component.getByTestId('focus-result')).toHaveText('false')
})

test('missing input reports unsuccessful focus', async ({ mount }) => {
  const component = await mount(ChatEnhancements, { props: { hideSender: true } })
  await component.getByTestId('focus').click()
  await expect(component.getByTestId('focus-result')).toHaveText('false')
})

test('hidden system messages keep the default welcome and can be overridden by an existing empty conversation', async ({
  mount,
}) => {
  const component = await mount(ChatEnhancements, { props: { path: 'custom', systemOnly: true } })
  await expect(component.getByTestId('empty')).toHaveText('true')
  await expect(component.getByTestId('custom-welcome')).toBeVisible()
  await component.update({ props: { path: 'custom', systemOnly: true, controlledEmpty: false } })
  await expect(component.getByTestId('empty')).toHaveText('false')
  await expect(component.getByTestId('custom-welcome')).toHaveCount(0)
  await expect(component.locator('.tr-bubble[data-role="system"]')).not.toBeVisible()
  await expect(component.locator('.chat-panel-content--footer .ProseMirror')).toHaveCount(1)
})

test('inherited CSS variables override layout defaults', async ({ mount }) => {
  const component = await mount(ChatEnhancements)
  await expect(component.locator('.chat-panel-content--header')).toHaveCSS('padding', '3px 5px 7px')
  await expect(component.locator('.chat-panel-content--main')).toHaveCSS('padding', '9px')
  await expect(component.locator('.chat-panel-content--footer')).toHaveCSS('padding', '11px 13px 15px')
  await expect(component.locator('.chat-panel-content--footer')).toHaveCSS('max-width', '700px')
})

test('layout.showScrollToBottom controls the built-in button and defaults to visible', async ({ mount }) => {
  const component = await mount(ChatEnhancements)
  await expect(component.locator('.chat-scroll-actions')).toHaveCount(1)
  await component.update({ props: { showScrollToBottom: false } })
  await expect(component.locator('.chat-scroll-actions')).toHaveCount(0)
})
