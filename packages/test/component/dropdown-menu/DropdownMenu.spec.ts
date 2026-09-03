import { expect, test } from '@playwright/experimental-ct-vue'
import DropdownMenuFixture from './DropdownMenu.fixture.vue'

test.describe('DropdownMenu', () => {
  test('renders the trigger slot and toggles click-controlled visibility', async ({ mount, page }) => {
    const component = await mount(DropdownMenuFixture)
    const section = component.getByTestId('click-menu')
    const trigger = section.getByRole('button', { name: 'Choose model' })

    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await trigger.click()
    await expect(section.getByTestId('click-show')).toHaveText('true')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('menu')).toBeVisible()

    await trigger.click()
    await expect(section.getByTestId('click-show')).toHaveText('false')
  })

  test('emits the selected item and closes the click menu', async ({ mount, page }) => {
    const component = await mount(DropdownMenuFixture)
    const section = component.getByTestId('click-menu')

    await section.getByRole('button', { name: 'Choose model' }).click()
    await page.getByRole('menuitem', { name: 'Fast model' }).click()
    await expect(section.getByTestId('selected-item')).toHaveText(JSON.stringify({ id: 'fast', text: 'Fast model' }))
    await expect(section.getByTestId('click-show')).toHaveText('false')
  })

  test('emits click-outside and closes the click menu', async ({ mount }) => {
    const component = await mount(DropdownMenuFixture)
    const section = component.getByTestId('click-menu')

    await section.getByRole('button', { name: 'Choose model' }).click()
    await component.getByRole('button', { name: 'Outside control' }).click()
    await expect(section.getByTestId('outside-event')).toHaveText('click')
    await expect(section.getByTestId('click-show')).toHaveText('false')
  })

  test('keeps manual visibility controlled by the parent', async ({ mount, page }) => {
    const component = await mount(DropdownMenuFixture)
    const section = component.getByTestId('manual-menu')

    await section.getByRole('button', { name: 'Toggle manual menu' }).click()
    await expect(section.getByTestId('manual-show')).toHaveText('true')
    await expect(page.getByRole('menu').filter({ hasText: 'Reasoning model' })).toBeVisible()

    await section.getByRole('button', { name: 'Manual trigger' }).click()
    await expect(section.getByTestId('manual-show')).toHaveText('true')

    await page.getByRole('menuitem', { name: 'Reasoning model' }).click()
    await expect(section.getByTestId('manual-show')).toHaveText('true')
  })

  test('opens and closes after the hover delays', async ({ mount, page }) => {
    const component = await mount(DropdownMenuFixture)
    const trigger = component.getByRole('button', { name: 'Hover trigger' })

    await trigger.hover()
    await expect(page.getByRole('menu').filter({ hasText: 'Fast model' })).toBeVisible()

    await component.getByRole('button', { name: 'Outside control' }).hover()
    await expect(page.getByRole('menu').filter({ hasText: 'Fast model' })).toBeHidden()
  })

  test('teleports the menu to appendTo', async ({ mount, page }) => {
    const component = await mount(DropdownMenuFixture)

    await component.getByRole('button', { name: 'Appended trigger' }).click()
    await expect(page.getByTestId('append-target').getByRole('menu')).toBeVisible()
  })

  test('moves focus into click menus opened with Enter or Space and dismisses them on Tab', async ({ mount, page }) => {
    const component = await mount(DropdownMenuFixture)
    const section = component.getByTestId('click-menu')
    const trigger = section.getByRole('button', { name: 'Choose model' })

    await trigger.focus()
    await trigger.press('Enter')
    await expect(page.getByRole('menuitem', { name: 'Reasoning model' })).toBeFocused()

    await page.getByRole('menuitem', { name: 'Reasoning model' }).press('Tab')
    await expect(page.getByRole('menu')).toBeHidden()

    await trigger.focus()
    await trigger.press('Space')
    await expect(page.getByRole('menuitem', { name: 'Reasoning model' })).toBeFocused()
  })

  test('supports keyboard navigation, selection, Escape, and focus restoration', async ({ mount, page }) => {
    const component = await mount(DropdownMenuFixture)
    const section = component.getByTestId('click-menu')
    const trigger = section.getByRole('button', { name: 'Choose model' })

    await trigger.focus()
    await trigger.press('ArrowDown')
    await expect(page.getByRole('menuitem', { name: 'Reasoning model' })).toBeFocused()
    await page.getByRole('menuitem', { name: 'Reasoning model' }).press('ArrowDown')
    await expect(page.getByRole('menuitem', { name: 'Fast model' })).toBeFocused()
    await page.getByRole('menuitem', { name: 'Fast model' }).press('Enter')
    await expect(section.getByTestId('selected-item')).toContainText('"id":"fast"')
    await expect(trigger).toBeFocused()

    await trigger.press('Enter')
    await expect(page.getByRole('menu')).toBeVisible()
    await page.getByRole('menuitem', { name: 'Reasoning model' }).press('Escape')
    await expect(page.getByRole('menu')).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('moves focus into an externally opened manual menu with ArrowDown', async ({ mount, page }) => {
    const component = await mount(DropdownMenuFixture)
    const section = component.getByTestId('manual-menu')
    const trigger = section.getByRole('button', { name: 'Manual trigger' })

    await section.getByRole('button', { name: 'Toggle manual menu' }).click()
    await trigger.focus()
    await trigger.press('ArrowDown')

    await expect(page.getByRole('menuitem', { name: 'Reasoning model' })).toBeFocused()
  })
})
