import { test, type Page } from '@playwright/test'
import { createSenderTestHelper } from '../../helpers'
import { createSuggestionHelper } from '../../helpers/suggestion-helper'

test.describe('Sender Suggestion - 列表显示', () => {
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

  test('TC-SUG-LIST-01: 空内容时不应显示建议列表', async () => {
    await helper!.expectEditorEmpty()
    await suggestionHelper!.expectSuggestionListVisible(false)
  })

  test('TC-SUG-LIST-02: 输入内容后应显示建议列表', async () => {
    await helper!.typeContent('J')

    await suggestionHelper!.expectSuggestionListVisible(true)
    await suggestionHelper!.expectSuggestionCount(6)
  })

  test('TC-SUG-LIST-03: 清空内容后应关闭建议列表', async () => {
    await helper!.typeContent('Java')
    await suggestionHelper!.expectSuggestionListVisible(true)

    await helper!.clearContent()
    await suggestionHelper!.expectSuggestionListVisible(false)
  })

  test('TC-SUG-LIST-04: 选中建议项后应关闭列表', async () => {
    await helper!.typeContent('C')
    await suggestionHelper!.expectSuggestionListVisible(true)

    await suggestionHelper!.pressEnter()
    await suggestionHelper!.expectSuggestionListVisible(false)
  })

  test('TC-SUG-LIST-05: 选中后再次输入应重新显示列表', async () => {
    await helper!.typeContent('J')
    await suggestionHelper!.pressEnter()
    await suggestionHelper!.expectSuggestionListVisible(false)

    await helper!.clearContent()
    await helper!.typeContent('P')
    await suggestionHelper!.expectSuggestionListVisible(true)
  })

  test('TC-SUG-LIST-06: 建议列表应显示所有建议项', async () => {
    await helper!.typeContent('test')

    await suggestionHelper!.expectSuggestionListVisible(true)
    await suggestionHelper!.expectSuggestionCount(6)
    await suggestionHelper!.expectSuggestionItemText(0, 'Java')
    await suggestionHelper!.expectSuggestionItemText(1, 'JavaScript')
    await suggestionHelper!.expectSuggestionItemText(2, 'TypeScript')
    await suggestionHelper!.expectSuggestionItemText(3, 'Python')
    await suggestionHelper!.expectSuggestionItemText(4, 'C++')
    await suggestionHelper!.expectSuggestionItemText(5, 'Golang')
  })
})
