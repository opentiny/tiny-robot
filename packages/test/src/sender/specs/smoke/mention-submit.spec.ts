import { expect, test } from '@playwright/test'
import { createMentionHelper } from '../../helpers/mention-helper'
import { createSenderTestHelper } from '../../helpers'

test('smoke mention selection submits text and structured data', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Sender 组件')
  const helper = createSenderTestHelper(page)
  const mention = createMentionHelper(page)

  await helper.toggleMention()
  await helper.typeContent('页面 ')
  await mention.typeAtSymbol()
  await mention.clickItem(1)
  await page.keyboard.type(' 后续')
  await helper.clickSubmit()

  const detail = await helper.getSubmitDetail()
  expect(detail).toEqual({
    argsLength: 2,
    textContent: '页面 @代码助手\u00a0后续',
    structuredData: [
      { type: 'text', content: '页面 ' },
      {
        type: 'mention',
        content: '代码助手',
        value: '你是一个专业的编码助手，精通多种编程语言和框架。',
      },
      { type: 'text', content: '\u00a0后续' },
    ],
    extra: null,
  })
})
