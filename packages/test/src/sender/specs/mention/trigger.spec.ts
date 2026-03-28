import { test, type Page } from '@playwright/test'
import { createMentionHelper } from '../../helpers/mention-helper'
import { createSenderTestHelper } from '../../helpers'

test.describe('Mention 功能 - 触发机制', () => {
  test.describe.configure({ mode: 'serial' })

  let page: Page
  let mentionHelper: ReturnType<typeof createMentionHelper>
  let basicHelper: ReturnType<typeof createSenderTestHelper>

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto('/')
    await page.click('text=Sender 组件')
    mentionHelper = createMentionHelper(page)
    basicHelper = createSenderTestHelper(page)

    await basicHelper.toggleMention()
    await basicHelper.wait(300)
  })

  test.afterAll(async () => {
    await basicHelper.toggleMention()
    await page.close()
  })

  test.beforeEach(async () => {
    await basicHelper.clearContent()
  })

  test('TC-01: 输入 @ 符号应该触发提及面板', async () => {
    await mentionHelper.typeAtSymbol()
    await mentionHelper.expectMentionListVisible(true)
    await mentionHelper.expectItemCount(4)
  })

  test('TC-02: 输入普通文本不应该触发提及面板', async () => {
    await basicHelper.typeContent('Hello')
    await mentionHelper.expectMentionListVisible(false)
  })

  test('TC-03: 在已有文本后输入 @ 应该触发面板', async () => {
    await basicHelper.typeContent('Hello ')
    await mentionHelper.typeAtSymbol()
    await mentionHelper.expectMentionListVisible(true)
  })

  test('TC-04: 删除 @ 符号应该关闭面板', async () => {
    await mentionHelper.typeAtSymbol()
    await mentionHelper.expectMentionListVisible(true)

    await mentionHelper.pressKey('Backspace')
    await mentionHelper.expectMentionListVisible(false)
  })
})
