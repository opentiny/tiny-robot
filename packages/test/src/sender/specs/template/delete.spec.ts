import { test, type Page } from '@playwright/test'
import { createSenderTestHelper } from '../../helpers'
import { createTemplateTestHelper } from '../../helpers/template-helper'

test.describe('Template Block - Delete 删除逻辑', () => {
  test.describe.configure({ mode: 'serial' })

  let page: Page | undefined
  let helper: ReturnType<typeof createSenderTestHelper> | undefined
  let templateHelper: ReturnType<typeof createTemplateTestHelper> | undefined

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto('/')
    await page.click('text=Sender 组件')
    helper = createSenderTestHelper(page)
    templateHelper = createTemplateTestHelper(page)

    await helper.toggleTemplate()
    await helper.wait(300)
  })

  test.afterAll(async () => {
    if (helper) {
      await helper.toggleTemplate()
    }
    await page?.close()
  })

  test.beforeEach(async () => {
    await helper!.clearContent()
    await templateHelper!.clearTemplates()
  })

  test('TC-DL-01: 应该能够删除模板块内的字符', async () => {
    await templateHelper!.setSimpleTemplate()
    await templateHelper!.focusTemplateStart(0)
    await templateHelper!.pressDelete()
    await templateHelper!.expectTemplateText(0, '三')
  })

  test('TC-DL-02: 删除最后一个字符时应该保留模板块', async () => {
    await templateHelper!.setSimpleTemplate()
    await templateHelper!.focusTemplateStart(0)
    await templateHelper!.pressDelete()
    await templateHelper!.pressDelete()
    await templateHelper!.expectTemplateCount(1)
  })

  test('TC-DL-03: 空模板块内按 Delete 应该跳出模板块', async () => {
    await templateHelper!.setEmptyTemplate()
    await templateHelper!.clickTemplate(0)
    await templateHelper!.wait(100)
    await templateHelper!.pressDelete()
    await templateHelper!.expectTemplateCount(1)
  })

  test('TC-DL-04: 模板块末尾按 Delete 应该跳出且不吸入文本', async () => {
    await templateHelper!.setSimpleTemplate()
    await templateHelper!.focusTemplateEnd(0)
    await templateHelper!.pressDelete()

    await templateHelper!.expectEditorToContainText('，来自')
    await templateHelper!.expectTemplateCount(1)
  })

  test('TC-DL-05: 从模板块左侧按 Delete 应该进入模板块', async () => {
    await templateHelper!.setSimpleTemplate()
    await helper!.getEditor().click()
    await templateHelper!.wait(100)
    await helper!.getEditor().press('Home')
    await templateHelper!.pressArrowRight(2)
    await templateHelper!.pressDelete()

    await templateHelper!.expectTemplateCount(1)
    await templateHelper!.expectTemplateText(0, '张三')
  })

  test('TC-DL-06: 从左侧删除空模板块需要多次操作', async () => {
    await templateHelper!.setEmptyTemplate()
    await helper!.getEditor().click()
    await helper!.getEditor().press('Home')
    await templateHelper!.pressArrowRight(2)

    for (let i = 0; i < 4; i++) {
      if ((await templateHelper!.getTemplateCount()) === 0) {
        break
      }
      await templateHelper!.pressDelete()
      await templateHelper!.wait(100)
    }

    if ((await templateHelper!.getTemplateCount()) > 0) {
      await templateHelper!.pressArrowLeft(1)
      await templateHelper!.pressBackspace()
      await templateHelper!.wait(100)
    }

    await templateHelper!.expectTemplateCount(0)
    await templateHelper!.expectEditorToContainText('，来自')
  })

  test('TC-DL-07: 选区删除应该包含模板块', async () => {
    await templateHelper!.setSimpleTemplate()
    await helper!.getEditor().click()
    await templateHelper!.selectText()
    await templateHelper!.pressDelete()

    await helper!.expectEditorEmpty()
    await templateHelper!.expectTemplateCount(0)
  })
})
