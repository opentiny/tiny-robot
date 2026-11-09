import { expect, test } from '@playwright/experimental-ct-vue'
import ChatToolbar from './ChatToolbar.fixture.vue'

test('orders the transformed built-ins and custom action without duplicates', async ({ mount }) => {
  const chat = await mount(ChatToolbar)
  const buttons = chat.locator('.tr-chat-toolbar').getByRole('button')
  await expect(buttons).toHaveCount(3)
  await expect(buttons.nth(0)).toHaveAccessibleName('MCP')
  await expect(buttons.nth(1)).toHaveAccessibleName('Assistant')
  await expect(buttons.nth(2)).toHaveAccessibleName('Generate UI')
})

test('keeps the custom action state when disabled and ignores clicks', async ({ mount }) => {
  const chat = await mount(ChatToolbar)
  const button = chat.getByRole('button', { name: 'Generate UI', exact: true })
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'true')
  await chat.update({ props: { itemDisabled: true } })
  await expect(button).toBeDisabled()
  await button.dispatchEvent('click')
  await expect(button).toHaveAttribute('aria-pressed', 'true')

  await chat.update({ props: { itemDisabled: false, senderDisabled: true } })
  await expect(chat.locator('.tr-chat-toolbar').locator('button:disabled')).toHaveCount(3)
  await button.dispatchEvent('click')
  await expect(button).toHaveAttribute('aria-pressed', 'true')
})

test('preserves sender footer slots when the toolbar callback returns no actions', async ({ mount }) => {
  const chat = await mount(ChatToolbar, { props: { empty: true } })
  await expect(chat.locator('.tr-chat-toolbar')).toHaveCount(0)
  await expect(chat.getByTestId('footer')).toBeVisible()
  await expect(chat.getByTestId('footer-right')).toBeVisible()
  await chat.update({ props: { empty: false } })
  await expect(chat.locator('.tr-chat-toolbar').getByRole('button')).toHaveCount(3)
})
