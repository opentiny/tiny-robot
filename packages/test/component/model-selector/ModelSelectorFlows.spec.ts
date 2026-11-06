import { expect, test } from '@playwright/experimental-ct-vue'
import ModelSelectorFlows from './ModelSelectorFlows.fixture.vue'

test('search filters grouped models and renders header, item and empty slots', async ({ mount, page }) => {
  const component = await mount(ModelSelectorFlows)
  await component.getByRole('button', { name: 'Alpha model', exact: true }).click()

  const listbox = page.getByRole('listbox', { name: 'Choose model' })
  await expect(page.getByTestId('header')).toHaveText('Alpha model:')
  await expect(listbox.getByRole('group', { name: 'Team Alpha' })).toBeVisible()
  await expect(listbox.getByRole('group', { name: 'Team Beta' })).toBeVisible()
  await expect(listbox.getByRole('option', { name: 'Alpha model selected highlighted' })).toBeVisible()

  const search = page.getByRole('combobox', { name: 'Search models' })
  await search.fill('beta')
  await expect(listbox.getByRole('option')).toHaveCount(1)
  await expect(listbox.getByRole('group', { name: 'Team Beta' })).toBeVisible()
  await expect(page.getByTestId('header')).toHaveText('Alpha model:beta')

  await search.fill('missing')
  await expect(page.getByTestId('empty-slot')).toHaveText('Nothing for missing')
  await expect(listbox.getByRole('option')).toHaveCount(0)
})

test('keyboard navigation skips disabled models, supports boundaries and restores focus on Escape', async ({
  mount,
  page,
}) => {
  const component = await mount(ModelSelectorFlows, { props: { keyboard: true } })
  const trigger = component.getByRole('button', { name: 'Alpha model', exact: true })
  await trigger.focus()
  await trigger.press('Enter')

  const listbox = page.getByRole('listbox', { name: 'Choose model' })
  await expect(listbox).toBeFocused()
  await expect(listbox.getByRole('option', { name: 'Locked model' })).toHaveAttribute('aria-disabled', 'true')
  await listbox.press('ArrowDown')
  await expect(listbox.getByRole('option', { name: 'Beta model highlighted' })).toBeVisible()
  await listbox.press('Home')
  await expect(listbox.getByRole('option', { name: 'Alpha model selected highlighted' })).toBeVisible()
  await listbox.press('End')
  await expect(listbox.getByRole('option', { name: 'Beta model highlighted' })).toBeVisible()
  await listbox.press('Enter')
  await expect(component.getByRole('button', { name: 'Beta model', exact: true })).toBeVisible()
  await expect(component.getByTestId('events')).toHaveText('["model:beta"]')
  await listbox.press('Escape')
  await expect(page.getByRole('listbox')).toHaveCount(0)
  await expect(component.getByRole('button', { name: 'Beta model', exact: true })).toBeFocused()
})

test('disabled models cannot be selected with pointer or keyboard', async ({ mount, page }) => {
  const component = await mount(ModelSelectorFlows)
  await component.getByRole('button', { name: 'Alpha model', exact: true }).click()
  const locked = page.getByRole('option', { name: 'Locked model' })
  await locked.click({ force: true })
  await expect(component.getByRole('button', { name: 'Alpha model', exact: true })).toBeVisible()
  await expect(component.getByTestId('events')).toHaveText('[]')
  await page.getByRole('listbox').press('End')
  await page.getByRole('listbox').press('Enter')
  await expect(component.getByTestId('events')).toHaveText('["model:beta"]')
})
