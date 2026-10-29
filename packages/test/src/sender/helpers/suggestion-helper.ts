import { type Page, expect } from '@playwright/test'
import { SENDER_SELECTORS } from '../selectors'

export function createSuggestionHelper(page: Page) {
  const selectors = SENDER_SELECTORS

  return {
    // 检查 Suggestion 列表是否可见
    async expectSuggestionListVisible(visible: boolean) {
      const list = page.locator(selectors.suggestionList)
      if (visible) {
        await expect(list).toBeVisible()
      } else {
        await expect(list).not.toBeVisible()
      }
    },

    // 检查建议项数量
    async expectSuggestionCount(count: number) {
      await expect(page.locator(selectors.suggestionItem)).toHaveCount(count)
    },

    // 检查建议项内容
    async expectSuggestionItemText(index: number, text: string) {
      // 获取纯文本内容，忽略 HTML 标签
      await expect(page.locator(selectors.suggestionItem).nth(index)).toContainText(text)
    },

    // 检查是否有高亮项
    async expectHighlightedItem(index: number) {
      const item = page.locator(selectors.suggestionItem).nth(index)
      await expect(item).toHaveClass(/highlighted/)
    },

    // 点击建议项
    async clickSuggestionItem(index: number) {
      await page.locator(selectors.suggestionItem).nth(index).click()
    },

    // 按下 Enter
    async pressEnter() {
      await page.keyboard.press('Enter')
    },

    // 按下 Tab
    async pressTab() {
      await page.keyboard.press('Tab')
    },

    // 按下 ArrowDown
    async pressArrowDown() {
      await page.keyboard.press('ArrowDown')
    },

    // 按下 ArrowUp
    async pressArrowUp() {
      await page.keyboard.press('ArrowUp')
    },

    // 鼠标悬停到建议项
    async hoverSuggestionItem(index: number) {
      await page.locator(selectors.suggestionItem).nth(index).hover()
    },

    // 等待一段时间
    async wait(ms: number) {
      await page.waitForTimeout(ms)
    },
  }
}
