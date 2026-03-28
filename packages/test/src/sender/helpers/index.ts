import { expect, type Page } from '@playwright/test'
import { SENDER_SELECTORS } from '../selectors'

export function createSenderTestHelper(page: Page) {
  const selectors = SENDER_SELECTORS

  return {
    selectors,

    getEditor() {
      return page.locator(selectors.editor)
    },

    getSender() {
      return page.locator(selectors.sender)
    },

    async typeContent(text: string) {
      await this.getEditor().click()
      await page.keyboard.type(text)
    },

    async clearContent() {
      await this.getEditor().click()
      await page.keyboard.press('Control+A')
      await page.keyboard.press('Delete')
      await page.waitForTimeout(50)
    },

    async clickSubmit() {
      const submitBtn = page.locator(selectors.submitButton)
      await expect(submitBtn).toBeVisible()
      await submitBtn.click()
    },

    async clickClear() {
      await page.locator(selectors.clearButton).click()
    },

    async toggleMode() {
      await page.locator(selectors.toggleModeBtn).click()
    },

    async toggleClearable() {
      await page.locator(selectors.toggleClearableBtn).click()
    },

    async toggleLoading() {
      await page.locator(selectors.toggleLoadingBtn).click()
    },

    async toggleDisabled() {
      await page.locator(selectors.toggleDisabledBtn).click()
    },

    async toggleWordLimit() {
      await page.locator(selectors.toggleWordLimitBtn).click()
    },

    async toggleSize() {
      await page.locator(selectors.toggleSizeBtn).click()
    },

    async setSubmitType(type: 'enter' | 'ctrlEnter' | 'shiftEnter') {
      await page.locator(selectors.submitTypeSelect).selectOption(type)
    },

    async setMaxLength(length: number) {
      await page.locator(selectors.maxLengthInput).fill(String(length))
    },

    async setPlaceholder(text: string) {
      await page.locator(selectors.placeholderInput).fill(text)
    },

    async toggleMention() {
      await page.locator(selectors.toggleMentionBtn).click()
    },

    async toggleTemplate() {
      await page.locator(selectors.toggleTemplateBtn).click()
    },

    async toggleSuggestion() {
      await page.locator(selectors.toggleSuggestionBtn).click()
    },

    async setContent() {
      await page.locator(selectors.setContentBtn).click()
    },

    async getContent() {
      await page.locator(selectors.getContentBtn).click()
    },

    async focusEditor() {
      await page.locator(selectors.focusBtn).click()
    },

    async blurEditor() {
      await page.locator(selectors.blurBtn).click()
    },

    async clearEditor() {
      await page.locator(selectors.clearBtn).click()
    },

    async submitEditor() {
      await page.locator(selectors.submitBtn).click()
    },

    async expectEditorContent(text: string) {
      await expect(this.getEditor()).toContainText(text)
    },

    async expectEditorEmpty() {
      const content = await this.getEditor().textContent()
      const normalized = (content ?? '')
        .replace(/\u200b/g, '')
        .replace(/\u00a0/g, '')
        .trim()
      expect(normalized).toBe('')
    },

    async expectClearButtonVisible(visible: boolean) {
      const clearBtn = page.locator(selectors.clearButton)
      if (visible) {
        await expect(clearBtn).toBeVisible()
      } else {
        await expect(clearBtn).toHaveCount(0)
      }
    },

    async expectLoadingButtonVisible(visible: boolean) {
      const loadingBtn = page.locator(selectors.loadingButton)
      if (visible) {
        await expect(loadingBtn).toBeVisible()
      } else {
        await expect(loadingBtn).toHaveCount(0)
      }
    },

    async expectWordCounter(text: string) {
      await expect(page.locator(selectors.wordCounter)).toContainText(text)
    },

    async expectResult(text: string) {
      await expect(page.locator(selectors.resultDisplay)).toContainText(text)
    },

    async expectFooterSlot() {
      await expect(page.locator(selectors.customFooterBtn)).toBeVisible()
    },

    async clickCustomFooterBtn() {
      await page.locator(selectors.customFooterBtn).click()
    },

    async wait(ms: number) {
      await page.waitForTimeout(ms)
    },
  }
}
