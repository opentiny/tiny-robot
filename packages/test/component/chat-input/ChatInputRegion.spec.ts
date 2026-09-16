import { expect, test } from '@playwright/experimental-ct-vue'
import ChatInputRegionFixture from './ChatInputRegion.fixture.vue'

test.describe('Chat input region', () => {
  test('renders one footer Composer in footer mode', async ({ mount }) => {
    const component = await mount(ChatInputRegionFixture)

    await expect(component.locator('.chat-footer')).toHaveCount(1)
    await expect(component.locator('.chat-footer .tr-sender')).toHaveCount(1)
    await expect(component.locator('.chat-footer .tr-sender-editor')).toHaveCount(1)
  })

  test('renders one centered Composer and no footer Composer in center mode', async ({ mount }) => {
    const component = await mount(ChatInputRegionFixture)

    await component.getByTestId('center-mode').click()

    await expect(component.locator('.chat-footer')).toHaveCount(1)
    await expect(component.locator('.chat-welcome-composer.chat-footer')).toHaveCount(1)
    await expect(component.locator('.chat-footer .tr-sender')).toHaveCount(1)
  })

  test('uses footer Composer when messages exist', async ({ mount }) => {
    const component = await mount(ChatInputRegionFixture)

    await component.getByTestId('center-mode').click()
    await component.getByTestId('toggle-messages').click()

    await expect(component.locator('.chat-footer')).toHaveCount(1)
    await expect(component.locator('.chat-welcome-composer')).toHaveCount(0)
    await expect(component.locator('.chat-footer .tr-sender-editor')).toHaveCount(1)
  })

  test('keeps the footer shell when layout-footer replaces the default Sender', async ({ mount }) => {
    const component = await mount(ChatInputRegionFixture)

    await component.getByTestId('toggle-custom-footer').click()

    await expect(component.locator('.chat-footer')).toHaveCount(1)
    await expect(component.getByTestId('custom-layout-footer')).toBeVisible()
    await expect(component.locator('.chat-footer .tr-sender')).toHaveCount(0)
    await expect(component.getByTestId('composer-before')).toHaveCount(1)
  })

  test('keeps sender slot order and Model controls inside TrSender footer', async ({ mount }) => {
    const component = await mount(ChatInputRegionFixture)
    const footer = component.locator('.tr-sender-footer')

    await expect(component.getByTestId('sender-header')).toBeVisible()
    await expect(footer.locator('.tr-chat-model-features')).toHaveCount(1)
    await expect(footer.locator('.tr-chat-model-selector')).toHaveCount(1)
    await expect(footer.locator('.tr-chat-mcp-selector')).toHaveCount(1)
    await expect(footer.getByTestId('sender-footer')).toBeVisible()
    await expect(component.getByTestId('sender-footer-right')).toBeVisible()
  })

  test('updates input and emits submit once', async ({ mount }) => {
    const component = await mount(ChatInputRegionFixture)
    const editor = component.locator('.tr-sender-editor')

    await editor.fill('hello')
    await expect(component.getByTestId('update-count')).toHaveText('1')
    await component.locator('.tr-sender-submit-button').click()

    await expect(component.getByTestId('submit-count')).toHaveText('1')
    await expect(component.getByTestId('last-submitted-text')).toHaveText('hello')
  })

  test('emits clear and cancel once', async ({ mount }) => {
    const component = await mount(ChatInputRegionFixture)
    const editor = component.locator('.tr-sender-editor')

    await editor.fill('hello')
    await component.locator('.tr-action-buttons-group .tr-action-button').click()
    await expect(component.getByTestId('clear-count')).toHaveText('1')

    await component.getByTestId('toggle-loading').click()
    await component.locator('.tr-sender-submit-button.is-loading').click()
    await expect(component.getByTestId('cancel-count')).toHaveText('1')
  })

  test('uses custom and loading placeholders', async ({ mount }) => {
    const component = await mount(ChatInputRegionFixture)
    const editor = component.locator('.tr-sender-editor')

    await expect(editor.locator('p.is-editor-empty')).toHaveAttribute('data-placeholder', '请输入你的问题...')
    await component.getByTestId('toggle-placeholder').click()
    await expect(editor.locator('p.is-editor-empty')).toHaveAttribute('data-placeholder', 'Custom placeholder')
    await component.getByTestId('toggle-placeholder').click()
    await component.getByTestId('toggle-loading').click()
    await expect(editor.locator('p.is-editor-empty')).toHaveAttribute('data-placeholder', '思考中...')
  })

  test('emits Model feature changes once', async ({ mount }) => {
    const component = await mount(ChatInputRegionFixture)

    await component.getByRole('button', { name: '深度思考' }).click()

    await expect(component.getByTestId('model-feature-change-count')).toHaveText('1')
  })
})
