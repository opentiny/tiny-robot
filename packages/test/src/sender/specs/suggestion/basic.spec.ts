import { test, type Page } from '@playwright/test'
import { createSenderTestHelper } from '../../helpers'
import { createSuggestionHelper } from '../../helpers/suggestion-helper'

test.describe('Sender Suggestion', () => {
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

  test('TC-SUG-01: 输入任意字符应显示所有建议项', async () => {
    await helper!.typeContent('J')

    await suggestionHelper!.expectSuggestionListVisible(true)
    await suggestionHelper!.expectSuggestionCount(6)
    await suggestionHelper!.expectSuggestionItemText(0, 'Java')
    await suggestionHelper!.expectHighlightedItem(0)
  })

  test('TC-SUG-02: 键盘导航建议列表', async () => {
    await helper!.typeContent('J')
    await suggestionHelper!.expectSuggestionListVisible(true)

    await suggestionHelper!.pressArrowDown()
    await suggestionHelper!.expectHighlightedItem(1)
    await suggestionHelper!.expectSuggestionItemText(1, 'JavaScript')

    await suggestionHelper!.pressArrowUp()
    await suggestionHelper!.expectHighlightedItem(0)
  })

  test('TC-SUG-03: 按 Enter 键选中建议项', async () => {
    await helper!.typeContent('J')
    await suggestionHelper!.expectSuggestionListVisible(true)

    await suggestionHelper!.pressEnter()
    await helper!.expectEditorContent('Java')
    await suggestionHelper!.expectSuggestionListVisible(false)
  })

  test('TC-SUG-04: 点击选中建议项', async () => {
    await helper!.typeContent('T')
    await suggestionHelper!.expectSuggestionListVisible(true)

    await suggestionHelper!.clickSuggestionItem(2)
    await helper!.expectEditorContent('TypeScript')
    await suggestionHelper!.expectSuggestionListVisible(false)
  })
})
