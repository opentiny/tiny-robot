import { expect, test } from '@playwright/experimental-ct-vue'
import ExtensionCardPopoverFixture from './ExtensionCardPopover.fixture.vue'

test.describe('ExtensionCardPopover CT', () => {
  test('默认触发器暴露浮层状态并可以通过键盘打开', async ({ mount }) => {
    const component = await mount(ExtensionCardPopoverFixture)
    const trigger = component.getByRole('button', { name: '默认触发器' })
    const controlledPopoverId = await trigger.getAttribute('aria-controls')

    expect(controlledPopoverId).toBeTruthy()
    await expect(component.locator(`#${controlledPopoverId}`)).toContainText('默认触发器内容')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await trigger.focus()
    await expect(trigger).toBeFocused()

    await trigger.press('Enter')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
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

    await expect(component.locator('[popover]')).toHaveCount(0)
    await expect(component.locator('[popovertarget]')).toHaveCount(0)
    await expect(component.locator('[popovertargetaction]')).toHaveCount(0)

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
