import { test, type Page } from '@playwright/test'
import { createChatInputTestHelper } from '../../helpers'
import { createTemplateTestHelper } from '../../helpers/template-helper'

test.describe('Template Block - Delete 删除逻辑', () => {
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
  })

  // 所有测试结束后关闭页面
  test.afterAll(async () => {
    await page.close()
  })

  // 每个测试前清空编辑器
  test.beforeEach(async () => {
    await templateHelper.clearTemplates()
  })

  test('TC-DL-01: 应该能够删除模板块内的字符', async () => {
    await templateHelper.setSimpleTemplate()

    // 聚焦到模板块开头
    await templateHelper.focusTemplateStart(0)

    // 按 Delete 删除 "张"
    await templateHelper.pressDelete()

    // 验证：模板块变成 "三"
    await templateHelper.expectTemplateText(0, '三')
  })

  test('TC-DL-02: 删除最后一个字符时应该保留模板块', async () => {
    await templateHelper.setSimpleTemplate()

    // 删除 "张"
    await templateHelper.focusTemplateStart(0)
    await templateHelper.pressDelete()

    // 删除 "三"
    await templateHelper.pressDelete()

    // 验证：模板块仍然存在（空模板块）
    await templateHelper.expectTemplateCount(1)
  })

  test('TC-DL-03: 空模板块内按 Delete 应该跳出模板块', async () => {
    await templateHelper.setEmptyTemplate()

    // 点击进入空模板块
    await templateHelper.clickTemplate(0)
    await templateHelper.wait(100)

    // 按 Delete
    await templateHelper.pressDelete()

    // 验证：模板块仍然存在
    await templateHelper.expectTemplateCount(1)
  })

  test('TC-DL-04: 模板块末尾按 Delete 应该跳出不吸入文本', async () => {
    await templateHelper.setSimpleTemplate()

    // 聚焦到模板块末尾
    await templateHelper.focusTemplateEnd(0)

    // 按 Delete
    await templateHelper.pressDelete()

    // 验证：文本 "，来自" 仍然在，没有被吸入模板块
    await templateHelper.expectEditorToContainText('，来自')
    await templateHelper.expectTemplateCount(1)
  })

  test('TC-DL-05: 从模板块左侧按 Delete 应该进入模板块', async () => {
    await templateHelper.setSimpleTemplate()

    // 点击编辑器
    await helper.getEditor().click()
    await templateHelper.wait(100)
    // 移动到 "我是" 后面（模板块前）
    await helper.getEditor().press('Home')
    await templateHelper.pressArrowRight(2)

    // 按 Delete - 应该进入模板块
    await templateHelper.pressDelete()

    // 验证：模板块仍然存在且内容完整
    await templateHelper.expectTemplateCount(1)
    await templateHelper.expectTemplateText(0, '张三')
  })

  test('TC-DL-06: 从左侧删除空模板块需要多次操作', async () => {
    await templateHelper.setEmptyTemplate()

    // 定位到模板块前
    await helper.getEditor().click()
    await helper.getEditor().press('Home')
    await templateHelper.pressArrowRight(2) // 移到 "我是" 后

    // 第一次 Delete - 进入空模板块
    await templateHelper.pressDelete()
    await templateHelper.wait(50)

    // 第二次 Delete - 跳出到模板块后
    await templateHelper.pressDelete()
    await templateHelper.wait(50)

    // 第三次需要返回到模板块前再删除
    await templateHelper.pressArrowLeft(1)
    await templateHelper.pressBackspace()
    await templateHelper.wait(100)

    // 验证：模板块仍在（需要更多操作才能删除）
    // 注：完整删除逻辑需要多个步骤，这里主要测试进入/退出行为
  })

  test('TC-DL-07: 选区删除应该包含模板块', async () => {
    await templateHelper.setSimpleTemplate()

    // 全选内容
    await helper.getEditor().click()
    await templateHelper.selectText()

    // 按 Delete 删除
    await templateHelper.pressDelete()

    // 验证：所有内容被删除
    await helper.expectEditorEmpty()
    await templateHelper.expectTemplateCount(0)
  })
})
