import { expect, test } from '@playwright/experimental-ct-vue'
import ChatBubbleActionsFixture from './ChatBubbleActions.fixture.vue'
import ChatBubbleActionsFloatingFixture from './ChatBubbleActionsFloating.fixture.vue'
import ChatMessageInfoFixture from './ChatMessageInfo.fixture.vue'
import ChatBubbleActionSlotFixture from './ChatBubbleActionSlot.fixture.vue'
import ChatMessageEditFixture from './ChatMessageEdit.fixture.vue'

for (const standalone of [true, false]) {
  test(`${standalone ? 'TrChatUI' : 'TrChat'} forwards bubble action slot context, disabled and open state`, async ({
    mount,
  }) => {
    const component = await mount(ChatBubbleActionSlotFixture, { props: { standalone, disabled: true } })
    const trigger = component.getByRole('button', { name: 'View source', exact: true })
    await expect(trigger).toBeDisabled()
    await component.update({ props: { standalone, disabled: false } })
    await trigger.click()
    await expect(component.getByRole('status')).toHaveText('Guide')
    await expect(component.locator('.tr-chat-bubble-actions')).toHaveClass(/is-open/)
    await component.getByRole('button', { name: 'Close source', exact: true }).click()
    await expect(component.getByRole('status')).toHaveCount(0)
    await expect(component.locator('.tr-chat-bubble-actions')).not.toHaveClass(/is-open/)
  })
}

test('an open slot keeps historical hover actions visible after focus and pointer leave', async ({ mount }) => {
  const component = await mount(ChatBubbleActionSlotFixture, { props: { standalone: true, historical: true } })
  const actions = component.locator('.tr-chat-bubble-actions:not(.is-latest)')
  await expect(actions).toHaveCSS('opacity', '0')
  await component.getByText('Answer', { exact: true }).hover()
  await component.getByRole('button', { name: 'View source' }).click()
  await component.getByRole('button', { name: 'Outside actions' }).click()
  await expect(actions).toHaveCSS('opacity', '1')
  await component.getByRole('button', { name: 'Close source' }).click()
  await component.getByRole('button', { name: 'Outside actions' }).click()
  await expect(actions).toHaveCSS('opacity', '0')
})

test('bubble actions are opt-in and edit cancel leaves the original message unchanged', async ({ mount }) => {
  const component = await mount(ChatBubbleActionsFixture)
  await expect(component.getByTestId('actions-hidden').locator('.tr-chat-bubble-actions')).toHaveCount(0)
  const section = component.getByTestId('user-actions')
  await expect(section.getByText('Custom display')).toHaveCount(2)
  const editButton = section.getByRole('button', { name: '编辑', exact: true })
  await expect(editButton).toHaveCount(1)
  await editButton.click()
  const editors = component.getByTestId('user-actions').getByRole('textbox', { name: '编辑消息' })
  await expect(editors).toHaveCount(1)
  const editor = editors
  await expect(section.getByText('Custom display')).toHaveCount(0)
  await expect(editor).toHaveValue('Original question')
  await editor.fill('Changed draft')
  await component.getByTestId('user-actions').getByRole('button', { name: '取消' }).click()
  await expect(component.getByTestId('original-message')).toHaveText('Original question')
  await expect(component.getByTestId('user-actions').getByRole('textbox', { name: '编辑消息' })).toHaveCount(0)
})

test('latest actions remain visible for omitted roles and assistant groups ending in a tool message', async ({
  mount,
}) => {
  const component = await mount(ChatBubbleActionsFixture)
  for (const sectionName of ['missing-role-actions', 'assistant-tool-actions']) {
    const actions = component.getByTestId(sectionName).locator('.tr-chat-bubble-actions')
    await expect(actions).toHaveCount(1)
    await expect(actions).toHaveClass(/is-latest/)
    await expect(actions.getByRole('button', { name: '复制', exact: true })).toBeVisible()
  }
})

