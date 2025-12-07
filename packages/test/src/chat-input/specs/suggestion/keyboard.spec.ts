import { test, type Page } from '@playwright/test'
import { createChatInputTestHelper } from '../../helpers'
import { createSuggestionHelper } from '../../helpers/suggestion-helper'

test.describe('ChatInput Suggestion - 键盘交互', () => {
  let page: Page
  let helper: ReturnType<typeof createChatInputTestHelper>
  let suggestionHelper: ReturnType<typeof createSuggestionHelper>

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto('/')
    await page.click('text=ChatInput 组件')
    helper = createChatInputTestHelper(page)
    suggestionHelper = createSuggestionHelper(page)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.beforeEach(async () => {
    await helper.clearContent()
  })

  test('TC-SUG-KB-01: 按 Tab 键应用自动补全', async () => {
    // 1. Arrange
    await helper.typeContent('Ja')
    await suggestionHelper.expectSuggestionListVisible(true)

    // 2. Act - 按下 Tab 键
    await suggestionHelper.pressTab()

    // 3. Assert
    // 应该补全为 Java（第一个匹配项）
    await helper.expectEditorContent('Java')
    // 列表应该关闭
    await suggestionHelper.expectSuggestionListVisible(false)
  })

  test('TC-SUG-KB-02: 按 Esc 键关闭建议列表', async () => {
    // 1. Arrange
    await helper.typeContent('P')
    await suggestionHelper.expectSuggestionListVisible(true)

    // 2. Act
    await page.keyboard.press('Escape')

    // 3. Assert
    // 列表应该关闭
    await suggestionHelper.expectSuggestionListVisible(false)
    // 内容应该保持不变
    await helper.expectEditorContent('P')
  })

  test('TC-SUG-KB-03: 向下导航到最后一项后应循环到第一项', async () => {
    // 1. Arrange
    await helper.typeContent('G')
    await suggestionHelper.expectSuggestionListVisible(true)
    await suggestionHelper.expectSuggestionCount(6)

    // 2. Act - 连续按向下键直到循环
    // 从索引 0 开始，按 6 次应该回到索引 0
    for (let i = 0; i < 6; i++) {
      await suggestionHelper.pressArrowDown()
    }

    // 3. Assert
    await suggestionHelper.expectHighlightedItem(0)
  })

  test('TC-SUG-KB-04: 向上导航到第一项后应循环到最后一项', async () => {
    // 1. Arrange
    await helper.typeContent('C')
    await suggestionHelper.expectSuggestionListVisible(true)
    // 默认选中第一项(索引0)

    // 2. Act - 按向上键
    await suggestionHelper.pressArrowUp()

    // 3. Assert
    // 应该循环到最后一项(索引5，因为有6个项目)
    await suggestionHelper.expectHighlightedItem(5)
  })

  test('TC-SUG-KB-05: 导航后按 Enter 应选中当前高亮项', async () => {
    // 1. Arrange
    await helper.typeContent('T')
    await suggestionHelper.expectSuggestionListVisible(true)

    // 2. Act - 导航到第二项然后选中
    await suggestionHelper.pressArrowDown() // 移到索引1 (JavaScript)
    await suggestionHelper.pressArrowDown() // 移到索引2 (TypeScript)
    await suggestionHelper.pressEnter()

    // 3. Assert
    await helper.expectEditorContent('TypeScript')
    await suggestionHelper.expectSuggestionListVisible(false)
  })

  test('TC-SUG-KB-06: 导航后按 Tab 应应用当前项的自动补全', async () => {
    // 1. Arrange
    await helper.typeContent('P')
    await suggestionHelper.expectSuggestionListVisible(true)

    // 2. Act - 导航到 Python 然后 Tab
    await suggestionHelper.pressArrowDown()
    await suggestionHelper.pressArrowDown()
    await suggestionHelper.pressArrowDown() // 移到 Python
    await suggestionHelper.pressTab()

    // 3. Assert
    await helper.expectEditorContent('Python')
    await suggestionHelper.expectSuggestionListVisible(false)
  })
})
