import { expect, test } from '@playwright/experimental-ct-vue'
import FloatingModelSelectorFixture from './FloatingModelSelector.fixture.vue'

test.describe('ModelSelector floating Layout target', () => {
  test('uses the floating overlay host by default and remains interactive', async ({ mount, page }) => {
    await mount(FloatingModelSelectorFixture)
    const trigger = page.getByTestId('model-selector').getByRole('button')
    const dropdown = page.locator('.tr-model-selector__dropdown-wrapper')

    await trigger.click()
    await expect(dropdown).toBeVisible()
    await expect
      .poll(() => dropdown.evaluate((element) => element.parentElement?.hasAttribute('data-tr-floating-overlay-host')))
      .toBe(true)

    await dropdown.getByRole('option', { name: 'GPT-4.1' }).click()
    await expect(page.getByTestId('model-value')).toHaveText('gpt-4.1')
  })

  test('keeps appendTo as an explicit override', async ({ mount, page }) => {
    await mount(FloatingModelSelectorFixture, { props: { appendTo: '#model-selector-custom-target' } })
    const trigger = page.getByTestId('model-selector').getByRole('button')
    const dropdown = page.locator('.tr-model-selector__dropdown-wrapper')

    await trigger.click()
    await expect(dropdown).toBeVisible()
    await expect
      .poll(() => dropdown.evaluate((element) => element.parentElement?.id === 'model-selector-custom-target'))
      .toBe(true)
  })

  test('moves an open panel when Layout switches modes', async ({ mount, page }) => {
    const component = await mount(FloatingModelSelectorFixture, { props: { mode: 'normal' } })
    const trigger = page.getByTestId('model-selector').getByRole('button')
    const dropdown = page.locator('.tr-model-selector__dropdown-wrapper')

    await trigger.click()
    await expect(dropdown).toBeVisible()
    await expect.poll(() => dropdown.evaluate((element) => element.parentElement === document.body)).toBe(true)

    await component.getByTestId('toggle-mode').click()
    await expect(dropdown).toHaveCount(0)

    await trigger.click()
    await expect(dropdown).toBeVisible()
    await expect
      .poll(() => dropdown.evaluate((element) => element.parentElement?.hasAttribute('data-tr-floating-overlay-host')))
      .toBe(true)
  })
})