for (const rejectEdit of [false, true]) {
  test(`Runtime ${rejectEdit ? 'rejection' : 'synchronous error'} leaves the edit draft usable`, async ({ mount }) => {
    const component = await mount(ChatMessageEditFixture, { props: { rejectEdit } })
    await component.getByRole('button', { name: '编辑', exact: true }).click()
    const editor = component.getByRole('textbox', { name: '编辑消息' })
    await editor.fill('Draft')
    const save = component.getByRole('button', { name: '保存', exact: true })
    await save.click()
    await expect(component.getByTestId('runtime-error')).toHaveText('edit-message:Error: Edit failed')
    await expect(component.getByTestId('edit')).toHaveText('u1:Draft')
    await expect(component.getByRole('button', { name: 'Accept edit' })).toHaveCount(0)
    await expect(editor).toHaveValue('Draft')
    await expect(save).toBeEnabled()
    await component.getByRole('button', { name: '取消', exact: true }).click()
    await expect(editor).toHaveCount(0)
    await expect(component.getByText('Original question')).toBeVisible()
    if (!rejectEdit) {
      await component.getByRole('button', { name: '重新生成', exact: true }).click()
      await expect(component.getByTestId('regenerate')).toHaveText('a1')
      await expect(component.getByTestId('runtime-error')).toHaveText('regenerate-message:Error: Regenerate failed')
    }
  })
}

test('controlled edit ignores IME shortcuts and a late save acknowledgment from a previous session', async ({
  mount,
}) => {
  const component = await mount(ChatMessageEditFixture, { props: { controlled: true } })
  const edit = component.getByRole('button', { name: '编辑', exact: true })
  const editor = component.getByRole('textbox', { name: '编辑消息' })
  await edit.click()
  await editor.fill('First edit')
  await editor.dispatchEvent('keydown', { key: 'Escape', isComposing: true })
  await editor.dispatchEvent('keydown', { key: 'Enter', ctrlKey: true, isComposing: true })
  await expect(editor).toHaveValue('First edit')
  await expect(component.getByTestId('edit')).toHaveText(':')
  await editor.press('Control+Enter')
  await expect(component.getByTestId('edit')).toHaveText('u1:First edit')
  await expect(editor).toBeDisabled()

  await component.update({ props: { conversationId: 'second' } })
  await expect(editor).toHaveCount(0)
  await component.update({ props: { conversationId: 'first' } })
  await edit.click()
  await editor.fill('Second edit')
  const accept = component.getByRole('button', { name: 'Accept edit' })
  await accept.click()
  await expect(editor).toHaveValue('Second edit')
  await expect(editor).toBeEnabled()
  await component.getByRole('button', { name: '保存', exact: true }).click()
  await expect(component.getByTestId('edit')).toHaveText('u1:Second edit')
  await accept.click()
  await expect(editor).toHaveCount(0)
})

test('assistant info action opens the normalized token information', async ({ mount, page }) => {
  const component = await mount(ChatBubbleActionsFixture)
  const section = component.getByTestId('actions-enabled')
  const infoButton = section.getByRole('button', { name: '对话信息', exact: true })
  await infoButton.click()
  const dialog = page.getByRole('dialog', { name: '对话信息', exact: true })
  await expect(dialog).toContainText('输入 Token')
  await expect(dialog).toContainText('7')
  await expect(dialog).toContainText('3')
  await expect(dialog).toContainText('10')
  await dialog.click()
  await expect(dialog).toBeVisible()
  await infoButton.click()
  await expect(dialog).toHaveCount(0)
  await infoButton.click()
  await expect(dialog).toBeVisible()
  await expect(dialog).toBeFocused()
  await dialog.press('Escape')
  await expect(infoButton).toBeFocused()
  await expect(dialog).toHaveCount(0)
})

