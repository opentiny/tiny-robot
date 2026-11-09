import { expect, test } from '@playwright/experimental-ct-vue'
import ToolEditingFixture from './ToolEditing.fixture.vue'

test.describe('Tool argument editing', () => {
  test('hides the edit action unless the tool call is editable', async ({ mount }) => {
    const component = await mount(ToolEditingFixture)
    const bubble = component.getByTestId('editing-bubble')
    const readonlyBubble = component.getByTestId('readonly-bubble')

    await expect(bubble.getByRole('button', { name: '编辑' })).toBeVisible()
    await expect(readonlyBubble.getByRole('button', { name: '编辑' })).toHaveCount(0)
  })

  test('emits edited JSON arguments without changing the message directly', async ({ mount }) => {
    const component = await mount(ToolEditingFixture)
    const bubble = component.getByTestId('editing-bubble')

    await bubble.getByRole('button', { name: '编辑' }).click()
    const editor = bubble.getByRole('textbox', { name: '工具参数' })
    await editor.fill('{"to":"ops@example.com"}')
    await bubble.getByRole('button', { name: '保存' }).click()

    await expect(component.getByTestId('last-event')).toHaveText(
      JSON.stringify({
        name: 'tool-call:edit',
        payload: {
          toolCallId: 'call-tool-edit-test',
          arguments: '{"to":"ops@example.com"}',
        },
        contentIndex: 0,
        messageIndex: 0,
      }),
    )
    await expect(bubble.getByRole('button', { name: '编辑' })).toBeVisible()
  })

  test('keeps the editor open for invalid JSON', async ({ mount }) => {
    const component = await mount(ToolEditingFixture)
    const bubble = component.getByTestId('editing-bubble')

    await bubble.getByRole('button', { name: '编辑' }).click()
    await bubble.getByRole('textbox', { name: '工具参数' }).fill('{invalid')
    await bubble.getByRole('button', { name: '保存' }).click()

    await expect(bubble.getByRole('alert')).toHaveText('请输入合法的 JSON 参数')
    await expect(component.getByTestId('last-event')).toHaveText('null')
  })

  test('preserves JSON string arguments when starting an edit', async ({ mount }) => {
    const component = await mount(ToolEditingFixture)
    const bubble = component.getByTestId('string-editing-bubble')

    await bubble.getByRole('button', { name: '编辑' }).click()
    await expect(bubble.getByRole('textbox', { name: '工具参数' })).toHaveValue('"hello"')
  })

  test('clears the edit draft when the details collapse', async ({ mount }) => {
    const component = await mount(ToolEditingFixture)
    const bubble = component.getByTestId('editing-bubble')

    await bubble.getByRole('button', { name: '编辑' }).click()
    await bubble.getByRole('textbox', { name: '工具参数' }).fill('{"to":"ops@example.com"}')
    await bubble.locator('.expand-icon').click()
    await bubble.locator('.expand-icon').click()

    await expect(bubble.getByRole('textbox', { name: '工具参数' })).toHaveCount(0)
    await expect(bubble.getByRole('button', { name: '编辑' })).toBeVisible()
  })
})
