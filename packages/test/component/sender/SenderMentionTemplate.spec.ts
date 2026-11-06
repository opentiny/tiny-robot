import { expect, test } from '@playwright/experimental-ct-vue'
import SenderMentionTemplateFixture from './SenderMentionTemplate.fixture.vue'

test('submits mention data when Template is enabled without template content', async ({ mount, page }) => {
  const component = await mount(SenderMentionTemplateFixture, { props: { template: true } })
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

test('does not count the mention label against maxLength when Template is disabled', async ({ mount, page }) => {
  const component = await mount(SenderMentionTemplateFixture, { props: { template: false, maxLength: 4 } })
  const editor = component.locator('.tiptap')

  await editor.fill('@')
  await expect(page.locator('.mention-list')).toBeVisible()
  await page.getByRole('button', { name: '张三' }).click()
  await editor.pressSequentially('abc')

  await expect(component.locator('.tr-sender-word-counter')).toHaveText('3/4')
  await component.locator('.tr-sender-submit-button').click()

  await expect(component.getByTestId('submit-output')).toHaveText(
    JSON.stringify({
      text: '@张三abc',
      data: [
        { type: 'mention', content: '张三', value: 'user-123' },
        { type: 'text', content: 'abc' },
      ],
    }),
  )
})

test('allows Mention submission at the single-line text limit', async ({ mount, page }) => {
  const component = await mount(SenderMentionTemplateFixture, {
    props: { template: false, maxLength: 3, mode: 'single' },
  })
  const editor = component.locator('.tiptap')

  await editor.fill('@')
  await expect(page.locator('.mention-list')).toBeVisible()
  await page.getByRole('button', { name: '张三' }).click()
  await editor.pressSequentially('abc')
  await component.locator('.tr-sender-submit-button').click()

  await expect(component.getByTestId('submit-output')).toHaveText(
    JSON.stringify({
      text: '@张三abc',
      data: [
        { type: 'mention', content: '张三', value: 'user-123' },
        { type: 'text', content: 'abc' },
      ],
    }),
  )
})

test('allows Mention submission at the multi-line text limit', async ({ mount, page }) => {
  const component = await mount(SenderMentionTemplateFixture, {
    props: { template: false, maxLength: 4, mode: 'multiple' },
  })
  const editor = component.locator('.tiptap')

  await editor.fill('@')
  await expect(page.locator('.mention-list')).toBeVisible()
  await page.getByRole('button', { name: '张三' }).click()
  await editor.pressSequentially('abc')
  await component.locator('.tr-sender-submit-button').click()

  await expect(component.getByTestId('submit-output')).toHaveText(
    JSON.stringify({
      text: '@张三 abc',
      data: [
        { type: 'mention', content: '张三', value: 'user-123' },
        { type: 'text', content: ' abc' },
      ],
    }),
  )
})

test('submits nonempty Template and Mention data in document order', async ({ mount }) => {
  const component = await mount(SenderMentionTemplateFixture, {
    props: {
      template: true,
      defaultValue:
        '<p><span data-mention data-id="user-1" data-label="张三" data-value="user-123">@张三</span>分析一下<span data-template data-id="template-1" data-content="背景资料">背景资料</span></p>',
    },
  })
  await component.locator('.tr-sender-submit-button').click()

  await expect(component.getByTestId('submit-output')).toHaveText(
    JSON.stringify({
      text: '@张三分析一下背景资料',
      data: [
        { type: 'mention', content: '张三', value: 'user-123' },
        { type: 'text', content: '分析一下' },
        { type: 'block', content: '背景资料' },
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