test('info ignores hover and closes when clicking outside', async ({ mount, page }) => {
  const component = await mount(ChatBubbleActionsFixture)
  const section = component.getByTestId('info-only')
  const infoButton = section.getByRole('button', { name: '对话信息', exact: true })
  await infoButton.hover()
  const dialog = page.getByRole('dialog', { name: '对话信息', exact: true })
  await expect(dialog).toHaveCount(0)
  await infoButton.click()
  const outside = component.getByTestId('user-actions')
  await outside.hover()
  await expect(dialog).toBeVisible()
  await outside.click()
  await expect(dialog).toHaveCount(0)
})

test('info escapes clipping, flips above the composer and follows scrolling', async ({ mount, page }) => {
  const component = await mount(ChatBubbleActionsFloatingFixture)
  const scrollHost = component.getByTestId('usage-scroll-host')
  const trigger = component.getByRole('button', { name: '对话信息', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: '对话信息', exact: true })
  await expect(dialog).toBeVisible()
  await expect(scrollHost.getByRole('dialog')).toHaveCount(0)
  await expect(dialog).toHaveCSS('background-color', 'rgb(38, 38, 38)')
  await expect
    .poll(async () => {
      const panel = await dialog.boundingBox()
      const button = await trigger.boundingBox()
      return Math.round(button!.y - panel!.y - panel!.height)
    })
    .toBe(6)

  const initialTop = (await dialog.boundingBox())!.y
  await scrollHost.evaluate((element) => {
    element.scrollTop -= 24
  })
  await expect.poll(async () => Math.round((await dialog.boundingBox())!.y - initialTop)).toBe(24)
  await expect(dialog).toBeVisible()
  await trigger.click()
  await expect(dialog).toHaveCount(0)
})

test('info stays inside narrow boundaries and retains the local theme', async ({ mount, page }) => {
  await page.setViewportSize({ width: 280, height: 480 })
  const component = await mount(ChatBubbleActionsFloatingFixture)
  await component.getByRole('button', { name: '对话信息', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: '对话信息', exact: true })
  await expect(dialog).toBeVisible()
  const boundary = (await component.getByTestId('usage-scroll-host').boundingBox())!
  await expect
    .poll(async () => {
      const panel = (await dialog.boundingBox())!
      return panel.x >= boundary.x + 7 && panel.x + panel.width <= boundary.x + boundary.width - 7
    })
    .toBe(true)
  await component.evaluate((element) => {
    element.setAttribute('data-tr-color-mode', 'light')
  })
  await expect(dialog).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await component.getByRole('button', { name: '面板外部' }).click()
  await expect(dialog).toHaveCount(0)
})

test('default info reads response metadata and supports normalized usage from different models', async ({
  mount,
  page,
}) => {
  const component = await mount(ChatMessageInfoFixture, {
    props: {
      message: {
        role: 'assistant',
        content: 'Answer',
        metadata: {
          model: 'model-a',
          createdAt: 1794780000,
          choices: [
            { index: 1, finish_reason: 'length' },
            { index: 0, finish_reason: 'stop' },
          ],
          usage: { prompt_tokens: 0, completion_tokens: 20, total_tokens: 20 },
        },
      },
    },
  })
  const trigger = component.getByRole('button', { name: '对话信息', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: '对话信息', exact: true })
  await expect(dialog.locator('dt')).toHaveText(['模型', '结束原因', '时间', '输入 Token', '输出 Token', '总 Token'])
  await expect(dialog.locator('dd').nth(0)).toHaveText('model-a')
  await expect(dialog.locator('dd').nth(1)).toHaveText('stop')
  await expect(dialog.locator('dd').nth(2)).toContainText('2026')
  await expect(dialog.locator('dd').nth(3)).toHaveText('0')
  await component.update({
    props: {
      message: {
        role: 'assistant',
        content: 'Updated answer',
        metadata: { model: 'model-b', usage: { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120 } },
      },
    },
  })
  await expect(dialog.locator('dt')).toHaveText(['模型', '输入 Token', '输出 Token', '总 Token'])
  await expect(dialog.locator('dd')).toHaveText(['model-b', '100', '20', '120'])
  await component.update({ props: { message: { role: 'assistant', content: 'No info' } } })
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toHaveCount(0)
})

