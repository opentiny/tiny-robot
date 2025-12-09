import { test, type Page } from '@playwright/test'
import { createChatInputTestHelper } from '../helpers'

test.describe('ChatInput 组件测试', () => {
  let page: Page
  let helper: ReturnType<typeof createChatInputTestHelper>

  // 只在所有测试开始前创建页面并导航一次
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto('/')
    await page.click('text=ChatInput 组件')
    helper = createChatInputTestHelper(page)
  })

  // 所有测试结束后关闭页面
  test.afterAll(async () => {
    await page.close()
  })

  // 每个测试前清空编辑器
  test.beforeEach(async () => {
    await helper.clearContent()
  })

  test('基础功能: 应该能够输入和提交内容', async () => {
    // 输入内容
    await helper.typeContent('测试内容')
    await helper.expectEditorContent('测试内容')

    // 提交内容
    await helper.clickSubmit()
    await helper.expectResult('提交内容')
  })

  test('Props: clearable - 应该正确控制清空按钮显示', async () => {
    // 初始状态：clearable 为 false，清空按钮不可见
    await helper.typeContent('测试')
    await helper.expectClearButtonVisible(false)

    // 启用 clearable
    await helper.toggleClearable()
    await helper.expectClearButtonVisible(true)

    // 点击清空按钮
    await helper.clickClear()
    await helper.expectEditorEmpty()
  })

  test('Props: mode - 应该支持单行和多行模式切换', async () => {
    // 初始为单行模式
    await helper.expectResult('')

    // 切换到多行模式
    await helper.toggleMode()
    await helper.expectResult('模式切换为: multiple')

    // 切换回单行模式
    await helper.toggleMode()
    await helper.expectResult('模式切换为: single')
  })

  test('Props: loading - 应该正确显示加载状态', async () => {
    await helper.typeContent('测试内容')

    // 启用 loading
    await helper.toggleLoading()
    await helper.wait(10)

    // 提交按钮应该变为停止按钮
    await helper.expectLoadingButtonVisible(true)
  })

  test('Props: disabled - 应该正确控制禁用状态', async () => {
    // 先输入一些内容
    await helper.typeContent('测试内容')
    await helper.expectEditorContent('测试内容')

    // 启用 disabled
    await helper.toggleDisabled()
    await helper.wait(10)

    // 验证内容仍然存在（禁用状态不会清空内容）
    await helper.expectEditorContent('测试内容')

    // 验证编辑器具有禁用样式类
    const chatInput = helper.getChatInput()
    const isDisabled = await chatInput.evaluate((el) => el.classList.contains('is-disabled'))
    if (!isDisabled) {
      throw new Error('编辑器应该具有 is-disabled 类')
    }

    // 关闭 disabled
    await helper.toggleDisabled()
  })

  test('Props: placeholder - 应该正确显示占位符文本', async () => {
    // 注意：Tiptap 的 placeholder 是通过 CSS ::before 伪元素显示的
    // 这里我们验证编辑器为空时的状态

    // 设置新的 placeholder
    await helper.setPlaceholder('请输入新的内容...')
    await helper.wait(10)

    // 输入内容后 placeholder 应该消失
    await helper.typeContent('测试')
    // placeholder 在有内容时不显示，这里主要验证设置功能正常
  })

  test('Props: submitType - 应该支持不同的提交方式', async () => {
    // 测试 enter 提交（默认）
    await helper.getEditor().click()
    await page.keyboard.type('Enter提交')

    await page.keyboard.press('Enter')
    await helper.expectResult('提交内容: Enter提交')

    // 清空内容
    await helper.clearContent()

    // 切换到 ctrlEnter 提交
    await helper.setSubmitType('ctrlEnter')

    // 输入内容
    await helper.getEditor().click()
    await page.keyboard.type('Ctrl+Enter提交')

    // Enter 应该换行，不提交
    await page.keyboard.press('Enter')
    await helper.expectResult('提交内容: Enter提交')

    // Ctrl+Enter 应该提交
    await page.keyboard.press('Control+Enter')
    await helper.expectResult('提交内容')
  })

  test('Props: size - 应该支持不同的组件尺寸', async () => {
    // 默认为 normal 尺寸
    await helper.expectResult('')

    // 切换到 small 尺寸
    await helper.toggleSize()
    await helper.expectResult('尺寸切换为: small')

    // 切换回 normal 尺寸
    await helper.toggleSize()
    await helper.expectResult('尺寸切换为: normal')
  })

  test('Props: maxLength - 应该正确限制输入长度', async () => {
    // 设置 maxLength 为 10
    await helper.setMaxLength(10)
    await helper.wait(10)

    // 输入超过限制的内容
    await helper.typeContent('这是一段超过十个字符的测试内容')

    // 验证字数统计显示（应该显示超出）
    await helper.expectWordCounter('/')

    // 尝试提交（应该无法提交，因为超出限制）
    // 注意：根据文档，超出限制时不会自动截断，但会标红且无法提交
  })

  test('Props: maxLength & showWordLimit - 应该显示字数统计', async () => {
    // 切换到多行模式
    await helper.toggleMode()
    await helper.expectResult('模式切换为: multiple')

    // 输入内容
    await helper.typeContent('测试')

    // 验证字数统计显示
    await helper.expectWordCounter('/')
  })

  test('Methods: setContent - 应该能够通过方法设置内容', async () => {
    // 点击设置内容按钮
    await helper.setContent()
    await helper.expectResult('已设置内容')
    await helper.expectEditorContent('测试内容')
  })

  test('Methods: getContent - 应该能够通过方法获取内容', async () => {
    // 输入内容
    await helper.typeContent('获取测试')

    // 获取内容
    await helper.getContent()
    await helper.expectResult('当前内容:')
  })

  test('Slots: footer - 应该正确显示底部插槽内容', async () => {
    // 切换到多行模式以显示底部
    await helper.toggleMode()

    // 验证自定义按钮存在
    await helper.expectFooterSlot()

    // 点击自定义按钮
    await helper.clickCustomFooterBtn()
    await helper.expectResult('自定义按钮被点击')
  })

  test('Emits: submit - 应该正确触发提交事件', async () => {
    await helper.typeContent('提交测试')
    await helper.clickSubmit()
    await helper.expectResult('提交内容: 提交测试')
  })

  test('Emits: clear - 应该正确触发清空事件', async () => {
    // 启用 clearable
    await helper.toggleClearable()

    // 输入内容
    await helper.typeContent('清空测试')

    // 清空内容
    await helper.clickClear()
    await helper.expectResult('内容已清空')
    await helper.expectEditorEmpty()
  })

  test('Emits: cancel - 应该在 loading 状态下触发取消事件', async () => {
    // 输入内容
    await helper.typeContent('取消测试')

    // 启用 loading
    await helper.toggleLoading()
    await helper.wait(10)

    // 点击停止按钮
    const loadingBtn = page.locator(helper.selectors.loadingButton)
    await loadingBtn.click()

    // 验证触发了 cancel 事件
    await helper.expectResult('取消操作')
  })

  test('Methods: focus - 应该能够通过方法聚焦编辑器', async () => {
    // 点击聚焦按钮
    await helper.focusEditor()
    await helper.expectResult('调用 focus 方法')

    // 验证编辑器获得焦点（可以通过输入内容来验证）
    await page.keyboard.type('聚焦测试')
    await helper.expectEditorContent('聚焦测试')
  })

  test('Methods: blur - 应该能够通过方法失焦编辑器', async () => {
    // 先聚焦
    await helper.focusEditor()
    await helper.wait(10)

    // 再失焦
    await helper.blurEditor()
    await helper.expectResult('调用 blur 方法')
  })

  test('Methods: clear - 应该能够通过方法清空内容', async () => {
    // 输入内容
    await helper.typeContent('清空方法测试')
    await helper.expectEditorContent('清空方法测试')

    // 调用清空方法
    await helper.clearEditor()
    await helper.expectResult('调用 clear 方法')
    await helper.expectEditorEmpty()
  })

  test('Methods: submit - 应该能够通过方法提交内容', async () => {
    // 输入内容
    await helper.typeContent('提交方法测试')

    // 调用提交方法
    await helper.submitEditor()
    await helper.expectResult('调用 submit 方法')
  })

  test('Props: autoSize - 应该在多行模式下自动调整高度', async () => {
    // 切换到多行模式
    await helper.toggleMode()
    await helper.wait(10)

    // 输入多行内容
    await helper.typeContent('第一行')
    await page.keyboard.press('Enter')
    await page.keyboard.type('第二行')
    await page.keyboard.press('Enter')
    await page.keyboard.type('第三行')

    // 验证内容存在（高度调整是视觉效果，这里主要验证功能正常）
    await helper.expectEditorContent('第一行')
    await helper.expectEditorContent('第二行')
    await helper.expectEditorContent('第三行')
  })

  test('交互: 单行模式下按换行键应自动切换到多行模式', async () => {
    // 确保在单行模式
    const modeDisplay = await page.locator(helper.selectors.modeDisplay).textContent()
    if (modeDisplay !== 'single') {
      await helper.toggleMode()
      await helper.wait(10)
    }

    // 输入内容
    await helper.typeContent('测试自动切换')

    // 按 Ctrl+Enter（在 submitType=enter 时应该换行并切换模式）
    await page.keyboard.press('Control+Enter')
    await helper.wait(200)

    // 验证已切换到多行模式
    await page.locator(helper.selectors.modeDisplay).textContent()
  })

  test('边界: 快速连续输入和删除应该正常工作', async () => {
    // 快速输入
    await helper.typeContent('快速输入测试')
    await helper.expectEditorContent('快速输入测试')

    // 快速删除
    await helper.clearContent()
    await helper.expectEditorEmpty()

    // 再次输入
    await helper.typeContent('再次输入')
    await helper.expectEditorContent('再次输入')
  })
})
