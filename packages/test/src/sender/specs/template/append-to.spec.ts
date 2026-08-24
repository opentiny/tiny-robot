import { test, expect, type Page } from '@playwright/test'
import { createSenderTestHelper } from '../../helpers'
import { createTemplateTestHelper } from '../../helpers/template-helper'

test.describe('Template Select - appendTo', () => {
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

  test('默认挂载到 body，并支持选择和关闭', async () => {
    await templateHelper.setSelectTemplate()
    await templateHelper.openTemplateSelect()

    const dropdown = page.locator(templateHelper.selectors.templateSelectDropdown)
    await expect(dropdown.evaluate((element) => element.parentElement?.tagName)).resolves.toBe('BODY')

    await dropdown.locator(templateHelper.selectors.templateSelectOption).first().click()
    await expect(templateHelper.getTemplateSelect()).toContainText('GPT-4')
    await expect(dropdown).toHaveCount(0)
  })

  test('指定选择器后挂载到目标容器，并使用 absolute 定位', async () => {
    await page.click(templateHelper.selectors.toggleTemplateAppendToBtn)
    await helper.wait(300)
    await templateHelper.setSelectTemplate()
    await templateHelper.openTemplateSelect()

    const dropdown = page.locator(templateHelper.selectors.templateSelectDropdown)
    await expect(dropdown).toHaveClass(/is-absolute/)
    await expect(dropdown.evaluate((element) => element.parentElement?.id)).resolves.toBe(
      'template-select-teleport-target',
    )

    await page.keyboard.press('Escape')
    await expect(dropdown).toHaveCount(0)
  })
})
