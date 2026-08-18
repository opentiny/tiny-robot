import { expect, test } from '@playwright/experimental-ct-vue'
import ExtensionCardFixture from './ExtensionCard.fixture.vue'

test.describe('standalone ExtensionCard', () => {
  test('renders direct presentation props without an item', async ({ mount }) => {
    const component = await mount(ExtensionCardFixture)
    const card = component.getByTestId('presentation-card')

    await expect(card.locator('.tr-extension-card__name')).toHaveText('Item name')
    await expect(card.locator('.tr-extension-card__description')).toHaveText('Item description')
    await expect(card.locator('img')).toHaveAttribute('src', 'https://example.com/item-icon.png')
    await expect(card.locator('img')).toHaveAttribute('alt', 'Item name')
  })

  test('renders a component icon without an image element', async ({ mount }) => {
    const component = await mount(ExtensionCardFixture)
    const card = component.getByTestId('component-icon-card')

    await expect(card.locator('img')).toHaveCount(0)
    await expect(card.locator('svg')).toHaveCount(1)
  })

  test('filters hidden actions before partitioning and keeps disabled slots in the primary region', async ({
    mount,
  }) => {
    const component = await mount(ExtensionCardFixture)
    const card = component.getByTestId('actions-card')
    const primaryRegion = card.locator('.tr-extension-card-primary-actions')
    const overflowRegion = card.locator('.tr-extension-card__more-action')
    const overflowMenu = overflowRegion.locator('.tr-extension-card__more-menu')

    await expect(primaryRegion.getByRole('checkbox', { name: '启用扩展' })).toBeVisible()
    await expect(primaryRegion.getByRole('button', { name: '禁用操作' })).toBeDisabled()
    await expect(primaryRegion.getByRole('button', { name: '隐藏操作' })).toHaveCount(0)
    await expect(primaryRegion.getByRole('button', { name: '安装' })).toHaveCount(0)
    await expect(primaryRegion.getByRole('button', { name: '检查' })).toHaveCount(0)
    await expect(overflowRegion.getByRole('button', { name: '扩展操作' })).toBeVisible()
    await expect(overflowMenu).toBeHidden()

    await overflowRegion.getByRole('button', { name: '扩展操作' }).click()
    await expect(primaryRegion.getByRole('checkbox', { name: '启用扩展' })).toBeVisible()
    await expect(primaryRegion.getByRole('button', { name: '禁用操作' })).toBeDisabled()
    await expect(primaryRegion.getByRole('button', { name: '安装' })).toHaveCount(0)
    await expect(primaryRegion.getByRole('button', { name: '检查' })).toHaveCount(0)
    await expect(overflowMenu).toBeVisible()
    await expect(overflowMenu.getByRole('button', { name: '安装' })).toBeVisible()
    await expect(overflowMenu.getByRole('button', { name: '检查' })).toBeVisible()
    await expect(overflowMenu.getByRole('checkbox', { name: '启用扩展' })).toHaveCount(0)
    await expect(overflowMenu.getByRole('button', { name: '禁用操作' })).toHaveCount(0)
    await expect(overflowMenu.getByRole('button', { name: '隐藏操作' })).toHaveCount(0)
  })

  test('falls back to a normal button for a custom primary action without a slot', async ({ mount }) => {
    const component = await mount(ExtensionCardFixture)
    const card = component.getByTestId('custom-fallback-card')

    await expect(card.getByRole('button', { name: '自定义操作' })).toBeVisible()
    await card.getByRole('button', { name: '自定义操作' }).click()
    await expect(component.getByTestId('event-id')).toHaveText('fallback')
    await expect(component.getByTestId('event-type')).toHaveText('custom')
  })

  test('uses overflowMenuLabel and emits switch state from the overflow menu', async ({ mount }) => {
    const component = await mount(ExtensionCardFixture)
    const card = component.getByTestId('overflow-switch-card')
    const trigger = card.getByRole('button', { name: '扩展操作' })

    await expect(trigger).toBeVisible()
    await expect(trigger).toHaveAttribute('title', '扩展操作')
    await trigger.click()

    const switchItem = card.getByRole('button', { name: '停止跟踪更新' })

    await expect(switchItem).toHaveAttribute('aria-pressed', 'true')
    await expect(switchItem.locator('.tr-extension-card__more-menu-item-check')).toHaveCount(0)
    await switchItem.click()
    await expect(component.getByTestId('event-id')).toHaveText('overflow-enabled')
    await expect(component.getByTestId('event-type')).toHaveText('switch')
    await expect(component.getByTestId('event-checked')).toHaveText('false')

    await trigger.click()
    await expect(card.getByRole('button', { name: '跟踪更新' })).toHaveAttribute('aria-pressed', 'false')
  })

  test('renders custom overflow actions as buttons and keeps danger styling', async ({ mount }) => {
    const component = await mount(ExtensionCardFixture)
    const card = component.getByTestId('overflow-switch-card')

    await card.getByRole('button', { name: '扩展操作' }).click()

    const customItem = card.getByRole('button', { name: '自定义溢出操作' })
    const dangerItem = card.getByRole('button', { name: '危险操作' })

    await expect(customItem).toBeVisible()
    await expect(dangerItem).toHaveClass(/is-danger/)
    await customItem.click()
    await expect(component.getByTestId('event-id')).toHaveText('overflow-custom')
    await expect(component.getByTestId('event-type')).toHaveText('custom')
  })

  test('hides overflow action icons while preserving labels and events', async ({ mount }) => {
    const component = await mount(ExtensionCardFixture)
    const card = component.getByTestId('overflow-without-icons-card')

    await card.getByRole('button', { name: '无图标溢出菜单' }).click()

    const menu = card.locator('.tr-extension-card__more-menu')
    await expect(menu.getByRole('button', { name: '带图标操作' })).toBeVisible()
    await expect(menu.getByRole('button', { name: '无图标操作' })).toBeVisible()
    await expect(menu.locator('svg')).toHaveCount(0)

    await menu.getByRole('button', { name: '无图标操作' }).click()
    await expect(component.getByTestId('event-id')).toHaveText('overflow-text')
    await expect(component.getByTestId('event-type')).toHaveText('button')
  })

  test('renders indeterminate and clamped determinate progress', async ({ mount }) => {
    const component = await mount(ExtensionCardFixture)

    await expect(component.getByTestId('progress-card').locator('.tr-extension-card__progress-bar')).toHaveClass(
      /is-indeterminate/,
    )
    await expect(
      component.getByTestId('high-progress-card').locator('.tr-extension-card__progress-bar'),
    ).toHaveAttribute('style', /width: 100%/)
    await expect(
      component.getByTestId('low-progress-card').locator('.tr-extension-card__progress-bar'),
    ).toHaveAttribute('style', /width: 0%/)
  })

  test('renders a non-clickable name as text', async ({ mount }) => {
    const component = await mount(ExtensionCardFixture)
    const card = component.getByTestId('presentation-card')

    await expect(card.getByRole('button', { name: 'Item name' })).toHaveCount(0)
    await expect(card.locator('.tr-extension-card__name')).toHaveText('Item name')
  })
})
