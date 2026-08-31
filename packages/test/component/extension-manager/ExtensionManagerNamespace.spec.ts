import { expect, test } from '@playwright/experimental-ct-vue'
import ExtensionManagerNamespaceFixture from './ExtensionManagerNamespace.fixture.vue'

test.describe('ExtensionManager namespace', () => {
  test('exposes the namespace while Manager, Card, and CardGrid install independently', async ({ mount }) => {
    const component = await mount(ExtensionManagerNamespaceFixture)

    await expect(component.getByTestId('manager-surface')).toBeVisible()
    await expect(component.getByTestId('manager-name')).toHaveText('TrExtensionManager')
    await expect(component.getByTestId('card-name')).toHaveText('TrExtensionCard')
    await expect(component.getByTestId('card-grid-name')).toHaveText('TrExtensionCardGrid')
    await expect(component.getByTestId('manager-registration')).toHaveText('true')
    await expect(component.getByTestId('card-registration')).toHaveText('true')
    await expect(component.getByTestId('card-grid-registration')).toHaveText('true')
  })
})
