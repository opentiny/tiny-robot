import { expect, test } from '@playwright/experimental-ct-vue'
import ExtensionManagerNamespaceFixture from './ExtensionManagerNamespace.fixture.vue'

test.describe('ExtensionManager namespace', () => {
  test('installs Manager, Card, and CardGrid through the namespace plugin', async ({ mount }) => {
    const component = await mount(ExtensionManagerNamespaceFixture)

    await expect(component.getByTestId('manager-surface')).toBeVisible()
    await expect(component.getByTestId('manager-name')).toHaveText('TrExtensionManager')
    await expect(component.getByTestId('card-name')).toHaveText('TrExtensionCard')
    await expect(component.getByTestId('card-grid-name')).toHaveText('TrExtensionCardGrid')
    await expect(component.getByTestId('manager-registration')).toHaveText('true')
  })

  test('keeps Card and CardGrid independently installable', async ({ mount }) => {
    const component = await mount(ExtensionManagerNamespaceFixture)

    await expect(component.getByTestId('card-registration')).toHaveText('true')
    await expect(component.getByTestId('card-grid-registration')).toHaveText('true')
  })
})
