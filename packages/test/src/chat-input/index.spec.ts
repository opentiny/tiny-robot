import { test, expect, type Page } from '@playwright/test'
import { createChatInputTestHelper } from './testHelper'

test.describe('ChatInput 组件测试', () => {
  let helper: ReturnType<typeof createChatInputTestHelper>

  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/')
    await page.click('text=ChatInput 组件')
    await expect(page.locator('h2')).toContainText('ChatInput 组件测试')
    helper = createChatInputTestHelper(page)
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
    await helper.wait(100)

    // 提交按钮应该变为停止按钮
    const submitBtn = helper.getChatInput().locator('button').last()
    await expect(submitBtn).toBeVisible()
  })

  test('Props: maxLength & showWordLimit - 应该显示字数统计', async () => {
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

  test('Methods: focus - 应该能够通过方法聚焦编辑器', async () => {
    // 聚焦编辑器
    await helper.focusEditor()
    await helper.expectResult('已聚焦')

    // 验证编辑器已聚焦
    await expect(helper.getEditor()).toBeFocused()
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
    await helper.expectResult('提交内容: <p>提交测试</p>')
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
})
