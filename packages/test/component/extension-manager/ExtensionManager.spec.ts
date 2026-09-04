import { expect, test } from '@playwright/experimental-ct-vue'
import ExtensionManagerFixture from './ExtensionManager.fixture.vue'
import ExtensionManagerUncontrolledFixture from './ExtensionManagerUncontrolled.fixture.vue'

test.describe('ExtensionManager section model', () => {
  test('derives stable installed and available sections from the active tab items', async ({ mount }) => {
    const component = await mount(ExtensionManagerFixture)
    const manager = component.getByTestId('manager-host')

    await expect(manager.locator('[data-section-key="installed"]')).toHaveCount(1)
    await expect(manager.locator('[data-section-key="available"]')).toHaveCount(1)
    await expect(
      manager.locator('section[data-section-key="installed"]').getByRole('button', { name: '已安装', exact: true }),
    ).toHaveCount(1)
    await expect(
      manager.locator('section[data-section-key="available"]').getByRole('button', { name: '可安装', exact: true }),
    ).toHaveCount(1)

    const installedIds = await manager
      .locator('[data-section-key="installed"] li[data-card-id]')
      .evaluateAll((elements) => elements.map((element) => element.getAttribute('data-card-id')))
    const availableIds = await manager
      .locator('[data-section-key="available"] li[data-card-id]')
      .evaluateAll((elements) => elements.map((element) => element.getAttribute('data-card-id')))

    expect(installedIds).toEqual(['alpha'])
    expect(availableIds).toEqual(['beta', 'gamma'])
  })

  test('keeps both sections visible and renders the empty slot for an empty derived section', async ({ mount }) => {
    const component = await mount(ExtensionManagerFixture)

    await component.getByTestId('set-active-market').click()

    const manager = component.getByTestId('manager-host')
    await expect(
      manager.locator('section[data-section-key="installed"]').getByRole('button', { name: '已安装', exact: true }),
    ).toHaveCount(1)
    await expect(
      manager.locator('section[data-section-key="available"]').getByRole('button', { name: '可安装', exact: true }),
    ).toHaveCount(1)
    await expect(manager.getByTestId('empty-slot-market-available')).toHaveText('Empty available')
  })

  test('defaults derived Cards to one primary action', async ({ mount }) => {
    const component = await mount(ExtensionManagerFixture)
    const manager = component.getByTestId('manager-host')

    await expect(manager.getByRole('button', { name: 'Install Beta' })).toHaveCount(1)
    await expect(manager.locator('[data-card-id="beta"] [aria-label="更多操作"]')).toHaveCount(1)
  })

  test('moves an item between derived sections when installed changes', async ({ mount }) => {
    const component = await mount(ExtensionManagerFixture)
    const manager = component.getByTestId('manager-host')

    await component.getByTestId('install-beta').click()

    await expect(manager.locator('[data-section-key="installed"] li[data-card-id="beta"]')).toHaveCount(1)
    await expect(manager.locator('[data-section-key="available"] li[data-card-id="beta"]')).toHaveCount(0)
  })

  test('uses default section headers and empty slot context', async ({ mount }) => {
    const component = await mount(ExtensionManagerFixture)
    const manager = component.getByTestId('manager-host')

    await expect(
      manager.locator('section[data-section-key="installed"]').getByRole('button', { name: '已安装', exact: true }),
    ).toHaveText('已安装')
    await expect(
      manager.locator('section[data-section-key="available"]').getByRole('button', { name: '可安装', exact: true }),
    ).toHaveText('可安装')

    await component.getByTestId('set-active-market').click()
    await expect(manager.getByTestId('empty-slot-context-market-available')).toHaveText('market/available/可安装')
  })

  test('keeps Manager-only metadata out of the Card/Grid item boundary', async ({ mount }) => {
    const component = await mount(ExtensionManagerFixture)

    await component.getByTestId('show-item-slot-manager').click()

    const itemSlotKeys = component.getByTestId('item-slot-manager').getByTestId('item-slot-keys')
    await expect(itemSlotKeys).toHaveCount(3)
    for (const keys of await itemSlotKeys.allTextContents()) {
      expect(JSON.parse(keys)).not.toContain('installed')
      expect(JSON.parse(keys)).not.toContain('tags')
    }
  })

  test('preserves collapse state per tab and section key', async ({ mount }) => {
    const component = await mount(ExtensionManagerFixture)
    const manager = component.getByTestId('manager-host')
    const libraryInstalled = manager
      .locator('section[data-tab-id="library"][data-section-key="installed"]')
      .getByRole('button', { name: '已安装', exact: true })
    const libraryAvailable = manager
      .locator('section[data-tab-id="library"][data-section-key="available"]')
      .getByRole('button', { name: '可安装', exact: true })

    await libraryInstalled.click()
    await expect(libraryInstalled).toHaveAttribute('aria-expanded', 'false')
    await expect(libraryAvailable).toHaveAttribute('aria-expanded', 'true')

    await component.getByTestId('set-active-market').click()
    const marketInstalled = manager
      .locator('section[data-tab-id="market"][data-section-key="installed"]')
      .getByRole('button', { name: '已安装', exact: true })
    await expect(marketInstalled).toHaveAttribute('aria-expanded', 'true')

    await marketInstalled.click()
    await component.getByTestId('set-active-library').click()
    await expect(libraryInstalled).toHaveAttribute('aria-expanded', 'false')
    await expect(manager.locator('section[data-tab-id="market"]')).toHaveCount(0)
  })

  test('routes Card action and name-click events with section keys', async ({ mount }) => {
    const component = await mount(ExtensionManagerFixture)
    const item = component.getByTestId('manager-host').locator('li[data-card-id="alpha"]')

    await item.locator('.tr-extension-card-primary-actions__switch-track').click()
    await item.getByRole('button', { name: 'Alpha extension', exact: true }).click()

    await expect(component.getByTestId('event-log')).toContainText(
      'action:{"tabId":"library","sectionKey":"installed","itemId":"alpha","action":{"id":"toggle-alpha","type":"switch","checked":false}}',
    )
    await expect(component.getByTestId('event-log')).toContainText(
      'name-click:{"tabId":"library","sectionKey":"installed","itemId":"alpha","event":{"type":"click"}}',
    )
  })
})

