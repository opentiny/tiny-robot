import { expect, test } from '@playwright/experimental-ct-vue'
import SenderMentionTemplateFixture from './SenderMentionTemplate.fixture.vue'

test('submits mention data when Template is enabled without template content', async ({ mount, page }) => {
  const component = await mount(SenderMentionTemplateFixture)
  const editor = component.locator('.tiptap')

  await editor.fill('@')
  await expect(page.locator('.mention-list')).toBeVisible()
  await page.getByRole('button', { name: '张三' }).click()
  await editor.pressSequentially('分析一下这个项目')
  await component.locator('.tr-sender-submit-button').click()

  await expect(component.getByTestId('submit-output')).toHaveText(
    JSON.stringify({
      text: '@张三分析一下这个项目',
      data: [
        { type: 'mention', content: '张三', value: 'user-123' },
        { type: 'text', content: '分析一下这个项目' },
      ],
    }),
  )
})

test('submits mention data when Template is not enabled', async ({ mount, page }) => {
  const component = await mount(SenderMentionTemplateFixture, { props: { template: false } })
  const editor = component.locator('.tiptap')

  await editor.fill('@')
  await expect(page.locator('.mention-list')).toBeVisible()
  await page.getByRole('button', { name: '张三' }).click()
  await editor.pressSequentially('分析一下这个项目')
  await component.locator('.tr-sender-submit-button').click()

  await expect(component.getByTestId('submit-output')).toHaveText(
    JSON.stringify({
      text: '@张三分析一下这个项目',
      data: [
        { type: 'mention', content: '张三', value: 'user-123' },
        { type: 'text', content: '分析一下这个项目' },
      ],
    }),
  )
})
