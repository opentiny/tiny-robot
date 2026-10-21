import { test, type Page } from '@playwright/test'
import { createSenderTestHelper } from '../../helpers'
import { createTemplateTestHelper } from '../../helpers/template-helper'

test.describe('Template Block - Backspace 删除逻辑', () => {
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

  test('TC-BS-01: 应该能够删除模板块内的字符', async () => {
    await templateHelper.setSimpleTemplate()
    await templateHelper.focusTemplateEnd(0)
    await templateHelper.pressBackspace()
    await templateHelper.expectTemplateText(0, '张')
  })

  test('TC-BS-02: 删除最后一个字符时应该保留模板块', async () => {
    await templateHelper.setSimpleTemplate()
    await templateHelper.focusTemplateEnd(0)
    await templateHelper.pressBackspace()
    await templateHelper.pressBackspace()
    await templateHelper.expectTemplateCount(1)
  })

  test('TC-BS-03: 空模板块内按 Backspace 应该跳出模板块', async () => {
    await templateHelper.setEmptyTemplate()
    await templateHelper.clickTemplate(0)
    await templateHelper.wait(100)
    await templateHelper.pressBackspace()
    await templateHelper.expectTemplateCount(1)
  })

  test('TC-BS-04: 模板块开头按 Backspace 应该跳出且不吸入文本', async () => {
    await templateHelper.setSimpleTemplate()
    await templateHelper.focusTemplateStart(0)
    await templateHelper.pressBackspace()
    await templateHelper.expectEditorToContainText('我是')
    await templateHelper.expectTemplateCount(1)
  })

  test('TC-BS-05: 从模板块右侧按 Backspace 应该进入模板块', async () => {
    await templateHelper.setSimpleTemplate()
    await helper.getEditor().click()
    await templateHelper.wait(100)
    await helper.getEditor().press('End')
    await templateHelper.pressArrowLeft(3)
    await templateHelper.pressBackspace()

    await templateHelper.expectTemplateCount(1)
    await templateHelper.expectTemplateText(0, '张三')
  })

  test('TC-BS-06: 从右侧删除空模板块需要多次操作', async () => {
    await templateHelper.setEmptyTemplate()
    await templateHelper.clickTemplate(0)
    await templateHelper.wait(100)
    await templateHelper.pressArrowRight()
    await templateHelper.wait(50)

    for (let i = 0; i < 4; i++) {
      if ((await templateHelper.getTemplateCount()) === 0) {
        break
      }
      await templateHelper.pressBackspace()
      await templateHelper.wait(100)
    }

    await templateHelper.expectTemplateCount(0)
  })

  test('TC-BS-07: 选区删除应该包含模板块', async () => {
    await templateHelper.setSimpleTemplate()
    await helper.getEditor().click()
    await templateHelper.selectText()
    await templateHelper.pressBackspace()

    await helper.expectEditorEmpty()
    await templateHelper.expectTemplateCount(0)
  })
})
