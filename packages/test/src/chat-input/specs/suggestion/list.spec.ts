import { test, type Page } from '@playwright/test'
import { createChatInputTestHelper } from '../../helpers'
import { createSuggestionHelper } from '../../helpers/suggestion-helper'

test.describe('ChatInput Suggestion - 列表显示', () => {
  let page: Page
  let helper: ReturnType<typeof createChatInputTestHelper>
  let suggestionHelper: ReturnType<typeof createSuggestionHelper>

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto('/')
    await page.click('text=ChatInput 组件')
    helper = createChatInputTestHelper(page)
    suggestionHelper = createSuggestionHelper(page)

    // 打开 suggestion 插件开关
    await helper.toggleSuggestion()
    await helper.wait(300) // 等待组件重新渲染
  })

  test.afterAll(async () => {
    // 关闭 suggestion 插件开关
    await helper.toggleSuggestion()
    await page.close()
  })

  test.beforeEach(async () => {
    await helper.clearContent()
  })

  test('TC-SUG-LIST-01: 空内容时不应显示建议列表', async () => {
    // 1. Arrange - 确保编辑器为空
    await helper.expectEditorEmpty()

    // 2. Assert
    await suggestionHelper.expectSuggestionListVisible(false)
  })

  test('TC-SUG-LIST-02: 输入内容后应显示建议列表', async () => {
    // 1. Act
    await helper.typeContent('J')

    // 2. Assert
    await suggestionHelper.expectSuggestionListVisible(true)
    await suggestionHelper.expectSuggestionCount(6)
  })

  test('TC-SUG-LIST-03: 清空内容后应关闭建议列表', async () => {
    // 1. Arrange - 先输入内容显示列表
    await helper.typeContent('Java')
    await suggestionHelper.expectSuggestionListVisible(true)

    // 2. Act - 清空内容
    await helper.clearContent()

    // 3. Assert
    await suggestionHelper.expectSuggestionListVisible(false)
  })

  test('TC-SUG-LIST-04: 选中建议项后应关闭列表', async () => {
    // 1. Arrange
    await helper.typeContent('C')
    await suggestionHelper.expectSuggestionListVisible(true)

    // 2. Act - 选中一项
    await suggestionHelper.pressEnter()

    // 3. Assert
    await suggestionHelper.expectSuggestionListVisible(false)
  })

  test('TC-SUG-LIST-05: 选中后再次输入应重新显示列表', async () => {
    // 1. Arrange - 先选中一项
    await helper.typeContent('J')
    await suggestionHelper.pressEnter()
    await suggestionHelper.expectSuggestionListVisible(false)

    // 2. Act - 清空后重新输入
    await helper.clearContent()
    await helper.typeContent('P')

    // 3. Assert
    await suggestionHelper.expectSuggestionListVisible(true)
  })

  test('TC-SUG-LIST-06: 建议列表应显示所有6个建议项', async () => {
    // 1. Act
    await helper.typeContent('test')

    // 2. Assert
    await suggestionHelper.expectSuggestionListVisible(true)
    await suggestionHelper.expectSuggestionCount(6)

    // 验证所有建议项内容
    await suggestionHelper.expectSuggestionItemText(0, 'Java')
    await suggestionHelper.expectSuggestionItemText(1, 'JavaScript')
    await suggestionHelper.expectSuggestionItemText(2, 'TypeScript')
    await suggestionHelper.expectSuggestionItemText(3, 'Python')
    await suggestionHelper.expectSuggestionItemText(4, 'C++')
    await suggestionHelper.expectSuggestionItemText(5, 'Golang')
  })
})
