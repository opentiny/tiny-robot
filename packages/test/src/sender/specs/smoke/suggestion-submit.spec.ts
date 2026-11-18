import { test } from '@playwright/test'
import { createSenderTestHelper } from '../../helpers'
import { createSuggestionHelper } from '../../helpers/suggestion-helper'

test('smoke suggestion completion submits the exact final text', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Sender 组件')
  const helper = createSenderTestHelper(page)
  const suggestion = createSuggestionHelper(page)

  await helper.toggleSuggestion()
  await helper.typeContent('Ja')
  await suggestion.expectSuggestionListVisible(true)
  await suggestion.pressTab()
  await helper.clickSubmit()
  await helper.expectResultExact('提交内容: Java')
})
