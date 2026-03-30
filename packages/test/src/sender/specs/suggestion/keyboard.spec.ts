import { test, type Page } from '@playwright/test'
import { createSenderTestHelper } from '../../helpers'
import { createSuggestionHelper } from '../../helpers/suggestion-helper'

test.describe('Sender Suggestion - 键盘交互', () => {
  test.describe.configure({ mode: 'serial' })

  let page: Page | undefined
  let helper: ReturnType<typeof createSenderTestHelper> | undefined
  let suggestionHelper: ReturnType<typeof createSuggestionHelper> | undefined

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto('/')
    await page.click('text=Sender 组件')
    helper = createSenderTestHelper(page)
    suggestionHelper = createSuggestionHelper(page)

    await helper.toggleSuggestion()
    await helper.wait(300)
  })

  test.afterAll(async () => {
    if (helper) {
      await helper.toggleSuggestion()
    }
    await page?.close()
  })

  test.beforeEach(async () => {
    await helper!.clearContent()
  })

  test('TC-SUG-KB-01: 按 Tab 键应用自动补全', async () => {
    await helper!.typeContent('Ja')
    await suggestionHelper!.expectSuggestionListVisible(true)

    await suggestionHelper!.pressTab()
    await helper!.expectEditorContent('Java')
    await suggestionHelper!.expectSuggestionListVisible(false)
  })

  test('TC-SUG-KB-02: 按 Esc 键关闭建议列表', async () => {
    await helper!.typeContent('P')
    await suggestionHelper!.expectSuggestionListVisible(true)

    await page!.keyboard.press('Escape')
    await suggestionHelper!.expectSuggestionListVisible(false)
    await helper!.expectEditorContent('P')
  })

  test('TC-SUG-KB-03: 向下导航到最后一项后应循环到第一项', async () => {
    await helper!.typeContent('G')
    await suggestionHelper!.expectSuggestionListVisible(true)
    await suggestionHelper!.expectSuggestionCount(6)

    for (let i = 0; i < 6; i++) {
      await suggestionHelper!.pressArrowDown()
    }

    await suggestionHelper!.expectHighlightedItem(0)
  })

  test('TC-SUG-KB-04: 向上导航到第一项后应循环到最后一项', async () => {
    await helper!.typeContent('C')
    await suggestionHelper!.expectSuggestionListVisible(true)

    await suggestionHelper!.pressArrowUp()
    await suggestionHelper!.expectHighlightedItem(5)
  })

  test('TC-SUG-KB-05: 导航后按 Enter 应选中当前高亮项', async () => {
    await helper!.typeContent('T')
    await suggestionHelper!.expectSuggestionListVisible(true)

    await suggestionHelper!.pressArrowDown()
    await suggestionHelper!.pressArrowDown()
    await suggestionHelper!.pressEnter()

    await helper!.expectEditorContent('TypeScript')
    await suggestionHelper!.expectSuggestionListVisible(false)
  })

  test('TC-SUG-KB-06: 导航后按 Tab 应应用当前项的自动补全', async () => {
    await helper!.typeContent('P')
    await suggestionHelper!.expectSuggestionListVisible(true)

    await suggestionHelper!.pressArrowDown()
    await suggestionHelper!.pressArrowDown()
    await suggestionHelper!.pressArrowDown()
    await suggestionHelper!.pressTab()

    await helper!.expectEditorContent('Python')
    await suggestionHelper!.expectSuggestionListVisible(false)
  })
})
