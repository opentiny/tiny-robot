import { expect, test } from '@playwright/experimental-ct-vue'
import type { Page } from '@playwright/test'
import SenderLayoutFixture from '../../src/sender/index.vue'
import { createSenderTestHelper } from '../../src/sender/helpers'

test.describe('Sender upstream layout regressions', () => {
  let page: Page
  let helper: ReturnType<typeof createSenderTestHelper>

  test.beforeEach(async ({ mount, page: currentPage }) => {
    page = currentPage
    await mount(SenderLayoutFixture)
    helper = createSenderTestHelper(page)
    await helper.clearContent()
  })

  test('Props: placeholder - 多行模式下应支持换行且不产生纵向溢出', async () => {
    await helper.toggleMode()
    await helper.expectMode('multiple')

    const placeholderText = '请输入内容 MixedPlaceholderWithoutSpaces0123456789，支持换行\n第二行占位提示文本。'.repeat(
      4,
    )
    await helper.setPlaceholder(placeholderText)

    const placeholder = page.locator('.tr-sender-placeholder')
    await expect(placeholder).toBeVisible()
    await expect(placeholder).toHaveText(placeholderText)
    await expect
      .poll(() => placeholder.evaluate((element) => element.getBoundingClientRect().height))
      .toBeGreaterThan(26)

    const editorScroll = helper.getEditorScroll()
    await expect
      .poll(() => editorScroll.evaluate((element) => element.scrollHeight <= element.clientHeight + 1))
      .toBe(true)
  })

  test('Slots: input-prefix - 应该只作用于多行首行并支持交互', async () => {
    await expect(page.locator(helper.selectors.inputPrefix)).toHaveCount(0)

    await helper.toggleMode()
    await expect(page.locator(helper.selectors.inputPrefix)).toBeVisible()

    await helper.typeContent('第一行')
    await page.keyboard.press('Control+Enter')
    await page.keyboard.type('第二行')

    const paragraphIndents = await helper
      .getEditor()
      .locator('p')
      .evaluateAll((paragraphs) => paragraphs.map((paragraph) => getComputedStyle(paragraph).textIndent))

    expect(parseFloat(paragraphIndents[0])).toBeGreaterThan(0)
    expect(paragraphIndents[1]).toBe('0px')

    await page.locator(helper.selectors.inputPrefixBtn).click()
    await helper.expectResult('input-prefix 被点击')

    await helper.clearContent()
    await helper.getEditor().click()
    for (let index = 0; index < 8; index += 1) {
      await page.keyboard.type(`第${index + 1}行`)
      if (index < 7) {
        await page.keyboard.press('Control+Enter')
      }
    }

    await helper.getEditor().evaluate((element) => {
      const scrollContainer = element.closest('.tr-sender-editor-scroll')
      element.scrollTop = 0
      if (scrollContainer) {
        scrollContainer.scrollTop = 0
      }
    })

    const prefixTopBeforeScroll = await page.locator(helper.selectors.inputPrefix).evaluate((element) => {
      return element.getBoundingClientRect().top
    })

    await helper.getEditor().evaluate((element) => {
      const scrollContainer = element.closest('.tr-sender-editor-scroll')
      element.scrollTop = element.scrollHeight
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    })

    await expect
      .poll(() => page.locator(helper.selectors.inputPrefix).evaluate((element) => element.getBoundingClientRect().top))
      .toBeLessThan(prefixTopBeforeScroll)
  })

  test('Slots: 单行操作切换多行后应显示在 footer-right', async () => {
    await expect(page.locator(helper.selectors.actionsInlineBtn)).toBeVisible()
    await expect(page.locator(`${helper.selectors.footer} ${helper.selectors.actionsInlineBtn}`)).toHaveCount(0)

    await helper.toggleMode()

    await expect(page.locator(`${helper.selectors.footer} ${helper.selectors.actionsInlineBtn}`)).toBeVisible()
    await expect(page.locator(`${helper.selectors.footer} ${helper.selectors.footerRightBtn}`)).toBeVisible()
    await expect(page.locator('.tr-sender-actions-inline')).toHaveCount(0)
  })

  test('交互: 受限父容器下中文内容溢出应自动切换到多行模式', async () => {
    await helper.toggleConstrainedWidth()
    await helper.typeContent('这是一段足够长的中文内容，用于验证单行输入超出父容器宽度后能够自动切换到多行模式。')

    await expect(helper.getSender()).toHaveClass(/tr-sender--multiple/)
  })

  test('交互: 长占位文本不应触发空输入框切换布局', async () => {
    await helper.toggleConstrainedWidth()
    await helper.setPlaceholder('很长的占位提示 MixedPlaceholderWithoutSpaces0123456789'.repeat(8))

    const remainedSingle = await helper.getSender().evaluate(async (element) => {
      let stable = true
      const observer = new MutationObserver(() => {
        stable &&= element.classList.contains('tr-sender--single')
      })
      observer.observe(element, { attributes: true, attributeFilter: ['class'] })
      for (let frame = 0; frame < 10; frame += 1) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        stable &&= element.classList.contains('tr-sender--single')
      }
      observer.disconnect()
      return stable
    })
    expect(remainedSingle).toBe(true)

    await helper.typeContent('足够长的实际输入内容'.repeat(8))
    await expect(helper.getSender()).toHaveClass(/tr-sender--multiple/)
    await helper.clearContent()
    await expect(helper.getSender()).toHaveClass(/tr-sender--single/)
    await helper.expectEditorEmpty()
  })

  for (const [scenario, committedText, expectedMode] of [
    ['短候选', '你好', 'single'],
    ['长候选', '中文'.repeat(30), 'multiple'],
    ['原样拼音', 'nihao'.repeat(12), 'multiple'],
    ['取消', '', 'single'],
  ] as const) {
    test(`交互: 组合输入跨越溢出阈值后${scenario}`, async () => {
      await helper.toggleConstrainedWidth()
      await helper.getEditor().focus()
      const cdp = await page.context().newCDPSession(page)
      const preedit = 'nihao'.repeat(12)

      try {
        for (const text of [preedit, preedit + 'a', preedit.slice(0, -1), preedit]) {
          await cdp.send('Input.imeSetComposition', { text, selectionStart: text.length, selectionEnd: text.length })
          // 等待布局检测执行，才能捕获组合期间错误的重建。
          await page.evaluate(async () => {
            for (let frame = 0; frame < 3; frame += 1) {
              await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
            }
          })
          await expect(helper.getSender()).toHaveClass(/tr-sender--single/)
          await expect(helper.getEditor()).toHaveText(text)
        }

        if (committedText) {
          await cdp.send('Input.insertText', { text: committedText })
        } else {
          await cdp.send('Input.imeSetComposition', { text: '', selectionStart: 0, selectionEnd: 0 })
        }
        await expect(helper.getEditor()).toHaveText(committedText)
        await expect(helper.getSender()).toHaveClass(new RegExp(`tr-sender--${expectedMode}`))
        await helper.getContent()
        await helper.expectResultExact(`当前内容: ${committedText}`.trim())
      } finally {
        await cdp.detach()
      }
    })
  }

  test('Slots: 操作插槽应在两种模式和自动迁移后保持作用域能力', async () => {
    const button = page.locator(helper.selectors.actionsInlineBtn)
    for (const mode of ['single', 'multiple']) {
      if (mode === 'multiple') await helper.toggleMode()
      await helper.clearContent()
      await expect(button).toHaveAttribute('data-has-content', 'false')
      await helper.typeContent('ab')
      await page.keyboard.press('ArrowLeft')
      await button.click()
      await expect(helper.getEditor()).toHaveText('a插入 b')
      await expect(helper.getEditor()).toBeFocused()
      await expect(button).toHaveAttribute('data-has-content', 'true')
      await helper.toggleDisabled()
      await expect(button).toBeDisabled()
      await helper.toggleDisabled()
      await helper.toggleLoading()
      await expect(button).toBeDisabled()
      await helper.toggleLoading()
    }

    await helper.toggleMode()
    await helper.clearContent()
    await helper.toggleConstrainedWidth()
    await helper.typeContent('实际输入内容'.repeat(12))
    await expect(page.locator(`${helper.selectors.footer} ${helper.selectors.actionsInlineBtn}`)).toBeVisible()
    await helper.clearContent()
    await expect(helper.getSender()).toHaveClass(/tr-sender--single/)
    await button.click()
    await expect(helper.getEditor()).toHaveText('插入 ')
  })
})
