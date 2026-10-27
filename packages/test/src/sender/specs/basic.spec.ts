import { expect, test, type Page } from '@playwright/test'
import { createSenderTestHelper } from '../helpers'

test.describe('Sender 组件测试', () => {
  test.describe.configure({ mode: 'serial' })

  let page: Page
  let helper: ReturnType<typeof createSenderTestHelper>

  test.beforeEach(async ({ page: currentPage }) => {
    page = currentPage
    await page.goto('/')
    await page.click('text=Sender 组件')
    helper = createSenderTestHelper(page)
    await helper.clearContent()
  })

  test('基础功能: 应该能够输入和提交内容', async () => {
    await helper.typeContent('测试内容')
    await helper.expectEditorContent('测试内容')

    await helper.clickSubmit()
    await helper.expectResult('提交内容')
  })

  test('Props: clearable - 应该正确控制清空按钮显示', async () => {
    await helper.typeContent('测试')
    await helper.expectClearButtonVisible(false)

    await helper.toggleClearable()
    await helper.expectClearButtonVisible(true)

    await helper.clickClear()
    await helper.expectEditorEmpty()
  })

  test('Props: mode - 应该支持单行和多行模式切换', async () => {
    await helper.toggleMode()
    await helper.expectResult('模式切换为: multiple')

    await helper.toggleMode()
    await helper.expectResult('模式切换为: single')
  })

  test('Props: loading - 应该正确显示加载状态', async () => {
    await helper.typeContent('测试内容')
    await helper.toggleLoading()
    await helper.wait(10)

    await helper.expectLoadingButtonVisible(true)
  })

  test('Props: hasExternalContent - 应该支持仅外部内容提交', async () => {
    await helper.expectEditorEmpty()
    await helper.expectSubmitButtonVisible(false)

    await helper.toggleClearable()
    await helper.expectClearButtonVisible(false)

    await helper.toggleExternalContent()
    await helper.expectSubmitButtonVisible(true)
    await helper.expectClearButtonVisible(false)
    await helper.expectSubmitButtonDisabled(false)

    await helper.clickSubmit()
    await helper.expectResult('提交内容:')

    const detail = await helper.getSubmitDetail()
    expect(detail).toMatchObject({
      argsLength: 2,
      textContent: '',
      structuredData: null,
      extra: null,
    })
  })

  test('Attachments: 应该作为 Sender external payload 提交', async () => {
    await helper.toggleAttachmentsSource()

    await helper.expectSubmitButtonVisible(true)
    await helper.clickSubmit()

    const detail = await helper.getSubmitDetail()
    expect(detail).toMatchObject({
      argsLength: 3,
      textContent: '',
      structuredData: null,
      extra: {
        externalPayloads: [
          {
            source: 'attachments',
            payload: [
              {
                id: 'sender-attachment',
                name: 'sender-note.txt',
                status: 'success',
              },
            ],
          },
        ],
      },
    })
  })

  test('Attachments: 卸载后应该取消注册', async () => {
    await helper.toggleAttachmentsSource()
    await helper.expectSubmitButtonVisible(true)

    await helper.toggleAttachmentsSource()
    await helper.expectSubmitButtonVisible(false)
  })

  test('Attachments: items 变为空时应该更新提交状态', async () => {
    await helper.toggleAttachmentsSource()
    await helper.expectSubmitButtonVisible(true)

    await helper.clearAttachmentsSourceItems()
    await helper.expectSubmitButtonVisible(false)
  })

  test('Props: disabled - 应该正确控制禁用状态', async () => {
    await helper.typeContent('测试内容')
    await helper.expectEditorContent('测试内容')

    await helper.toggleDisabled()
    await helper.wait(10)
    await helper.expectEditorContent('测试内容')

    const sender = helper.getSender()
    const isDisabled = await sender.evaluate((el) => el.classList.contains('is-disabled'))
    if (!isDisabled) {
      throw new Error('编辑器应该具有 is-disabled 类')
    }

    await helper.toggleDisabled()
  })

  test('Props: placeholder - 应该正确设置占位文本', async () => {
    await helper.setPlaceholder('请输入新的内容...')
    await helper.wait(10)

    await helper.typeContent('测试')
    await helper.expectEditorContent('测试')
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

  test('Props: submitType - 应该支持不同的提交方式', async () => {
    await helper.typeContent('Enter提交')
    await helper.expectEditorContent('Enter提交')
    await helper.getEditor().click()
    await page.keyboard.press('Enter')
    await helper.expectResultExact('提交内容: Enter提交')

    await helper.clearContent()
    await helper.setSubmitType('ctrlEnter')
    await helper.wait(50)

    await helper.typeContent('Ctrl+Enter提交')
    await helper.expectEditorContent('Ctrl+Enter提交')
    await helper.getEditor().click()
    await page.keyboard.press('Enter')
    await helper.expectResult('提交内容: Enter提交')

    await helper.getEditor().click()
    await page.keyboard.press('Control+Enter')
    await helper.expectResultExact('提交内容: Ctrl+Enter提交')
  })

  test('Props: size - 应该支持不同的组件尺寸', async () => {
    await helper.toggleSize()
    await helper.expectResult('尺寸切换为: small')

    await helper.toggleSize()
    await helper.expectResult('尺寸切换为: normal')
  })

  test('Props: maxLength - 超出限制时应该标记超限并禁用提交', async () => {
    await helper.setMaxLength(10)
    await helper.wait(10)

    await helper.typeContent('这是一段超过十个字符的测试内容')
    await helper.expectWordCounter('15')
    await helper.expectWordCounter('/10')
    await helper.expectSubmitButtonDisabled(true)
  })

  test('Props: maxLength & showWordLimit - 应该显示字数统计', async () => {
    await helper.toggleMode()
    await helper.expectResult('模式切换为: multiple')

    await helper.typeContent('测试')
    await helper.expectWordCounter('/')
  })

  test('Methods: setContent - 应该能够通过方法设置内容', async () => {
    await helper.setContent()
    await helper.expectResult('已设置内容')
    await helper.expectEditorContent('测试内容')
  })

  test('Methods: getContent - 应该能够通过方法获取内容', async () => {
    await helper.typeContent('获取测试')
    await helper.getContent()
    await helper.expectResult('当前内容:')
  })

  test('Slots: footer - 应该正确显示底部插槽内容', async () => {
    await helper.toggleMode()
    await helper.expectFooterSlot()

    await helper.clickCustomFooterBtn()
    await helper.expectResult('自定义按钮被点击')
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

  test('Emits: submit - 应该正确触发提交事件', async () => {
    await helper.typeContent('提交测试')
    await helper.clickSubmit()
    await helper.expectResult('提交内容: 提交测试')
  })

  test('Emits: clear - 应该正确触发清空事件', async () => {
    await helper.toggleClearable()
    await helper.typeContent('清空测试')

    await helper.clickClear()
    await helper.expectResult('内容已清空')
    await helper.expectEditorEmpty()
  })

  test('Emits: cancel - 应该在 loading 状态下触发取消事件', async () => {
    await helper.typeContent('取消测试')
    await helper.toggleLoading()
    await helper.wait(10)

    await page.locator(helper.selectors.loadingButton).click()
    await helper.expectResult('取消操作')
  })

  test('Methods: focus - 应该能够通过方法聚焦编辑器', async () => {
    await helper.focusEditor()
    await helper.expectResult('调用 focus 方法')

    await page.keyboard.type('聚焦测试')
    await helper.expectEditorContent('聚焦测试')
  })

  test('Methods: blur - 应该能够通过方法失焦编辑器', async () => {
    await helper.focusEditor()
    await helper.wait(10)

    await helper.blurEditor()
    await helper.expectResult('调用 blur 方法')
  })

  test('Methods: clear - 应该能够通过方法清空内容', async () => {
    await helper.typeContent('清空方法测试')
    await helper.expectEditorContent('清空方法测试')

    await helper.clearEditor()
    await helper.expectResult('调用 clear 方法')
    await helper.expectEditorEmpty()
  })

  test('Methods: submit - 应该能够通过方法提交内容', async () => {
    await helper.typeContent('提交方法测试')

    await helper.submitEditor()
    await helper.expectResult('调用 submit 方法')
  })

  test('Props: autoSize - 应该在多行模式下自动调整高度', async () => {
    await helper.toggleMode()
    await helper.expectMode('multiple')

    const editor = helper.getEditor()
    const initialHeight = await editor.evaluate((el) => el.getBoundingClientRect().height)

    await helper.typeContent('第一行')
    await page.keyboard.press('Control+Enter')
    await page.keyboard.type('第二行')
    await page.keyboard.press('Control+Enter')
    await page.keyboard.type('第三行')

    await helper.expectEditorContent('第一行')
    await helper.expectEditorContent('第二行')
    await helper.expectEditorContent('第三行')

    await expect
      .poll(async () => editor.evaluate((el) => el.getBoundingClientRect().height))
      .toBeGreaterThan(initialHeight)
  })

  test('交互: 单行模式下按换行键应自动切换到多行模式', async () => {
    await expect(helper.getSender()).toHaveClass(/tr-sender--single/)

    const modeDisplay = await page.locator(helper.selectors.modeDisplay).textContent()
    if (modeDisplay !== 'single') {
      await helper.toggleMode()
      await helper.expectMode('single')
      await expect(helper.getSender()).toHaveClass(/tr-sender--single/)
    }

    await helper.typeContent('测试自动切换')
    await page.keyboard.press('Control+Enter')

    await expect(helper.getSender()).toHaveClass(/tr-sender--multiple/)
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

  test('边界: 快速连续输入和删除应该正常工作', async () => {
    await helper.typeContent('快速输入测试')
    await helper.expectEditorContent('快速输入测试')

    await helper.clearContent()
    await helper.expectEditorEmpty()

    await helper.typeContent('再次输入')
    await helper.expectEditorContent('再次输入')
  })
})
