import { expect, test } from '@playwright/experimental-ct-vue'
import ChatMessagesFixture from './ChatMessages.fixture.vue'

test.describe('ChatMessages error renderer', () => {
  test('uses the built-in error renderer by default', async ({ mount }) => {
    const component = await mount(ChatMessagesFixture)
    const messages = component.getByTestId('default-chat-messages')

    await expect(messages.getByRole('alert')).toHaveCount(1)
    await expect(messages.getByRole('alert')).toHaveText('Chat provider failed')
  })

  test('uses a configured custom error renderer instead of the built-in renderer', async ({ mount }) => {
    const component = await mount(ChatMessagesFixture)
    const messages = component.getByTestId('custom-chat-messages')

    await expect(messages.getByTestId('custom-chat-error')).toHaveCount(1)
    await expect(messages.getByTestId('custom-chat-error')).toHaveText('Chat provider failed')
    await expect(messages.getByRole('alert')).toHaveCount(0)
  })

  test('disables the default error renderer when configured with null', async ({ mount }) => {
    const component = await mount(ChatMessagesFixture)
    const messages = component.getByTestId('disabled-chat-messages')

    await expect(messages.getByRole('alert')).toHaveCount(0)
    await expect(messages.getByTestId('custom-chat-error')).toHaveCount(0)
  })
})

test.describe('ChatMessages assistive technology contract', () => {
  test('exposes completed messages as an idle polite log', async ({ mount }) => {
    const component = await mount(ChatMessagesFixture)
    const log = component.getByTestId('default-chat-messages').locator('.chat-panel-content--main')

    await expect(log).toHaveAttribute('role', 'log')
    await expect(log).toHaveAttribute('aria-live', 'polite')
    await expect(log).toHaveAttribute('aria-relevant', 'additions text')
    await expect(log).toHaveAttribute('aria-busy', 'false')
  })

  test('marks the message log busy while a response is streaming', async ({ mount }) => {
    const component = await mount(ChatMessagesFixture)
    const log = component.getByTestId('processing-chat-messages').locator('.chat-panel-content--main')

    await expect(log).toHaveAttribute('aria-busy', 'true')
  })

  test('does not announce the welcome state as a message log', async ({ mount }) => {
    const component = await mount(ChatMessagesFixture)
    const empty = component.getByTestId('empty-chat-messages').locator('.chat-panel-content--main')

    await expect(empty).not.toHaveAttribute('role', 'log')
    await expect(empty).not.toHaveAttribute('aria-live', 'polite')
  })
})