test('custom info replaces defaults, preserves zero and wraps long values', async ({ mount, page }) => {
  const requestId = 'request-' + '0123456789'.repeat(15)
  const message = {
    role: 'assistant',
    content: 'Answer',
    metadata: {
      model: 'hidden-default-model',
      usage: { total_tokens: 100 },
      requestId,
      durationMs: 2400,
    },
  }
  const component = await mount(ChatMessageInfoFixture, { props: { message, mode: 'custom' } })
  await component.getByRole('button', { name: '对话信息', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: '对话信息', exact: true })
  await expect(dialog.locator('dt')).toHaveText(['请求编号', '总耗时', '缓存命中', '占位', '会话', '分组数量'])
  await expect(dialog.locator('dd')).toHaveText([requestId, '2.40s', '0', '—', 'info-conversation', '1'])
  await expect(dialog).not.toContainText('hidden-default-model')
  const longValue = dialog.locator('dd').first()
  await expect(longValue).toHaveCSS('overflow-wrap', 'anywhere')
  expect(await longValue.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
  await expect(dialog.locator('dd').nth(1)).toHaveCSS('color', 'rgb(20, 118, 255)')
  await component.evaluate((element) => element.setAttribute('data-tr-color-mode', 'dark'))
  await expect(dialog.locator('dd').nth(1)).toHaveCSS('color', 'rgb(82, 145, 255)')
  await component.update({ props: { message: { ...message, metadata: { ...message.metadata, durationMs: 1800 } } } })
  await expect(dialog.locator('dd').nth(1)).toHaveText('1.80s')
})

test('custom info works without tokens and closes on editing or a different message', async ({ mount, page }) => {
  const message = { role: 'assistant', content: 'Answer', metadata: { requestId: 'custom-request' } }
  const component = await mount(ChatMessageInfoFixture, { props: { message, mode: 'custom' } })
  const trigger = component.getByRole('button', { name: '对话信息', exact: true })
  const dialog = page.getByRole('dialog', { name: '对话信息', exact: true })
  await trigger.click()
  await expect(dialog).toContainText('custom-request')
  await component.update({ props: { editing: true } })
  await expect(dialog).toHaveCount(0)
  await component.update({ props: { editing: false } })
  await expect(dialog).toHaveCount(0)
  await trigger.click()
  await expect(dialog).toBeVisible()
  await component.update({ props: { messageKey: 'other-message' } })
  await expect(dialog).toHaveCount(0)
})

test('hiding the info action closes its panel without reopening when restored', async ({ mount, page }) => {
  const message = { role: 'assistant', content: 'Answer', metadata: { model: 'model-a' } }
  const component = await mount(ChatMessageInfoFixture, { props: { message } })
  const trigger = component.getByRole('button', { name: '对话信息', exact: true })
  const dialog = page.getByRole('dialog', { name: '对话信息', exact: true })
  await trigger.click()
  await expect(dialog).toBeVisible()
  await component.update({ props: { hideInfo: true } })
  await expect(trigger).toHaveCount(0)
  await expect(dialog).toHaveCount(0)
  await component.update({ props: { hideInfo: false } })
  await expect(trigger).toBeVisible()
  await expect(dialog).toHaveCount(0)
})

test('empty, null and throwing custom mappings hide info without falling back to defaults', async ({ mount, page }) => {
  const message = {
    role: 'assistant',
    content: 'Answer',
    metadata: { model: 'available-default', usage: { total_tokens: 9 } },
  }
  const component = await mount(ChatMessageInfoFixture, { props: { message } })
  const trigger = component.getByRole('button', { name: '对话信息', exact: true })
  await trigger.click()
  await expect(page.getByRole('dialog', { name: '对话信息', exact: true })).toBeVisible()
  for (const mode of ['empty', 'nulls', 'throw'] as const) {
    await component.update({ props: { mode } })
    await expect(trigger).toHaveCount(0)
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(component.getByRole('button', { name: '复制', exact: true })).toBeVisible()
  }
})