test.describe('ExtensionManager uncontrolled state', () => {
  test('does not emit an update for the initial uncontrolled default', async ({ mount }) => {
    const component = await mount(ExtensionManagerUncontrolledFixture)
    const events = component.getByTestId('uncontrolled-event-log')

    await expect(events).toBeEmpty()
  })

  test('emits the uncontrolled update synchronously before tab-change', async ({ mount }) => {
    const component = await mount(ExtensionManagerUncontrolledFixture)
    const manager = component.getByTestId('uncontrolled-manager')
    const events = component.getByTestId('uncontrolled-event-log')

    await manager.getByRole('tab', { name: /Slash tab/ }).click()
    await expect(events).toHaveText('update:active-tab:a/b|tab-change:a/b')
  })

  test('activates and focuses tabs with Arrow, Home, and End keys', async ({ mount }) => {
    const component = await mount(ExtensionManagerUncontrolledFixture)
    const manager = component.getByTestId('uncontrolled-manager')
    const slashTab = manager.getByRole('tab', { name: /Slash tab/ })
    const dashTab = manager.getByRole('tab', { name: /Dash tab/ })

    await dashTab.focus()
    await dashTab.press('ArrowRight')
    await expect(slashTab).toHaveAttribute('aria-selected', 'true')
    await expect(slashTab).toHaveAttribute('tabindex', '0')
    await expect(dashTab).toHaveAttribute('tabindex', '-1')
    await expect(slashTab).toBeFocused()

    await slashTab.press('ArrowLeft')
    await expect(dashTab).toHaveAttribute('aria-selected', 'true')
    await expect(dashTab).toBeFocused()

    await dashTab.press('Home')
    await expect(slashTab).toHaveAttribute('aria-selected', 'true')
    await expect(slashTab).toBeFocused()

    await slashTab.press('End')
    await expect(dashTab).toHaveAttribute('aria-selected', 'true')
    await expect(dashTab).toBeFocused()
  })

  test('moves the shared indicator to the active tab', async ({ mount }) => {
    const component = await mount(ExtensionManagerUncontrolledFixture)
    const manager = component.getByTestId('uncontrolled-manager')
    const indicator = manager.locator('.extension-manager-tabs__indicator')
    const slashTab = manager.getByRole('tab', { name: /Slash tab/ })
    const dashTab = manager.getByRole('tab', { name: /Dash tab/ })

    const expectIndicatorAt = async (tab: typeof slashTab) => {
      await expect
        .poll(async () => {
          const target = await tab.evaluate((element) => ({
            left: (element as HTMLElement).offsetLeft,
            width: (element as HTMLElement).offsetWidth,
          }))
          const indicatorPosition = await indicator.evaluate((element) => ({
            transform: (element as HTMLElement).style.transform,
            width: (element as HTMLElement).style.width,
          }))

          return (
            indicatorPosition.transform === `translateX(${target.left}px)` &&
            indicatorPosition.width === `${target.width}px`
          )
        })
        .toBe(true)
    }

    await expectIndicatorAt(dashTab)
    await slashTab.click()
    await expectIndicatorAt(slashTab)
  })

  test('resizes the active indicator when tab content changes in place', async ({ mount }) => {
    const component = await mount(ExtensionManagerUncontrolledFixture)
    const manager = component.getByTestId('uncontrolled-manager')
    const indicator = manager.locator('.extension-manager-tabs__indicator')
    const activeTab = manager.getByRole('tab', { name: /Dash tab/ })

    const originalIndicatorWidth = await indicator.evaluate((element) => (element as HTMLElement).style.width)
    await component.getByTestId('lengthen-active-label').click()

    await expect(activeTab).toHaveText(/dramatically longer label/)
    await expect
      .poll(async () => {
        const tabWidth = await activeTab.evaluate((element) => `${(element as HTMLElement).offsetWidth}px`)
        const indicatorWidth = await indicator.evaluate((element) => (element as HTMLElement).style.width)
        return indicatorWidth === tabWidth && indicatorWidth !== originalIndicatorWidth
      })
      .toBe(true)
  })

  test('keeps Enter and Space activation through native tab buttons', async ({ mount }) => {
    const component = await mount(ExtensionManagerUncontrolledFixture)
    const manager = component.getByTestId('uncontrolled-manager')
    const slashTab = manager.getByRole('tab', { name: /Slash tab/ })
    const dashTab = manager.getByRole('tab', { name: /Dash tab/ })

    await slashTab.focus()
    await slashTab.press('Enter')
    await expect(slashTab).toHaveAttribute('aria-selected', 'true')

    await dashTab.focus()
    await dashTab.press('Space')
    await expect(dashTab).toHaveAttribute('aria-selected', 'true')
  })

  test('uses internal active and section expansion state without v-model bindings', async ({ mount }) => {
    const component = await mount(ExtensionManagerUncontrolledFixture)
    const manager = component.getByTestId('uncontrolled-manager')
    const dashTab = manager.getByRole('tab', { name: /Dash tab/ })
    const slashTab = manager.getByRole('tab', { name: /Slash tab/ })
    const dashSection = manager
      .locator('section[data-tab-id="a-b"][data-section-key="installed"]')
      .getByRole('button', { name: '已安装', exact: true })

    await expect(dashTab).toHaveAttribute('aria-selected', 'true')
    await expect(dashSection).toHaveAttribute('aria-expanded', 'true')

    await dashSection.click()

    await expect(dashSection).toHaveAttribute('aria-expanded', 'false')
    await expect(component.getByTestId('uncontrolled-event-log')).toContainText('section-toggle:a-b/installed/false')

    await slashTab.click()

    await expect(slashTab).toHaveAttribute('aria-selected', 'true')
    await expect(dashTab).toHaveAttribute('aria-selected', 'false')
  })

  test('keeps arbitrary tab ids safe in the nested expansion model', async ({ mount }) => {
    const component = await mount(ExtensionManagerUncontrolledFixture)
    const manager = component.getByTestId('identity-manager')
    const slashSection = manager
      .locator('section[data-tab-id="a/b"][data-section-key="installed"]')
      .getByRole('button', { name: '已安装', exact: true })

    await expect(slashSection).toHaveAttribute('aria-expanded', 'true')
    await slashSection.click()
    await expect(slashSection).toHaveAttribute('aria-expanded', 'false')

    await manager.getByRole('tab', { name: /Dash identity tab/ }).click()

    await expect(
      manager
        .locator('section[data-tab-id="a-b"][data-section-key="installed"]')
        .getByRole('button', { name: '已安装', exact: true }),
    ).toHaveAttribute('aria-expanded', 'true')
  })
})

