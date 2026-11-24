import { expect, test } from '@playwright/test'
import { createSenderTestHelper } from '../../helpers'
import { createTemplateTestHelper } from '../../helpers/template-helper'

for (const side of ['before', 'after'] as const) {
  for (const index of [0, 1, 2]) {
    test(`position ${side} template block ${index} without selecting a later sibling`, async ({ page }) => {
      await page.goto('/')
      await page.click('text=Sender 组件')
      const helper = createSenderTestHelper(page)
      const templates = createTemplateTestHelper(page)
      await helper.toggleTemplate()
      await helper.wait(300)
      await helper.clearContent()
      await templates.clearTemplates()
      await templates.setMultipleTemplates()
      // Setting template data schedules autofocus; let it finish before positioning the cursor.
      await expect
        .poll(() =>
          templates.getTemplateContent(0).evaluate((element) => {
            return element.contains(window.getSelection()?.anchorNode ?? null)
          }),
        )
        .toBe(true)
      const original = await templates.getTemplates().allTextContents()

      const positioned = await page.evaluate(
        ({ side, index }) => {
          const api = window.__senderTestApi
          return side === 'before' ? api?.moveCursorBeforeTemplate(index) : api?.moveCursorAfterTemplate(index)
        },
        { side, index },
      )
      expect(positioned).toBe(true)
      await expect
        .poll(() =>
          templates.getTemplates().evaluateAll((blocks) => {
            const selection = window.getSelection()
            if (!selection?.anchorNode || !selection.isCollapsed) return []
            return blocks.map((block) => {
              const range = document.createRange()
              range.selectNodeContents(block.querySelector('.template-block__content')!)
              return range.comparePoint(selection.anchorNode!, selection.anchorOffset)
            })
          }),
        )
        .toEqual(
          [0, 1, 2].map((blockIndex) => (blockIndex < index || (side === 'after' && blockIndex === index) ? 1 : -1)),
        )
      await expect(templates.getTemplates()).toHaveText(original)
    })
  }
}
