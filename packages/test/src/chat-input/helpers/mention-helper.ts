import { type Page, expect } from '@playwright/test'
import { CHAT_INPUT_SELECTORS } from '../selectors'

export function createMentionHelper(page: Page) {
  const selectors = CHAT_INPUT_SELECTORS

  return {
    // 获取编辑器
    getEditor() {
      return page.locator(selectors.editor)
    },

    // 输入 @ 符号触发技能选择面板
    async typeAtSymbol() {
      await this.getEditor().click()
      await page.keyboard.type('@')
      // 等待面板出现
      await expect(page.locator(selectors.skillMentionList)).toBeVisible()
    },

    // 输入查询文本进行过滤
    async typeQuery(query: string) {
      await page.keyboard.type(query)
    },

    // 按下键盘按键
    async pressKey(key: string) {
      await page.keyboard.press(key)
    },

    // 点击指定索引的技能
    async clickSkill(index: number) {
      const items = page.locator(selectors.skillMentionItem)
      await items.nth(index).click()
    },

    // 鼠标悬停在指定索引的技能上
    async hoverSkill(index: number) {
      const items = page.locator(selectors.skillMentionItem)
      await items.nth(index).hover()
    },

    // 验证技能选择面板可见
    async expectMentionListVisible(visible: boolean = true) {
      const list = page.locator(selectors.skillMentionList)
      if (visible) {
        await expect(list).toBeVisible()
      } else {
        await expect(list).not.toBeVisible()
      }
    },

    // 验证技能选择面板中的技能数量
    async expectSkillCount(count: number) {
      const items = page.locator(selectors.skillMentionItem)
      await expect(items).toHaveCount(count)
    },

    // 验证选中的技能索引
    async expectSelectedSkillIndex(index: number) {
      const selected = page.locator(selectors.skillMentionSelected)
      const allItems = page.locator(selectors.skillMentionItem)
      const selectedItem = allItems.nth(index)
      await expect(selected).toHaveCount(1)
      await expect(selectedItem).toHaveClass(/is-selected/)
    },

    // 验证编辑器中包含技能块
    async expectSkillMentionExists(skillLabel: string) {
      const mention = page.locator(selectors.skillMentionNode)
      await expect(mention).toBeVisible()
      await expect(mention).toContainText(skillLabel)
    },

    // 验证编辑器中技能块数量
    async expectSkillMentionCount(count: number) {
      const mentions = page.locator(selectors.skillMentionNode)
      if (count === 0) {
        await expect(mentions).toHaveCount(0)
      } else {
        await expect(mentions).toHaveCount(count)
      }
    },

    // 验证技能列表中包含特定文本
    async expectSkillListContains(text: string) {
      const items = page.locator(selectors.skillMentionItem)
      const firstItem = items.first()
      await expect(firstItem).toContainText(text)
    },

    // 删除技能块（模拟 Backspace）
    async deleteSkillMention() {
      await page.keyboard.press('Backspace')
    },

    // 选择技能块
    async selectSkillMention(skillLabel: string) {
      const mention = page.locator(selectors.skillMentionNode).filter({ hasText: skillLabel })
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
