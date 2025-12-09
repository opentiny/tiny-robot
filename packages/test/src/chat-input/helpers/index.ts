import { type Page, expect } from '@playwright/test'
import { CHAT_INPUT_SELECTORS } from '../selectors'

export function createChatInputTestHelper(page: Page) {
  const selectors = CHAT_INPUT_SELECTORS

  return {
    selectors,

    // 获取编辑器
    getEditor() {
      return page.locator(selectors.editor)
    },

    // 获取 ChatInput 容器
    getChatInput() {
      return page.locator(selectors.chatInput)
    },

    // 输入内容
    async typeContent(text: string) {
      await this.getEditor().click()
      await this.getEditor().fill(text)
    },

    // 清空内容
    async clearContent() {
      await this.getEditor().click()
      await this.getEditor().clear()
    },

    // 点击提交按钮
    async clickSubmit() {
      const submitBtn = page.locator(selectors.submitButton)
      await expect(submitBtn).toBeVisible()
      await submitBtn.click()
    },

    // 点击清空按钮
    async clickClear() {
      const clearBtn = page.locator(selectors.clearButton)
      await clearBtn.click()
    },

    // 切换模式
    async toggleMode() {
      await page.locator(selectors.toggleModeBtn).click()
    },

    // 切换 clearable
    async toggleClearable() {
      await page.locator(selectors.toggleClearableBtn).click()
    },

    // 切换 loading
    async toggleLoading() {
      await page.locator(selectors.toggleLoadingBtn).click()
    },

    // 切换 disabled
    async toggleDisabled() {
      await page.locator(selectors.toggleDisabledBtn).click()
    },

    // 切换 showWordLimit
    async toggleWordLimit() {
      await page.locator(selectors.toggleWordLimitBtn).click()
    },

    // 切换 size
    async toggleSize() {
      await page.locator(selectors.toggleSizeBtn).click()
    },

    // 设置 submitType
    async setSubmitType(type: 'enter' | 'ctrlEnter' | 'shiftEnter') {
      await page.locator(selectors.submitTypeSelect).selectOption(type)
    },

    // 设置 maxLength
    async setMaxLength(length: number) {
      await page.locator(selectors.maxLengthInput).fill(String(length))
    },

    // 设置 placeholder
    async setPlaceholder(text: string) {
      await page.locator(selectors.placeholderInput).fill(text)
    },

    // 切换 mention 插件
    async toggleMention() {
      await page.locator(selectors.toggleMentionBtn).click()
    },

    // 切换 template 插件
    async toggleTemplate() {
      await page.locator(selectors.toggleTemplateBtn).click()
    },

    // 切换 suggestion 插件
    async toggleSuggestion() {
      await page.locator(selectors.toggleSuggestionBtn).click()
    },

    // 设置内容
    async setContent() {
      await page.locator(selectors.setContentBtn).click()
    },

    // 获取内容
    async getContent() {
      await page.locator(selectors.getContentBtn).click()
    },

    // 聚焦编辑器
    async focusEditor() {
      await page.locator(selectors.focusBtn).click()
    },

    // 失焦编辑器
    async blurEditor() {
      await page.locator(selectors.blurBtn).click()
    },

    // 清空编辑器（方法调用）
    async clearEditor() {
      await page.locator(selectors.clearBtn).click()
    },

    // 提交编辑器（方法调用）
    async submitEditor() {
      await page.locator(selectors.submitBtn).click()
    },

    // 验证编辑器内容
    async expectEditorContent(text: string) {
      await expect(this.getEditor()).toContainText(text)
    },

    // 验证编辑器为空
    async expectEditorEmpty() {
      const content = await this.getEditor().textContent()
      expect(content?.trim()).toBe('')
    },

    // 验证清空按钮可见性
    async expectClearButtonVisible(visible: boolean) {
      const clearBtn = page.locator(selectors.clearButton)
      if (visible) {
        await expect(clearBtn).toBeVisible()
      } else {
        await expect(clearBtn).not.toBeVisible()
      }
    },

    // 验证 loading 按钮可见性
    async expectLoadingButtonVisible(visible: boolean) {
      const loadingBtn = page.locator(selectors.loadingButton)
      if (visible) {
        await expect(loadingBtn).toBeVisible()
      } else {
        await expect(loadingBtn).not.toBeVisible()
      }
    },

    // 验证字数统计
    async expectWordCounter(text: string) {
      await expect(page.locator(selectors.wordCounter)).toContainText(text)
    },

    // 验证结果显示
    async expectResult(text: string) {
      await expect(page.locator(selectors.resultDisplay)).toContainText(text)
    },

    // 验证底部插槽
    async expectFooterSlot() {
      await expect(page.locator(selectors.customFooterBtn)).toBeVisible()
    },

    // 点击自定义底部按钮
    async clickCustomFooterBtn() {
      await page.locator(selectors.customFooterBtn).click()
    },

    // 等待一段时间
    async wait(ms: number) {
      await page.waitForTimeout(ms)
    },
  }
}
