import { test, type Page } from '@playwright/test'
import { createMentionHelper } from '../../helpers/mention-helper'
import { createChatInputTestHelper } from '../../helpers/index'

test.describe('Mention 功能 - 触发机制', () => {
  let page: Page
  let mentionHelper: ReturnType<typeof createMentionHelper>
  let basicHelper: ReturnType<typeof createChatInputTestHelper>

  // 只在所有测试开始前创建页面并导航一次
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto('/')
    await page.click('text=ChatInput 组件')
    mentionHelper = createMentionHelper(page)
    basicHelper = createChatInputTestHelper(page)

    // 打开 mention 插件开关
    await basicHelper.toggleMention()
    await basicHelper.wait(300) // 等待组件重新渲染
  })

  // 所有测试结束后关闭页面
  test.afterAll(async () => {
    // 关闭 mention 插件开关
    await basicHelper.toggleMention()
    await page.close()
  })

  // 每个测试前清空编辑器
  test.beforeEach(async () => {
    await basicHelper.clearContent()
  })

  test('TC-01: 输入 @ 符号应该触发提及选择面板', async () => {
    await mentionHelper.typeAtSymbol()
    await mentionHelper.expectMentionListVisible(true)
    await mentionHelper.expectItemCount(4) // 默认有4个提及项
  })

  test('TC-02: 输入非 @ 字符不应该触发面板', async () => {
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

    await mentionHelper.deleteMention() // 这里其实是删除字符
    await mentionHelper.expectMentionListVisible(false)
  })
})
