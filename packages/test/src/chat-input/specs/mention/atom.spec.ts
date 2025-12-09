import { test, type Page } from '@playwright/test'
import { createMentionHelper } from '../../helpers/mention-helper'
import { createChatInputTestHelper } from '../../helpers/index'

test.describe('Mention 功能 - Atom 节点行为', () => {
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

  test('TC-09: 选中提及项后应该插入 Atom 节点', async () => {
    await mentionHelper.typeAtSymbol()
    await mentionHelper.pressKey('Enter') // 选中第一个

    await mentionHelper.expectMentionExists('小小画家')
    await mentionHelper.expectMentionListVisible(false)
  })

  test('TC-10: 鼠标点击选中提及项应该插入 Atom 节点', async () => {
    await mentionHelper.typeAtSymbol()
    await mentionHelper.clickItem(1) // 点击第二个 "代码助手"

    await mentionHelper.expectMentionExists('代码助手')
    await mentionHelper.expectMentionListVisible(false)
  })

  test('TC-11: Backspace 应该删除整个 Atom 节点', async () => {
    // 插入节点
    await mentionHelper.typeAtSymbol()
    await mentionHelper.pressKey('Enter')
    await mentionHelper.expectMentionExists('小小画家')

    // 删除
    await mentionHelper.deleteMention()
    await mentionHelper.expectMentionCount(0)
  })

  test('TC-12: 可以在 Atom 节点后继续输入', async () => {
    await mentionHelper.typeAtSymbol()
    await mentionHelper.pressKey('Enter')

    // 使用 keyboard.type 追加内容，而不是 setContent/fill (会清空)
    await page.keyboard.type(' 帮我画画')
    await basicHelper.expectEditorContent('小小画家 帮我画画')
  })
})
