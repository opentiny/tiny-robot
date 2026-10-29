import { expect, test } from '@playwright/experimental-ct-vue'
import ExtensionCardGridFixture from './ExtensionCardGrid.fixture.vue'

test.describe('standalone ExtensionCardGrid', () => {
  test('renders flat items as default Cards and keeps the Grid id on the item li', async ({ mount }) => {
    const component = await mount(ExtensionCardGridFixture)
    const grid = component.getByTestId('default-grid')
    const alphaItem = grid.locator(':scope > li[data-card-id="alpha"]')
    const alphaCard = alphaItem.locator(':scope > *')

    await expect(grid).toHaveJSProperty('tagName', 'UL')
    await expect(grid.locator(':scope > li')).toHaveCount(2)
    await expect(grid.locator(':scope > li[data-card-id]')).toHaveCount(2)
    await expect(alphaItem).toHaveCount(1)
    await expect(grid.locator(':scope > li[data-card-id="alpha"]')).toHaveCount(1)
    await expect(alphaCard).toHaveCount(1)
    await expect(alphaCard.getByText('Alpha extension', { exact: true })).toBeVisible()
    await expect(alphaCard.getByText('Alpha description', { exact: true })).toBeVisible()
    await expect(alphaCard.getByRole('switch', { name: 'Enable Alpha' })).toBeVisible()
    await expect(alphaCard.getByRole('button', { name: 'Install Alpha' })).toBeVisible()
    await expect(alphaCard.getByRole('button', { name: 'Inspect Alpha' })).toBeVisible()
  })

  test('passes the full flat item and index to the item slot while retaining Grid-owned markup', async ({ mount }) => {
    const component = await mount(ExtensionCardGridFixture)
    const grid = component.getByTestId('slot-grid')
    const alphaItem = grid.locator(':scope > li[data-card-id="alpha"]')
    const betaItem = grid.locator(':scope > li[data-card-id="beta"]')

    await expect(grid).toHaveJSProperty('tagName', 'UL')
    await expect(grid.locator(':scope > li')).toHaveCount(2)
    await expect(grid.locator(':scope > li[data-card-id]')).toHaveCount(2)
    await expect(alphaItem.locator(':scope > [data-testid="slot-item-alpha"]')).toHaveCount(1)
    const alphaValue = JSON.parse((await alphaItem.getByTestId('slot-item-alpha-value').textContent()) ?? '{}')
    const betaValue = JSON.parse((await betaItem.getByTestId('slot-item-beta-value').textContent()) ?? '{}')

    expect(alphaValue.id).toBe('alpha')
    expect(alphaValue.name).toBe('Alpha extension')
    expect(alphaValue.actions?.[2]?.data).toEqual({ origin: 'grid-fixture', nested: { enabled: true } })
    await expect(alphaItem.getByTestId('slot-item-alpha-index')).toHaveText('0')
    expect(betaValue.id).toBe('beta')
    expect(betaValue.name).toBe('Beta extension')
    await expect(betaItem.getByTestId('slot-item-beta-index')).toHaveText('1')
  })

  test('uses the Grid fallback while preserving item overrides including explicit zero', async ({ mount }) => {
    const component = await mount(ExtensionCardGridFixture)
    const grid = component.getByTestId('fallback-grid')

    await expect(grid.getByRole('button', { name: 'Fallback primary' })).toHaveCount(1)
    await expect(grid.locator('[data-card-id="fallback"] [aria-label="更多操作"]')).toHaveCount(1)
    await expect(grid.getByRole('button', { name: 'Override primary 1' })).toHaveCount(1)
    await expect(grid.getByRole('button', { name: 'Override primary 2' })).toHaveCount(1)
    await expect(grid.getByRole('button', { name: 'Zero overflow' })).toHaveCount(0)
    await expect(grid.locator('[data-card-id="zero"] [aria-label="更多操作"]')).toHaveCount(1)

    const fallbackCard = grid.locator('[data-card-id="fallback"]')
    await fallbackCard.getByRole('button', { name: '更多操作' }).click()
    const fallbackMenu = fallbackCard.locator('.tr-extension-card-popover__content')
    await expect(fallbackMenu).toBeVisible()
    await expect(fallbackMenu.locator('.tr-extension-card__more-menu-item-icon-slot')).toHaveCount(1)
    await expect
      .poll(async () =>
        fallbackMenu.evaluate((element) => {
          const trigger = element.parentElement?.querySelector<HTMLButtonElement>('[popovertarget]')
          return trigger
            ? Number.parseFloat(getComputedStyle(element).top) >= trigger.getBoundingClientRect().bottom
            : false
        }),
      )
      .toBe(true)
  })

  test('uses the Grid name-clickable fallback while preserving an explicit false item override', async ({ mount }) => {
    const component = await mount(ExtensionCardGridFixture)
    const grid = component.getByTestId('name-clickable-fallback-grid')

    await expect(
      grid.locator('[data-card-id="fallback-name"]').getByRole('button', { name: 'Fallback name' }),
    ).toHaveCount(1)
    await expect(
      grid.locator('[data-card-id="disabled-name"]').getByRole('button', { name: 'Disabled name' }),
    ).toHaveCount(0)
  })

  test('uses the Card name-clickable default when the standalone Grid does not provide a fallback', async ({
    mount,
  }) => {
    const component = await mount(ExtensionCardGridFixture)
    const grid = component.getByTestId('implicit-name-clickable-grid')

    await expect(grid.getByRole('button', { name: 'Implicit name' })).toHaveCount(1)
  })

  test('uses Grid overflow fallbacks and preserves item-level label, placement, and false icon override', async ({
    mount,
  }) => {
    const component = await mount(ExtensionCardGridFixture)
    const grid = component.getByTestId('menu-fallback-grid')
    const fallbackCard = grid.locator('[data-card-id="menu-fallback"]')
    const overrideCard = grid.locator('[data-card-id="menu-override"]')

    await fallbackCard.getByRole('button', { name: 'Grid actions' }).click()
    const fallbackMenu = fallbackCard.locator('.tr-extension-card-popover__content')
    await expect(fallbackMenu).toBeVisible()
    await expect(fallbackMenu.getByRole('button', { name: 'Fallback menu action' })).toBeVisible()
    await expect(fallbackMenu.locator('.tr-extension-card__more-menu-item-icon')).toHaveCount(1)
    await expect
      .poll(async () =>
        fallbackMenu.evaluate((element) => {
          const trigger = element.parentElement?.querySelector<HTMLButtonElement>('[popovertarget]')
          return trigger
            ? Number.parseFloat(getComputedStyle(element).top) < trigger.getBoundingClientRect().top
            : false
        }),
      )
      .toBe(true)

    await overrideCard.getByRole('button', { name: 'Item actions' }).click()
    const overrideMenu = overrideCard.locator('.tr-extension-card-popover__content')
    await expect(overrideMenu).toBeVisible()
    await expect(overrideMenu.locator('.tr-extension-card__more-menu-item-icon')).toHaveCount(0)
    await expect
      .poll(async () =>
        overrideMenu.evaluate((element) => {
          const trigger = element.parentElement?.querySelector<HTMLButtonElement>('[popovertarget]')
          return trigger
            ? Number.parseFloat(getComputedStyle(element).top) >= trigger.getBoundingClientRect().bottom
            : false
        }),
      )
      .toBe(true)
  })

  test('wraps default Card actions and controlled name clicks with the item id', async ({ mount }) => {
    const component = await mount(ExtensionCardGridFixture)
    const card = component.getByTestId('default-grid').locator(':scope > li[data-card-id="alpha"] > *')

    await card.getByRole('button', { name: 'Install Alpha' }).click()
    await card.getByRole('button', { name: 'Inspect Alpha' }).click()

    await expect(component.getByTestId('action-events')).toHaveText(
      'alpha:install-alpha:button:|alpha:inspect-alpha:custom:',
    )

    await card.getByRole('button', { name: 'Alpha extension' }).click()
    await expect(component.getByTestId('name-click-item-id')).toHaveText('alpha')
  })

  test('renders one empty li and gives the empty slot precedence over emptyText', async ({ mount }) => {
    const component = await mount(ExtensionCardGridFixture)

    const defaultEmptyGrid = component.getByTestId('default-empty-grid')
    await expect(defaultEmptyGrid).toHaveJSProperty('tagName', 'UL')
    await expect(defaultEmptyGrid.locator(':scope > li')).toHaveCount(1)
    await expect(defaultEmptyGrid.locator(':scope > li')).toHaveText('暂无内容')

    const textEmptyGrid = component.getByTestId('text-empty-grid')
    await expect(textEmptyGrid).toHaveJSProperty('tagName', 'UL')
    await expect(textEmptyGrid.locator(':scope > li')).toHaveCount(1)
    await expect(textEmptyGrid.locator(':scope > li')).toHaveText('Nothing to show')

    const slotEmptyGrid = component.getByTestId('slot-empty-grid')
    await expect(slotEmptyGrid).toHaveJSProperty('tagName', 'UL')
    await expect(slotEmptyGrid.locator(':scope > li')).toHaveCount(1)
    await expect(slotEmptyGrid.getByTestId('custom-empty')).toHaveText('Custom empty slot')
    await expect(slotEmptyGrid.getByText('Fallback empty text', { exact: true })).toHaveCount(0)
  })

  test('uses the container width and card minimum-width variable to derive tracks', async ({ mount }) => {
    const component = await mount(ExtensionCardGridFixture)
    const readRenderedTrackCount = (testId: string) =>
      component.getByTestId(testId).evaluate((element) => {
        const style = getComputedStyle(element)
        if (style.display !== 'grid' || style.gridTemplateColumns === 'none') return 0

        const leftPositions = Array.from(element.children, (child) => Math.round(child.getBoundingClientRect().left))
        return new Set(leftPositions).size
      })

    await expect.poll(() => readRenderedTrackCount('default-min-width-grid')).toBe(2)
    await expect.poll(() => readRenderedTrackCount('narrow-min-width-grid')).toBe(1)
    await expect.poll(() => readRenderedTrackCount('custom-min-width-grid')).toBe(3)
  })

  test('preserves input item order', async ({ mount }) => {
    const component = await mount(ExtensionCardGridFixture)
    const itemIds = await component
      .getByTestId('default-grid')
      .locator(':scope > li[data-card-id]')
      .evaluateAll((elements) => elements.map((element) => element.getAttribute('data-card-id')))

    expect(itemIds).toEqual(['alpha', 'beta'])
  })
})
