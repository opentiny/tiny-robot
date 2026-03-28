import { type Page, expect } from '@playwright/test'
import { SENDER_SELECTORS } from '../selectors'

/**
 * 模板块测试辅助函数
 */
export function createTemplateTestHelper(page: Page) {
  const selectors = SENDER_SELECTORS

  return {
    selectors,

    /**
     * 获取编辑器元素
     */
    getEditor() {
      return page.locator(selectors.editor)
    },

    /**
     * 获取所有模板块
     */
    getTemplates() {
      return page.locator(selectors.template)
    },

    /**
     * 根据索引获取模板块
     */
    getTemplate(index: number) {
      return this.getTemplates().nth(index)
    },

    /**
     * 获取模板块内的可编辑内容元素
     */
    getTemplateContent(index: number) {
      return this.getTemplate(index).locator(selectors.templateContent)
    },

    /**
     * 设置简单模板（一个模板块）
     * 等同于：我是【张三】，来自
     */
    async setSimpleTemplate() {
      await page.click(selectors.setTemplateSimpleBtn)
      // 等待至少一个模板块出现
      await expect(this.getTemplates().first()).toBeVisible()
    },

    /**
     * 设置空模板块
     * 等同于：我是【 】，来自
     */
    async setEmptyTemplate() {
      await page.click(selectors.setTemplateEmptyBtn)
      // 等待至少一个模板块出现
      await expect(this.getTemplates().first()).toBeVisible()
    },

    /**
     * 设置多个模板块
     * 等同于：【姓名】【年龄】【城市】
     */
    async setMultipleTemplates() {
      await page.click(selectors.setTemplateMultipleBtn)
      // 等待至少3个模板块出现
      await expect(this.getTemplates()).toHaveCount(3)
    },

    /**
     * 清空模板
     */
    async clearTemplates() {
      await page.click(selectors.clearTemplateBtn)
      // 等待模板块数量归零
      await expect(this.getTemplates()).toHaveCount(0)
    },

    /**
     * 获取编辑器的文本内容（包括零宽字符）
     */
    async getEditorText() {
      return await page.evaluate(() => {
        const editor = document.querySelector('[data-testid="test-sender"] .ProseMirror')
        return editor?.textContent || ''
      })
    },

    /**
     * 获取模板块数量
     */
    async getTemplateCount() {
      return await this.getTemplates().count()
    },

    /**
     * 获取指定模板块的文本内容
     */
    async getTemplateText(index: number) {
      const block = this.getTemplate(index)
      return await block.textContent()
    },

    /**
     * 点击进入模板块编辑
     */
    async clickTemplate(index: number) {
      const block = this.getTemplate(index)
      await block.click()
    },

    /**
     * 聚焦到模板块内容末尾
     */
    async focusTemplateEnd(index: number) {
      await this.getTemplate(index).click()
      // 移动光标到末尾
      await page.keyboard.press('End')
    },

    /**
     * 聚焦到模板块内容开头
     */
    async focusTemplateStart(index: number) {
      await this.getTemplate(index).click()
      // 移动光标到开头
      await page.keyboard.press('Home')
    },

    /**
     * 在模板块中输入文本
     */
    async typeInTemplate(index: number, text: string) {
      await this.getTemplate(index).click()
      await page.keyboard.type(text)
    },

    /**
     * 按 Backspace 键
     */
    async pressBackspace(times: number = 1) {
      for (let i = 0; i < times; i++) {
        await page.keyboard.press('Backspace')
        await page.waitForTimeout(50) // 等待 DOM 更新
      }
    },

    /**
     * 按 Delete 键
     */
    async pressDelete(times: number = 1) {
      for (let i = 0; i < times; i++) {
        await page.keyboard.press('Delete')
        await page.waitForTimeout(50) // 等待 DOM 更新
      }
    },

    /**
     * 按 ArrowLeft 键
     */
    async pressArrowLeft(times: number = 1) {
      for (let i = 0; i < times; i++) {
        await page.keyboard.press('ArrowLeft')
        await page.waitForTimeout(30)
      }
    },

    /**
     * 按 ArrowRight 键
     */
    async pressArrowRight(times: number = 1) {
      for (let i = 0; i < times; i++) {
        await page.keyboard.press('ArrowRight')
        await page.waitForTimeout(30)
      }
    },

    /**
     * 选择编辑器中的文本
     */
    async selectText(range?: { from?: number; to?: number }) {
      if (!range) {
        // 全选
        await page.keyboard.press('Control+A')
      } else {
        // TODO: 实现指定范围的选择
        await page.keyboard.press('Control+A')
      }
    },

    /**
     * 验证模板块数量
     */
    async expectTemplateCount(count: number) {
      await expect(this.getTemplates()).toHaveCount(count)
    },

    /**
     * 验证模板块文本内容
     */
    async expectTemplateText(index: number, text: string) {
      const block = this.getTemplate(index)
      await expect(block).toContainText(text)
    },

    /**
     * 验证编辑器包含文本
     */
    async expectEditorToContainText(text: string) {
      await expect(this.getEditor()).toContainText(text)
    },

    /**
     * 等待一段时间
     */
    async wait(ms: number) {
      await page.waitForTimeout(ms)
    },

    /**
     * 从后往前删除所有模板块的内容，并确保光标回到最前面
     * @param backspaceCount 需要按 Backspace 的次数
     */
    async clearAllTemplatesContent(backspaceCount: number) {
      // 聚焦到最后一个模板块末尾
      const count = await this.getTemplateCount()
      if (count > 0) {
        await this.focusTemplateEnd(count - 1)
        await this.pressBackspace(backspaceCount)
      }
    },

    /**
     * 从前往后删除空模板块
     * @param deleteCount 需要按 Delete 的次数
     */
    async deleteEmptyTemplates(deleteCount: number) {
      await this.pressDelete(deleteCount)
    },
  }
}
