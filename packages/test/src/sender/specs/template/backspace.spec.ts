import { test, type Page } from '@playwright/test'
import { createSenderTestHelper } from '../../helpers'
import { createTemplateTestHelper } from '../../helpers/template-helper'

test.describe('Template Block - Backspace 删除逻辑', () => {
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
    await templateHelper.clearTemplates()
  })

  test('TC-BS-01: 应该能够删除模板块内的字符', async () => {
    await templateHelper.setSimpleTemplate()
    await templateHelper.expectTemplateCursor(0, 'end')
    await templateHelper.pressBackspace()
    await templateHelper.expectTemplateText(0, '张')
    await templateHelper.expectTemplateCursor(0, 'end')
  })

  test('TC-BS-02: 删除最后一个字符时应该保留模板块', async () => {
    await templateHelper.setSimpleTemplate()
    await templateHelper.expectTemplateCursor(0, 'end')
    await templateHelper.pressBackspace()
    await templateHelper.pressBackspace()
    await templateHelper.expectTemplateCount(1)
    await templateHelper.expectNormalizedEditorText('我是，来自')
  })

  test('TC-BS-03: 空模板块内按 Backspace 应该跳出模板块', async () => {
    await templateHelper.setEmptyTemplate()
    await templateHelper.expectTemplateCursor(0, 'end')
    await templateHelper.pressBackspace()
    await templateHelper.expectTemplateCount(1)
    await templateHelper.expectTemplateCursor(0, 'before')
    await templateHelper.expectNormalizedEditorText('我是，来自')
  })

  test('TC-BS-04: 模板块开头按 Backspace 应该跳出且不吸入文本', async () => {
    await templateHelper.setSimpleTemplate()
    await templateHelper.expectTemplateCursor(0, 'end')
    await templateHelper.focusTemplateAt(0, 'start')
    await templateHelper.pressBackspace()
    await templateHelper.expectEditorToContainText('我是')
    await templateHelper.expectTemplateCount(1)
    await templateHelper.expectTemplateCursor(0, 'before')
    await templateHelper.expectNormalizedEditorText('我是张三，来自')
  })

  test('TC-BS-05: 从模板块右侧按 Backspace 应该进入模板块', async () => {
    await templateHelper.setSimpleTemplate()
    await templateHelper.expectTemplateCursor(0, 'end')
    await templateHelper.focusTemplateAt(0, 'after')
    await templateHelper.pressBackspace()

    await templateHelper.expectTemplateCount(1)
    await templateHelper.expectTemplateText(0, '张三')
    await templateHelper.expectTemplateCursor(0, 'end')
    await templateHelper.expectNormalizedEditorText('我是张三，来自')
  })

  test('TC-BS-06: 从右侧按 Backspace 应删除空模板块', async () => {
    await templateHelper.setEmptyTemplate()
    await templateHelper.expectTemplateCursor(0, 'end')
    await templateHelper.pressArrowRight()
    await templateHelper.expectTemplateCursor(0, 'after')
    await templateHelper.pressBackspace()

    await templateHelper.expectTemplateCount(0)
    await templateHelper.expectNormalizedEditorText('我是，来自')
  })

  test('TC-BS-07: 选区删除应该包含模板块', async () => {
    await templateHelper.setSimpleTemplate()
    await templateHelper.expectTemplateCursor(0, 'end')
    await templateHelper.selectText()
    await templateHelper.pressBackspace()

    await helper.expectEditorEmpty()
    await templateHelper.expectTemplateCount(0)
  })
})
