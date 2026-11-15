import { expect, test } from '@playwright/experimental-ct-vue'
import SenderWhitespace from './SenderWhitespace.fixture.vue'

test('native Sender preserves exact whitespace for initial, controlled, and method drafts', async ({ mount }) => {
  const component = await mount(SenderWhitespace)
  const editor = component.locator('.tr-sender-editor')
  await expect.poll(() => editor.textContent()).toBe('Initial  draft  spaces')
  await component.getByTestId('external').click()
  await expect.poll(() => editor.textContent()).toBe('External  draft  spaces')
  await component.getByTestId('method').click()
  await expect.poll(() => editor.textContent()).toBe('Method  draft  spaces')
  await expect.poll(() => component.getByTestId('accepted').textContent()).toBe('Method  draft  spaces')
})

test('native Sender applies deferred model updates after composition without collapsing spaces', async ({ mount }) => {
  const component = await mount(SenderWhitespace)
  const editor = component.locator('.tr-sender-editor')
  await editor.focus()
  await editor.dispatchEvent('compositionstart', { data: '中' })
  await component.getByTestId('external').dispatchEvent('click')
  await expect.poll(() => editor.textContent()).toBe('Initial  draft  spaces')
  await editor.dispatchEvent('compositionend', { data: '中' })
  await expect.poll(() => editor.textContent()).toBe('External  draft  spaces')
})

test('native Sender keeps inline HTML parsing consistent across initialization, model, and method updates', async ({
  mount,
}) => {
  const component = await mount(SenderWhitespace, { props: { initial: '<b>hello</b>' } })
  const editor = component.locator('.tr-sender-editor')
  await expect.poll(() => editor.textContent()).toBe('hello')
  await component.getByTestId('inline-external').click()
  await expect.poll(() => editor.textContent()).toBe('world')
  await component.getByTestId('inline-method').click()
  await expect.poll(() => editor.textContent()).toBe('hello world')
})
