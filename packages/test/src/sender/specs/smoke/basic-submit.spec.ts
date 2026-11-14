import { test } from '@playwright/test'
import { createSenderTestHelper } from '../../helpers'

test('smoke basic submit and parent-controlled loading cancel', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Sender 组件')
  const helper = createSenderTestHelper(page)

  await helper.typeContent('页面提交')
  await helper.clickSubmit()
  await helper.expectResultExact('提交内容: 页面提交')

  await helper.toggleLoading()
  await helper.expectLoadingButtonVisible(true)
  await page.locator(helper.selectors.loadingButton).click()
  await helper.expectResultExact('取消操作')
})
