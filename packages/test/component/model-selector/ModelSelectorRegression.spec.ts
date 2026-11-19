import { expect, test } from '@playwright/experimental-ct-vue'
import type { Page } from '@playwright/test'
import ModelSelectorRegression from './ModelSelectorRegression.fixture.vue'

async function getPanel(page: Page, testId: string) {
  const trigger = page.getByTestId(testId).getByRole('button')
  const listboxId = await trigger.getAttribute('aria-controls')
  return page.locator(`[id="${listboxId}"]`).locator('..')
}

test('does not select a model implicitly when the model list loads asynchronously', async ({ mount }) => {
  const component = await mount(ModelSelectorRegression)
  const trigger = component.getByTestId('async-selector').getByRole('button')

  await expect(trigger).toHaveText('Choose model')
  await component.getByTestId('load-models').click()
  await expect(trigger).toHaveText('Choose model')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

test('controlled model and open state follow parent updates', async ({ mount, page }) => {
  const component = await mount(ModelSelectorRegression)
  const trigger = component.getByTestId('controlled-selector').getByRole('button')

  await expect(trigger).toContainText('Alpha model')
  await component.getByTestId('toggle-controlled-open').click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await page.getByRole('option', { name: /Beta model/ }).click()
  await expect(component.getByTestId('controlled-state')).toHaveText('beta:false')
  await expect(trigger).toContainText('Beta model')
  await expect(component.getByTestId('controlled-events')).toHaveText('["model:beta","open:false"]')
})

test('controlled updates that are not accepted leave the props unchanged', async ({ mount }) => {
  const component = await mount(ModelSelectorRegression)
  const trigger = component.getByTestId('rejected-selector').getByRole('button')

  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(component.getByTestId('rejected-events')).toHaveText('["open:true"]')
})

test('defaultOpen opens without an update event and Escape requests a close', async ({ mount, page }) => {
  const component = await mount(ModelSelectorRegression)
  await component.getByTestId('show-default-open').click()
  const trigger = component.getByTestId('default-open-selector').getByRole('button')
  const panel = await getPanel(page, 'default-open-selector')
  const search = panel.getByRole('combobox', { name: 'Search models' })

  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(search).toBeFocused()
  await expect(component.getByTestId('default-open-events')).toHaveText('[]')
  await search.press('Escape')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(component.getByTestId('default-open-events')).toHaveText('[false]')
})

test('models with minimal data and both icon forms render', async ({ mount, page }) => {
  const component = await mount(ModelSelectorRegression)
  const trigger = component.getByTestId('search-selector').getByRole('button')

  await expect(trigger).toContainText('Alpha model')
  await expect(component.getByTestId('search-selector').locator('svg.tr-model-selector__trigger-icon')).toHaveCount(1)
  await trigger.click()
  await expect(page.locator('img.tr-model-selector__option-icon')).toHaveCount(1)
})

test('default search matches descriptions and groups while custom filtering replaces it', async ({ mount, page }) => {
  const component = await mount(ModelSelectorRegression)
  const searchTrigger = component.getByTestId('search-selector').getByRole('button')
  await searchTrigger.click()
  const searchPanel = await getPanel(page, 'search-selector')
  const search = searchPanel.getByRole('combobox', { name: 'Search models' })
  const listbox = searchPanel.getByRole('listbox')
  await search.fill('multimodal')
  await expect(listbox.getByRole('option')).toHaveCount(1)
  await search.fill('Team Beta')
  await expect(listbox.getByRole('option')).toHaveCount(2)

  const customTrigger = component.getByTestId('custom-filter-selector').getByRole('button')
  await customTrigger.click()
  const customPanel = await getPanel(page, 'custom-filter-selector')
  const scopedCustomSearch = customPanel.getByRole('combobox', { name: 'Filter by id' })
  const customListbox = customPanel.getByRole('listbox')
  await scopedCustomSearch.fill('beta')
  await expect(customListbox.getByRole('option')).toHaveCount(1)
  await expect(customListbox.getByRole('option')).toContainText('Beta model')
})

test('search Home preserves text editing and composing ArrowDown does not move the highlight', async ({
  mount,
  page,
}) => {
  const component = await mount(ModelSelectorRegression)
  await component.getByTestId('search-selector').getByRole('button').click()
  const panel = await getPanel(page, 'search-selector')
  const search = panel.getByRole('combobox', { name: 'Search models' })

  await search.fill('beta')
  await search.press('Home')
  await expect(search).toHaveValue('beta')
  const activeOption = await search.getAttribute('aria-activedescendant')
  await search.evaluate((element) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, isComposing: true }))
  })
  await expect(search).toHaveAttribute('aria-activedescendant', activeOption ?? '')
})

