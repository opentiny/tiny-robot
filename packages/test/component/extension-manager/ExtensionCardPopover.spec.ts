import { expect, test } from '@playwright/experimental-ct-vue'
import ExtensionCardPopoverFixture from './ExtensionCardPopover.fixture.vue'

test.describe('ExtensionCardPopover asChild CT', () => {
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
})
