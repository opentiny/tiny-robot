import { test, type Page } from '@playwright/test'
import { createMentionHelper } from '../../helpers/mention-helper'
import { createSenderTestHelper } from '../../helpers'

test.describe('Mention 功能 - 列表交互', () => {
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

  test('TC-05: 输入文本应该过滤提及项列表', async () => {
    await mentionHelper.typeAtSymbol()
    await mentionHelper.typeQuery('画')
    await mentionHelper.expectItemCount(1)
    await mentionHelper.expectListContains('小小画家')
  })

  test('TC-06: 键盘上下键应该导航列表', async () => {
    await mentionHelper.typeAtSymbol()

    await mentionHelper.expectSelectedItemIndex(0)

    await mentionHelper.pressKey('ArrowDown')
    await mentionHelper.expectSelectedItemIndex(1)

    await mentionHelper.pressKey('ArrowUp')
    await mentionHelper.expectSelectedItemIndex(0)
  })

  test('TC-07: 边界导航不应该越界', async () => {
    await mentionHelper.typeAtSymbol()

    await mentionHelper.expectSelectedItemIndex(0)
    await mentionHelper.pressKey('ArrowUp')
    await mentionHelper.expectSelectedItemIndex(0)

    await mentionHelper.pressKey('ArrowDown')
    await mentionHelper.pressKey('ArrowDown')
    await mentionHelper.pressKey('ArrowDown')
    await mentionHelper.expectSelectedItemIndex(3)

    await mentionHelper.pressKey('ArrowDown')
    await mentionHelper.expectSelectedItemIndex(3)
  })

  test('TC-08: 鼠标悬停应该高亮选项', async () => {
    await mentionHelper.typeAtSymbol()
    await mentionHelper.hoverItem(2)
  })
})
