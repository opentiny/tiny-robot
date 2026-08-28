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

  test('非法选择器回退到 body，并保持模板选择器可用', async () => {
    await page.evaluate(() => {
      window.__senderTestApi?.setTemplateAppendTo('[')
    })
    await helper.wait(300)
    await templateHelper.setSelectTemplate()
    await templateHelper.openTemplateSelect()

    const dropdown = page.locator(templateHelper.selectors.templateSelectDropdown)
    await expect(dropdown.evaluate((element) => element.parentElement?.tagName)).resolves.toBe('BODY')
  })

  for (const [name, appendTo] of [
    ['未配置 appendTo', undefined],
    ['配置 body', 'body'],
    ['配置不存在的选择器', '#template-select-missing'],
  ] as const) {
    test(`ShadowRoot 下${name}时回退到 body`, async () => {
      await page.evaluate(() => {
        const shadowHost = document.createElement('div')
        const shadowRoot = shadowHost.attachShadow({ mode: 'open' })
        document.body.appendChild(shadowHost)

        const getRootNode = Element.prototype.getRootNode
        Element.prototype.getRootNode = function (options) {
          if (this.matches('.template-select__trigger')) {
            return shadowRoot
          }
          return getRootNode.call(this, options)
        }
      })
      await page.evaluate((value) => {
        window.__senderTestApi?.setTemplateAppendTo(value)
      }, appendTo)
      await helper.wait(300)
      await templateHelper.setSelectTemplate()
      await templateHelper.openTemplateSelect()

      const dropdown = page.locator(templateHelper.selectors.templateSelectDropdown)
      await expect(dropdown.evaluate((element) => element.parentElement?.tagName)).resolves.toBe('BODY')
    })
  }
})
