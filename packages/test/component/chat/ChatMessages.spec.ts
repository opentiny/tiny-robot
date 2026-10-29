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
