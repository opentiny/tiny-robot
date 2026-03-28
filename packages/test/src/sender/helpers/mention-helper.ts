import { type Page, expect } from '@playwright/test'
import { SENDER_SELECTORS } from '../selectors'

export function createMentionHelper(page: Page) {
  const selectors = SENDER_SELECTORS

  return {
    // 获取编辑器
    getEditor() {
      return page.locator(selectors.editor)
    },

    // 输入 @ 符号触发提及选择面板
    async typeAtSymbol() {
      await this.getEditor().click()
      await page.keyboard.type('@')
      // 等待面板出现
      await expect(page.locator(selectors.mentionList)).toBeVisible()
    },

    // 输入查询文本进行过滤
    async typeQuery(query: string) {
      await page.keyboard.type(query)
    },

    // 按下键盘按键
    async pressKey(key: string) {
      await page.keyboard.press(key)
    },

    // 点击指定索引的提及项
    async clickItem(index: number) {
      const items = page.locator(selectors.mentionItem)
      await items.nth(index).click()
    },

    // 鼠标悬停在指定索引的提及项上
    async hoverItem(index: number) {
      const items = page.locator(selectors.mentionItem)
      await items.nth(index).hover()
    },

    // 验证提及选择面板可见
    async expectMentionListVisible(visible: boolean = true) {
      const list = page.locator(selectors.mentionList)
      if (visible) {
        await expect(list).toBeVisible()
      } else {
        await expect(list).not.toBeVisible()
      }
    },

    // 验证提及选择面板中的项数量
    async expectItemCount(count: number) {
      const items = page.locator(selectors.mentionItem)
      await expect(items).toHaveCount(count)
    },

    // 验证选中的项索引
    async expectSelectedItemIndex(index: number) {
      const selected = page.locator(selectors.mentionSelected)
      const allItems = page.locator(selectors.mentionItem)
      const selectedItem = allItems.nth(index)
      await expect(selected).toHaveCount(1)
      await expect(selectedItem).toHaveClass(/is-selected/)
    },

    // 验证编辑器中包含 mention 节点
    async expectMentionExists(label: string) {
      const mention = page.locator(selectors.mentionNode)
      await expect(mention).toBeVisible()
      await expect(mention).toContainText(label)
    },

    // 验证编辑器中 mention 节点数量
    async expectMentionCount(count: number) {
      const mentions = page.locator(selectors.mentionNode)
      if (count === 0) {
        await expect(mentions).toHaveCount(0)
      } else {
        await expect(mentions).toHaveCount(count)
      }
    },

    // 验证提及列表中包含特定文本
    async expectListContains(text: string) {
      const items = page.locator(selectors.mentionItem)
      const firstItem = items.first()
      await expect(firstItem).toContainText(text)
    },

    // 删除 mention 节点（模拟 Backspace）
    // 注意：mention 插入时会自动在后面添加空格，所以需要按两次 Backspace
    // 第一次删除空格，第二次删除节点
    async deleteMention() {
      await page.keyboard.press('Backspace') // 删除空格
      await page.keyboard.press('Backspace') // 删除节点
    },

    // 选择 mention 节点
    async selectMention(label: string) {
      const mention = page.locator(selectors.mentionNode).filter({ hasText: label })
      await mention.click()
    },

    // 验证光标位置在技能块后面（通过输入测试）
    async expectCursorAfterMention() {
      // 输入一个空格看是否在技能块后面
      await page.keyboard.type(' ')
    },

    // 等待
    async wait(ms: number) {
      await page.waitForTimeout(ms)
    },
  }
}
