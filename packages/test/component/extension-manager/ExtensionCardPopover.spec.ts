import { expect, test } from '@playwright/experimental-ct-vue'
import ExtensionCardPopoverFixture from './ExtensionCardPopover.fixture.vue'

test.describe('ExtensionCardPopover CT', () => {
  test('默认触发器可以通过键盘打开浮层', async ({ mount }) => {
    const component = await mount(ExtensionCardPopoverFixture)
    const trigger = component.getByRole('button', { name: '默认触发器' })

    await trigger.focus()
    await expect(trigger).toBeFocused()

    await trigger.press('Enter')
    await expect(component.getByText('默认触发器内容')).toBeVisible()
  })

  test('原生元素作为唯一触发节点且能够打开浮层', async ({ mount }) => {
    const component = await mount(ExtensionCardPopoverFixture)
    const section = component.getByTestId('native-trigger-section')

    await expect(section.locator(':scope > [data-testid="native-trigger"]')).toHaveCount(1)
    await expect(section.locator(':scope > div.tr-extension-card-popover__trigger')).toHaveCount(0)

    await component.getByTestId('native-trigger').click()
    await expect(component.getByText('原生触发器内容')).toBeVisible()
  })

  test('单根 Vue 组件作为唯一触发节点且能够打开浮层', async ({ mount }) => {
    const component = await mount(ExtensionCardPopoverFixture)
    const section = component.getByTestId('component-trigger-section')

    await expect(section.locator(':scope > [data-testid="component-trigger"]')).toHaveCount(1)
    await expect(section.locator(':scope > div.tr-extension-card-popover__trigger')).toHaveCount(0)

    await component.getByTestId('component-trigger').click()
    await expect(component.getByText('组件触发器内容')).toBeVisible()
  })

  test('不支持原生 Popover API 时仍可打开，并响应 Escape 和外部点击关闭', async ({ mount, page }) => {
    await page.evaluate(() => {
      Object.defineProperties(HTMLElement.prototype, {
        showPopover: { configurable: true, value: undefined },
        hidePopover: { configurable: true, value: undefined },
        togglePopover: { configurable: true, value: undefined },
      })
    })

    const component = await mount(ExtensionCardPopoverFixture)

    await component.locator('[popover]').evaluateAll((elements) => {
      elements.forEach((element) => element.removeAttribute('popover'))
    })
    await component.locator('[popovertarget]').evaluateAll((elements) => {
      elements.forEach((element) => {
        element.removeAttribute('popovertarget')
        element.removeAttribute('popovertargetaction')
      })
    })

    const trigger = component.getByTestId('native-trigger')
    const content = component.getByText('原生触发器内容')

    await expect(content).toBeHidden()

    await trigger.click()
    await expect(content).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(content).toBeHidden()

    await trigger.click()
    await expect(content).toBeVisible()

    await component.getByTestId('outside-target').click()
    await expect(content).toBeHidden()
  })
})
