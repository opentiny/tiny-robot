import { test, type Page } from '@playwright/test'
import { createChatInputTestHelper } from '../../helpers'
import { createSuggestionHelper } from '../../helpers/suggestion-helper'

test.describe('ChatInput Suggestion', () => {
  let page: Page
  let helper: ReturnType<typeof createChatInputTestHelper>
  let suggestionHelper: ReturnType<typeof createSuggestionHelper>

  // 只在所有测试开始前创建页面并导航一次
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto('/')
    await page.click('text=ChatInput 组件')
    helper = createChatInputTestHelper(page)
    suggestionHelper = createSuggestionHelper(page)
  })

  // 所有测试结束后关闭页面
  test.afterAll(async () => {
    await page.close()
  })

  // 每个测试前清空编辑器
  test.beforeEach(async () => {
    await helper.clearContent()
  })

  test('TC-SUG-01: 输入任意字符应显示所有建议项（默认不过滤）', async () => {
    // 1. Arrange & Act
    await helper.typeContent('J')

    // 2. Assert
    await suggestionHelper.expectSuggestionListVisible(true)
    // 默认建议项有6个
    await suggestionHelper.expectSuggestionCount(6)
    // 第一项是 Java
    await suggestionHelper.expectSuggestionItemText(0, 'Java')
    // 默认高亮第一项
    await suggestionHelper.expectHighlightedItem(0)
  })

  test('TC-SUG-02: 键盘导航建议列表', async () => {
    // 1. Arrange
    await helper.typeContent('J')
    await suggestionHelper.expectSuggestionListVisible(true)

    // 2. Act - 向下选择
    await suggestionHelper.pressArrowDown()

    // 3. Assert
    // 应该高亮第二项 (JavaScript)
    await suggestionHelper.expectHighlightedItem(1)
    await suggestionHelper.expectSuggestionItemText(1, 'JavaScript')

    // 4. Act - 向上选择
    await suggestionHelper.pressArrowUp()

    // 5. Assert
    // 回到第一项 (Java)
    await suggestionHelper.expectHighlightedItem(0)
  })

  test('TC-SUG-03: 按 Enter 键选中建议项', async () => {
    // 1. Arrange
    await helper.typeContent('J')
    await suggestionHelper.expectSuggestionListVisible(true)

    // 默认选中第一项(Java)，直接回车
    await suggestionHelper.pressEnter()

    // 2. Assert
    // 内容应该变为 Java
    await helper.expectEditorContent('Java')
    // 列表应该关闭
    await suggestionHelper.expectSuggestionListVisible(false)
  })

  test('TC-SUG-04: 点击选中建议项', async () => {
    // 1. Arrange
    await helper.typeContent('T')
    await suggestionHelper.expectSuggestionListVisible(true)

    // 2. Act - 点击第三项 (TypeScript)
    await suggestionHelper.clickSuggestionItem(2)

    // 3. Assert
    // 内容应该变为 TypeScript
    await helper.expectEditorContent('TypeScript')
    // 列表应该关闭
    await suggestionHelper.expectSuggestionListVisible(false)
  })
})