test.describe('ExtensionManager Filter acceptance', () => {
  test('responds to the manager container width instead of the viewport width', async ({ mount, page }) => {
    await page.setViewportSize({ width: 1200, height: 800 })
    const component = await mount(ExtensionManagerFixture)
    const manager = component.getByTestId('manager-host')

    await manager.evaluate((element) => {
      element.style.width = '440px'
    })

    const tagBox = await manager.getByTestId('filter-tag').boundingBox()
    const searchBox = await manager.getByTestId('filter-search').boundingBox()

    expect(tagBox).not.toBeNull()
    expect(searchBox).not.toBeNull()
    expect(searchBox!.y).toBeGreaterThan(tagBox!.y)
    expect(searchBox!.x).toBe(tagBox!.x)
  })

  test('filters by trimmed case-insensitive name and description search', async ({ mount }) => {
    const component = await mount(ExtensionManagerFixture)
    const manager = component.getByTestId('manager-host')
    const search = manager.getByTestId('filter-search')

    await search.fill('  ALPHA  ')
    await expect(manager.locator('li[data-card-id="alpha"]')).toHaveCount(1)
    await expect(manager.locator('li[data-card-id="beta"]')).toHaveCount(0)
    await search.fill('DESCRIPTION')
    await expect(manager.locator('li[data-card-id]')).toHaveCount(3)
  })

  test('shows a themed search clear button only when needed and clears the query', async ({ mount }) => {
    const component = await mount(ExtensionManagerFixture)
    const manager = component.getByTestId('manager-host')
    const search = manager.getByTestId('filter-search')
    const clear = manager.getByTestId('filter-search-clear')

    await expect(clear).toHaveCount(0)
    await search.fill('alpha')
    await expect(clear).toBeVisible()
    await clear.click()
    await expect(search).toHaveValue('')
    await expect(clear).toHaveCount(0)
  })

  test('combines selected tag and search with AND semantics', async ({ mount }) => {
    const component = await mount(ExtensionManagerFixture)
    const manager = component.getByTestId('manager-host')

    await manager.getByTestId('filter-tag').selectOption('recommended')
    await manager.getByTestId('filter-search').fill('gamma')

    await expect(manager.locator('li[data-card-id="gamma"]')).toHaveCount(1)
    await expect(manager.locator('li[data-card-id="alpha"]')).toHaveCount(0)
    await expect(manager.locator('li[data-card-id="beta"]')).toHaveCount(0)
  })

  test('preserves order and installed/available partitioning after filtering', async ({ mount }) => {
    const component = await mount(ExtensionManagerFixture)
    const manager = component.getByTestId('manager-host')

    await manager.getByTestId('filter-search').fill('description')
    const availableIds = await manager
      .locator('[data-section-key="available"] li[data-card-id]')
      .evaluateAll((elements) => elements.map((element) => element.getAttribute('data-card-id')))
    await expect(manager.locator('[data-section-key="installed"] li[data-card-id]')).toHaveCount(1)
    await expect(manager.locator('[data-section-key="available"] li[data-card-id]')).toHaveCount(2)
    expect(availableIds).toEqual(['beta', 'gamma'])
  })

  test('derives item tags, disables the selector without tags, and keeps the filter row for empty tabs', async ({
    mount,
  }) => {
    const component = await mount(ExtensionManagerFixture)
    const manager = component.getByTestId('manager-host')

    await expect(manager.getByTestId('filter-tag').locator('option')).toHaveCount(3)
    await manager.getByTestId('filter-tag').selectOption('recommended')
    await component.getByTestId('remove-recommended-tag').click()
    await manager.getByTestId('filter-tag').selectOption('writing')
    await component.getByTestId('remove-writing-tag').click()
    await expect(manager.getByTestId('filter-tag')).toBeDisabled()
    await component.getByTestId('set-active-market').click()
    await expect(manager.getByTestId('filter-tag')).toBeEnabled()
    await component.getByTestId('empty-library').click()
    await expect(manager.getByTestId('filter-root')).toBeVisible()
    await component.getByTestId('remove-market-tab').click()
    await expect(manager.getByTestId('filter-root')).toBeVisible()
  })

  test('isolates tab filter state and clears invalid or removed tab state', async ({ mount }) => {
    const component = await mount(ExtensionManagerFixture)
    const manager = component.getByTestId('manager-host')

    await manager.getByTestId('filter-tag').selectOption('recommended')
    await manager.getByTestId('filter-search').fill('alpha')
    await component.getByTestId('set-active-market').click()
    await expect(manager.getByTestId('filter-search')).toHaveValue('')
    await component.getByTestId('set-active-library').click()
    await component.getByTestId('remove-recommended-tag').click()
    await expect(manager.getByTestId('filter-tag')).toHaveValue('')
    await expect(manager.getByTestId('filter-search')).toHaveValue('alpha')
    await component.getByTestId('remove-market-tab').click()
    await expect(manager.getByTestId('filter-root')).toBeVisible()
  })

  test('renders the configured title', async ({ mount }) => {
    const component = await mount(ExtensionManagerFixture)

    await expect(component.getByTestId('manager-host').getByText('Extension manager', { exact: true })).toBeVisible()
  })
})
