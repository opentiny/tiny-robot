import { expect, test } from '@playwright/experimental-ct-vue'
import ChatSenderFixture from './ChatSender.fixture.vue'

test.describe('ChatSender compatibility surface', () => {
  test('keeps Model/MCP controls in TrSender footer and emits MCP open once', async ({ mount }) => {
    const component = await mount(ChatSenderFixture)
    const footer = component.locator('.tr-sender-footer')

    await expect(footer.locator('.tr-chat-model-features')).toHaveCount(1)
    await expect(footer.locator('.tr-chat-mcp-selector')).toHaveCount(1)
    await expect(footer.getByTestId('direct-sender-footer')).toBeVisible()

    await footer.locator('.tr-chat-mcp-selector__button').click()
    await expect(component.getByTestId('mcp-open-count')).toHaveText('1')
  })
})
