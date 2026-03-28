import { test, expect, type Page } from '@playwright/test'
import { createSenderTestHelper } from '../../helpers'
import { createTemplateTestHelper } from '../../helpers/template-helper'

test.describe('Template Block - 边界情况测试', () => {
  test.describe.configure({ mode: 'serial' })

  let page: Page
  let helper: ReturnType<typeof createSenderTestHelper>
  let templateHelper: ReturnType<typeof createTemplateTestHelper>

  test.beforeEach(async ({ page: currentPage }) => {
    page = currentPage
    await page.goto('/')
    await page.click('text=Sender 组件')
    helper = createSenderTestHelper(page)
    templateHelper = createTemplateTestHelper(page)

    await helper.toggleTemplate()
    await helper.wait(300)
    await helper.clearContent()
    await templateHelper.clearTemplates()
  })

  test('TC-BD-01: 连续模板块清空后应保留空块结构', async () => {
    await templateHelper.setMultipleTemplates()
    await templateHelper.expectTemplateCount(3)

    await templateHelper.clearAllTemplatesContent(15)
    await templateHelper.expectTemplateCount(3)
    await templateHelper.expectTemplateText(0, '')
    await templateHelper.expectTemplateText(1, '')
    await templateHelper.expectTemplateText(2, '')
  })

  test('TC-BD-02: 模板块与文本粘连检测', async () => {
    await templateHelper.setSimpleTemplate()

    await templateHelper.expectEditorToContainText('我是')
    await templateHelper.expectEditorToContainText('张三')
    await templateHelper.expectEditorToContainText('来自')
    await templateHelper.expectTemplateCount(1)
  })

  test('TC-BD-03: 应该能够在模板块内编辑内容', async () => {
    await templateHelper.setSimpleTemplate()
    await templateHelper.focusTemplateEnd(0)
    await templateHelper.pressBackspace(2)
    await templateHelper.typeInTemplate(0, '李四')
    await templateHelper.wait(100)

    await templateHelper.expectTemplateText(0, '李四')
  })

  test('TC-BD-04: 应该能够处理连续的多个模板块', async () => {
    await templateHelper.setMultipleTemplates()

    await templateHelper.expectTemplateCount(3)
    await templateHelper.expectTemplateText(0, '姓名')
    await templateHelper.expectTemplateText(1, '年龄')
    await templateHelper.expectTemplateText(2, '城市')
  })

  test('TC-BD-05: 模板块前后的空格应该保留', async () => {
    await templateHelper.setSimpleTemplate()
    const text = await templateHelper.getEditorText()

    expect(text).toContain('我是')
    expect(text).toContain('张三')
    expect(text).toContain('来自')
  })
})
