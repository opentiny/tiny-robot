import { expect, test } from '@playwright/test'
import { createSenderTestHelper } from '../../helpers'
import { createTemplateTestHelper } from '../../helpers/template-helper'

test('smoke mixed template editing, selection, deletion, and submit', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Sender 组件')
  const helper = createSenderTestHelper(page)
  const template = createTemplateTestHelper(page)

  await helper.toggleTemplate()
  await template.setMixedTemplate()
  await template.focusTemplateEnd(0)
  await template.pressBackspace()
  await page.keyboard.type('改')
  await expect(template.getTemplateContent(0)).toHaveText('原改')
  await template.openTemplateSelect()
  await page.locator(template.selectors.templateSelectOption).first().click()
  await helper.clickSubmit()

  const detail = await helper.getSubmitDetail()
  expect(detail).toEqual({
    argsLength: 2,
    textContent: '前缀 原改 中间 gpt-4 后缀',
    structuredData: [
      { type: 'text', content: '前缀 ' },
      { type: 'block', content: '原改' },
      { type: 'text', content: ' 中间 ' },
      { type: 'select', content: 'gpt-4' },
      { type: 'text', content: ' 后缀' },
    ],
    extra: null,
  })
})
