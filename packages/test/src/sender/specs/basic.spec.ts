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
      meta: null,
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
      meta: {
        externalPayloads: [
          {
            sourceId: 'attachments',
            items: [
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

  test('Attachments: uploading 和 error 状态不应该作为 external payload 提交', async () => {
    const nonSuccessStatuses = ['uploading', 'error'] as const

    for (const status of nonSuccessStatuses) {
      const textContent = `text with ${status} attachment`

      await helper.setSenderAttachmentStatus(status)
      await helper.toggleAttachmentsSource()
      await helper.expectSubmitButtonVisible(false)

      await helper.typeContent(textContent)
      await helper.clickSubmit()

      const detail = await helper.getSubmitDetail()
      expect(detail).toMatchObject({
        argsLength: 2,
        textContent,
        structuredData: null,
        meta: null,
      })

      await helper.toggleAttachmentsSource()
      await helper.clearContent()
    }
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

  test('边界: 快速连续输入和删除应该正常工作', async () => {
    await helper.typeContent('快速输入测试')
    await helper.expectEditorContent('快速输入测试')

    await helper.clearContent()
    await helper.expectEditorEmpty()

    await helper.typeContent('再次输入')
    await helper.expectEditorContent('再次输入')
  })
})
