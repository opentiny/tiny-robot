import { test, type Page } from '@playwright/test'
import { createChatInputTestHelper } from '../../helpers'
import { createTemplateTestHelper } from '../../helpers/template-helper'

test.describe('Template Block - Backspace 删除逻辑', () => {
  let page: Page
  let helper: ReturnType<typeof createChatInputTestHelper>
  let templateHelper: ReturnType<typeof createTemplateTestHelper>

  // 只在所有测试开始前创建页面并导航一次
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto('/')
    await page.click('text=ChatInput 组件')
    helper = createChatInputTestHelper(page)
    templateHelper = createTemplateTestHelper(page)

    // 打开 template 插件开关
    await helper.toggleTemplate()
    await helper.wait(300) // 等待组件重新渲染
  })

  // 所有测试结束后关闭页面
  test.afterAll(async () => {
    // 关闭 template 插件开关
    await helper.toggleTemplate()
    await page.close()
  })

  // 每个测试前清空编辑器
  test.beforeEach(async () => {
    await templateHelper.clearTemplates()
  })

  test('TC-BS-01: 应该能够删除模板块内的字符', async () => {
    // 设置简单模板：我是【张三】，来自
    await templateHelper.setSimpleTemplate()

    // 点击模板块，光标移到末尾
    await templateHelper.focusTemplateEnd(0)

    // 按 Backspace 删除 "三"
    await templateHelper.pressBackspace()

    // 验证：模板块变成 "张"
    await templateHelper.expectTemplateText(0, '张')
  })

  test('TC-BS-02: 删除最后一个字符时应该保留模板块', async () => {
    // 设置简单模板
    await templateHelper.setSimpleTemplate()

    // 删除 "三"
    await templateHelper.focusTemplateEnd(0)
    await templateHelper.pressBackspace()

    // 删除 "张"
    await templateHelper.pressBackspace()

    // 验证：模板块仍然存在（空模板块）
    await templateHelper.expectTemplateCount(1)
  })

  test('TC-BS-03: 空模板块内按 Backspace 应该跳出模板块', async () => {
    // 设置空模板块
    await templateHelper.setEmptyTemplate()

    // 点击进入空模板块
    await templateHelper.clickTemplate(0)
    await templateHelper.wait(100)

    // 按 Backspace
    await templateHelper.pressBackspace()

    // 验证：模板块仍然存在
    await templateHelper.expectTemplateCount(1)
  })

  test('TC-BS-04: 模板块开头按 Backspace 应该跳出不吸入文本', async () => {
    await templateHelper.setSimpleTemplate()

    // 聚焦到模板块开头
    await templateHelper.focusTemplateStart(0)

    // 按 Backspace
    await templateHelper.pressBackspace()

    // 验证：文本 "我是" 仍然在，没有被吸入模板块
    await templateHelper.expectEditorToContainText('我是')
    await templateHelper.expectTemplateCount(1)
  })

  test('TC-BS-05: 从模板块右侧按 Backspace 应该进入模板块', async () => {
    await templateHelper.setSimpleTemplate()

    // 点击模板块后的文本
    await helper.getEditor().click()
    await templateHelper.wait(100)
    // 确保光标在 "，来自" 的开头（模板块后）
    await helper.getEditor().press('End')
    await templateHelper.pressArrowLeft(3) // 左移 3 次到逗号前

    // 按 Backspace - 应该进入模板块
    await templateHelper.pressBackspace()

    // 验证：模板块仍然存在且内容完整
    await templateHelper.expectTemplateCount(1)
    await templateHelper.expectTemplateText(0, '张三')
  })

  test('TC-BS-06: 从右侧删除空模板块需要多次操作', async () => {
    await templateHelper.setEmptyTemplate()

    // 点击进入编辑器，定位到模板块后
    await helper.getEditor().click()
    await helper.getEditor().press('End')
    await templateHelper.pressArrowLeft(3) // 移到逗号前（模板块后）

    // 第一次 Backspace - 进入空模板块
    await templateHelper.pressBackspace()
    await templateHelper.wait(50)

    // 第二次 Backspace - 跳出到模板块前
    await templateHelper.pressBackspace()
    await templateHelper.wait(50)

    // 第三次 Backspace - 删除整个空模板块
    await templateHelper.pressBackspace()
    await templateHelper.wait(100)

    // 验证：模板块被删除
    await templateHelper.expectTemplateCount(0)
  })

  test('TC-BS-07: 选区删除应该包含模板块', async () => {
    await templateHelper.setSimpleTemplate()

    // 全选内容
    await helper.getEditor().click()
    await templateHelper.selectText()

    // 按 Backspace 删除
    await templateHelper.pressBackspace()

    // 验证：所有内容被删除
    await helper.expectEditorEmpty()
    await templateHelper.expectTemplateCount(0)
  })
})
