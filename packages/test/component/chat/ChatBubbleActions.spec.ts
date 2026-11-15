import { expect, test } from '@playwright/experimental-ct-vue'
import ChatBubbleActionsFixture from './ChatBubbleActions.fixture.vue'

test('bubble actions are opt-in and edit cancel leaves the original message unchanged', async ({ mount }) => {
  const component = await mount(ChatBubbleActionsFixture)
  const editButton = component.getByTestId('user-actions').locator('button').filter({ hasText: '编辑' })
  await expect(editButton).toHaveCount(1)
  await editButton.click()
  const editor = component.getByTestId('user-actions').getByRole('textbox', { name: '编辑消息' })
  await expect(editor).toHaveValue('Original question')
  await editor.fill('Changed draft')
  await component.getByTestId('user-actions').getByRole('button', { name: '取消' }).click()
  await expect(component.getByTestId('original-message')).toHaveText('Original question')
  await expect(component.getByTestId('user-actions').getByRole('textbox', { name: '编辑消息' })).toHaveCount(0)
})

test('assistant usage action opens the normalized usage panel', async ({ mount }) => {
  const component = await mount(ChatBubbleActionsFixture)
  const section = component.getByTestId('actions-enabled')
  await section.locator('button').filter({ hasText: '用量' }).click()
  const dialog = section.getByRole('dialog', { name: '本次模型请求用量' })
  await expect(dialog).toContainText('输入 Token')
  await expect(dialog).toContainText('7')
  await expect(dialog).toContainText('3')
  await expect(dialog).toContainText('10')
})

test('usage trigger opens its panel on hover when configured', async ({ mount }) => {
  const component = await mount(ChatBubbleActionsFixture)
  const section = component.getByTestId('hover-usage')
  await section.locator('.tr-chat-bubble-actions').hover()
  const dialog = section.getByRole('dialog', { name: '本次模型请求用量' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('10')
})