test('trigger, combobox, listbox and options expose connected ARIA relationships', async ({ mount, page }) => {
  const component = await mount(ModelSelectorRegression)
  const trigger = component.getByTestId('aria-selector').getByRole('button')

  await trigger.click()
  const listboxId = await trigger.getAttribute('aria-controls')
  const listbox = page.locator(`[id="${listboxId}"]`)
  const search = page.getByRole('combobox').last()
  const option = listbox.getByRole('option').first()

  await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(search).toHaveAttribute('aria-controls', listboxId ?? '')
  await expect(listbox).toHaveAttribute('aria-label', '选择模型')
  await expect(option).toHaveAttribute('id', /.+/)
  await expect(option).toHaveAttribute('aria-selected', 'true')
})

test('multiple instances use unique IDs and outside clicks close without stealing focus', async ({ mount }) => {
  const component = await mount(ModelSelectorRegression)
  const primary = component.getByTestId('primary-selector').getByRole('button')
  const secondary = component.getByTestId('secondary-selector').getByRole('button')

  expect(await primary.getAttribute('aria-controls')).not.toBe(await secondary.getAttribute('aria-controls'))
  await primary.click()
  await expect(primary).toHaveAttribute('aria-expanded', 'true')
  await secondary.click()
  await expect(primary).toHaveAttribute('aria-expanded', 'false')
  await expect(secondary).toHaveAttribute('aria-expanded', 'true')
  await component.getByTestId('outside-action').click()
  await expect(secondary).toHaveAttribute('aria-expanded', 'false')
  await expect(component.getByTestId('outside-action')).toBeFocused()
})

test('invalid appendTo selectors fall back and rapid toggles leave no stale panel', async ({ mount, page }) => {
  const component = await mount(ModelSelectorRegression)
  const invalidTrigger = component.getByTestId('invalid-append-selector').getByRole('button')

  await invalidTrigger.click()
  await expect(page.getByRole('listbox')).toBeVisible()
  await page.getByRole('listbox').press('Escape')
  await expect(page.getByRole('listbox')).toHaveCount(0)

  await component.getByTestId('rapid-open-close').click()
  await expect(component.getByTestId('rapid-selector').getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('.tr-model-selector__dropdown-wrapper.is-positioned')).toHaveCount(0)
})

test('panel remains within the viewport, sizes grow consistently and custom class is applied', async ({
  mount,
  page,
}) => {
  const component = await mount(ModelSelectorRegression)
  await page.setViewportSize({ width: 360, height: 720 })
  const small = component.getByTestId('short-small-selector').getByRole('button')
  const normal = component.getByTestId('short-normal-selector').getByRole('button')
  const large = component.getByTestId('short-large-selector').getByRole('button')
  const [smallBox, normalBox, largeBox] = await Promise.all([
    small.boundingBox(),
    normal.boundingBox(),
    large.boundingBox(),
  ])

  expect(smallBox).toBeTruthy()
  expect(normalBox).toBeTruthy()
  expect(largeBox).toBeTruthy()
  expect(normalBox!.height).toBeGreaterThan(smallBox!.height)
  expect(largeBox!.height).toBeGreaterThan(normalBox!.height)

  const trigger = component.getByTestId('custom-panel-selector').getByRole('button')
  await trigger.click()
  const panel = await getPanel(page, 'custom-panel-selector')
  await expect(panel).toHaveClass(/regression-panel/)
  const panelBox = await panel.boundingBox()
  expect(panelBox).toBeTruthy()
  expect(panelBox!.x).toBeGreaterThanOrEqual(0)
  expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(360)
})

test('search and model changes do not shrink an open panel; newly wider options can expand it', async ({
  mount,
  page,
}) => {
  const component = await mount(ModelSelectorRegression)
  const searchTrigger = component.getByTestId('short-search-selector').getByRole('button')
  await searchTrigger.click()
  const searchPanel = await getPanel(page, 'short-search-selector')
  const initialWidth = (await searchPanel.boundingBox())!.width
  await searchPanel.getByRole('combobox').fill('A')
  await expect.poll(async () => (await searchPanel.boundingBox())!.width).toBeGreaterThanOrEqual(initialWidth - 1)

  const dynamicTrigger = component.getByTestId('dynamic-width-selector').getByRole('button')
  await dynamicTrigger.click()
  const dynamicPanel = await getPanel(page, 'dynamic-width-selector')
  const dynamicInitialWidth = (await dynamicPanel.boundingBox())!.width
  await page.getByTestId('load-wide-models').click()
  await expect.poll(async () => (await dynamicPanel.boundingBox())!.width).toBeGreaterThan(dynamicInitialWidth + 80)
})

test('disabled selector cannot open its panel', async ({ mount, page }) => {
  const component = await mount(ModelSelectorRegression)
  const trigger = component.getByTestId('disabled-selector').getByRole('button')

  await expect(trigger).toBeDisabled()
  await trigger.dispatchEvent('click')
  await expect(page.getByRole('listbox')).toHaveCount(0)
})
