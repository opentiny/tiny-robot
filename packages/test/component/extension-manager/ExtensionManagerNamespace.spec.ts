import { expect, test } from '@playwright/experimental-ct-vue'
import ExtensionManagerNamespaceFixture from './ExtensionManagerNamespace.fixture.vue'

test.describe('ExtensionManager namespace', () => {
  test('exposes and installs the current Manager, Card, and CardGrid facade', async ({ mount }) => {
    const component = await mount(ExtensionManagerNamespaceFixture)

    await expect(component.getByTestId('manager-surface')).toBeVisible()
    await expect(component.getByTestId('manager-name')).toHaveText('ExtensionManager')
    await expect(component.getByTestId('card-name')).toHaveText('ExtensionCard')
    await expect(component.getByTestId('card-grid-name')).toHaveText('ExtensionCardGrid')
    await expect(component.getByTestId('manager-registration')).toHaveText('true')
    await expect(component.getByTestId('card-registration')).toHaveText('true')
    await expect(component.getByTestId('card-grid-registration')).toHaveText('true')
  })
})
