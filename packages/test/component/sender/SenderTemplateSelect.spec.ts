import { expect, test } from '@playwright/experimental-ct-vue'
import SenderExtensionsFixture from './fixtures/SenderExtensions.fixture.vue'

const triggers = (component: { locator: (selector: string) => import('@playwright/test').Locator }) =>
  component.locator('.template-select__trigger')

const dropdown = (page: import('@playwright/test').Page) => page.locator('.template-select__dropdown')
const options = (page: import('@playwright/test').Page) => page.locator('.template-select__option')

test.describe('Sender TemplateSelect', () => {
  test('COMPACT-SELECT-TOGGLE opens without submitting and closes via trigger', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'template', templateScenario: 'two-selects' },
    })
    const trigger = triggers(component).first()

    await trigger.click()
    await expect(dropdown(page)).toBeVisible()
    await expect(component.getByTestId('submit-count')).toHaveText('0')
    await trigger.click()
    await expect(dropdown(page)).toHaveCount(0)
    await trigger.click()
    await expect(dropdown(page)).toBeVisible()
    await trigger.press('Escape')
    await expect(dropdown(page)).toHaveCount(0)
  })

  test('SELECT-04 supports hover highlighting and mouse selection', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'template', templateScenario: 'two-selects' },
    })

    await triggers(component).first().click()
    await options(page).nth(1).hover()
    await expect(options(page).nth(1)).toHaveClass(/is-highlighted/)
    await options(page).nth(1).click()
    await expect(triggers(component).first().locator('.template-select__text')).toHaveText('第二个')
  })

  test('COMPACT-SELECT-KEYBOARD wraps navigation and selects the first option with Enter', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'template', templateScenario: 'two-selects' },
    })
    const trigger = triggers(component).first()

    await trigger.click()
    await trigger.press('ArrowDown')
    await expect(options(page).nth(0)).toHaveClass(/is-highlighted/)
    await trigger.press('ArrowDown')
    await expect(options(page).nth(1)).toHaveClass(/is-highlighted/)
    await trigger.press('ArrowDown')
    await expect(options(page).nth(0)).toHaveClass(/is-highlighted/)
    await trigger.press('ArrowUp')
    await expect(options(page).nth(1)).toHaveClass(/is-highlighted/)
    await trigger.press('ArrowUp')
    await expect(options(page).nth(0)).toHaveClass(/is-highlighted/)
    await trigger.press('Enter')
    await expect(trigger.locator('.template-select__text')).toHaveText('第一个')
    await expect(dropdown(page)).toHaveCount(0)
    await expect(component.getByTestId('submit-count')).toHaveText('0')
  })

  test('SELECT-07 closes on Enter when no option is highlighted', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'template', templateScenario: 'two-selects' },
    })
    const trigger = triggers(component).first()

    await trigger.click()
    await trigger.press('Enter')
    await expect(dropdown(page)).toHaveCount(0)
    await expect(trigger.locator('.template-select__text')).toHaveText('选择一')
  })

  test('SELECT-11 removes the whole node with Backspace from its right boundary', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'template', templateScenario: 'two-selects' },
    })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-after-select').click()
    await editor.press('Backspace')
    await expect(triggers(component)).toHaveCount(1)
    await expect(triggers(component).first().locator('.template-select__text')).toHaveText('选择二')
  })

  test('SELECT-12 removes the whole node with Delete from its left boundary', async ({ mount }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'template', templateScenario: 'two-selects' },
    })
    const editor = component.getByTestId('sender-root').locator('.ProseMirror')

    await component.getByTestId('select-before-select').click()
    await editor.press('Delete')
    await expect(triggers(component)).toHaveCount(1)
    await expect(triggers(component).first().locator('.template-select__text')).toHaveText('选择二')
  })

  test('COMPACT-SELECT-BODY renders placeholders and selects an option in the body menu', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'template', templateScenario: 'two-selects', appendTarget: 'body' },
    })

    await expect(triggers(component).first().locator('.template-select__text')).toHaveText('选择一')
    await expect(triggers(component).nth(1).locator('.template-select__text')).toHaveText('选择二')
    await triggers(component).first().click()
    await expect(dropdown(page).evaluate((element) => element.parentElement?.tagName)).resolves.toBe('BODY')
    await options(page).first().click()
    await expect(triggers(component).first().locator('.template-select__text')).toHaveText('第一个')
    await expect(dropdown(page)).toHaveCount(0)
    await triggers(component).first().click()
    await expect(dropdown(page)).toBeVisible()
    await component.unmount()
    await expect(dropdown(page)).toHaveCount(0)
  })

  test('COMPACT-SELECT-SELECTOR positions in selector target then closes on Escape', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'template', templateScenario: 'two-selects', appendTarget: 'selector' },
    })

    await triggers(component).first().click()
    await expect(dropdown(page)).toHaveClass(/is-absolute/)
    await expect(dropdown(page).evaluate((element) => element.parentElement?.id)).resolves.toBe(
      'sender-template-selector-target',
    )
    await triggers(component).first().press('Escape')
    await expect(dropdown(page)).toHaveCount(0)
  })

  test('COMPACT-SELECT-ELEMENT positions in HTMLElement target then closes on outside click', async ({
    mount,
    page,
  }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'template', templateScenario: 'two-selects', appendTarget: 'element' },
    })

    await triggers(component).first().click()
    await expect(dropdown(page).evaluate((element) => element.parentElement?.id)).resolves.toBe(
      'sender-template-element-target',
    )
    await expect(dropdown(page)).toHaveClass(/is-absolute/)
    await component.getByTestId('sender-root').locator('.ProseMirror').click()
    await expect(dropdown(page)).toHaveCount(0)
  })

  test('COMPACT-SELECT-SHADOW positions in connected ShadowRoot target and cleans up on unmount', async ({
    mount,
    page,
  }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'template', templateScenario: 'two-selects', appendTarget: 'shadow' },
    })

    await triggers(component).first().click()
    await expect(dropdown(page).evaluate((element) => element.parentElement?.dataset.testid)).resolves.toBe(
      'shadow-target',
    )
    await expect(dropdown(page)).toHaveClass(/is-absolute/)
    await expect(dropdown(page)).toBeVisible()
    await component.unmount()
    await expect(dropdown(page)).toHaveCount(0)
  })

  test('SELECT-17 keeps only one menu open for two selects in the same Sender', async ({ mount, page }) => {
    const component = await mount(SenderExtensionsFixture, {
      props: { kind: 'template', templateScenario: 'two-selects' },
    })

    await triggers(component).first().click()
    await expect(dropdown(page)).toHaveCount(1)
    await triggers(component).nth(1).click()
    await expect(dropdown(page)).toHaveCount(1)
    await component.getByTestId('sender-root').locator('.ProseMirror').click()
    await expect(dropdown(page)).toHaveCount(0)
  })

  for (const [name, appendTarget, senderLocation] of [
    ['SELECT-21 falls back to body for an invalid selector', 'invalid-selector', 'document'],
    ['SELECT-22 falls back to body for a detached HTMLElement', 'detached-element', 'document'],
    ['SELECT-23 falls back to body for a missing selector inside a real ShadowRoot', 'missing-selector', 'shadow'],
  ] as const) {
    test(name, async ({ mount, page }) => {
      const component = await mount(SenderExtensionsFixture, {
        props: { kind: 'template', templateScenario: 'two-selects', appendTarget, senderLocation },
      })
      const trigger = page.locator('[data-testid="sender-root"] .template-select__trigger').first()

      await expect(trigger.evaluate((element) => element.getRootNode() instanceof ShadowRoot)).resolves.toBe(
        senderLocation === 'shadow',
      )
      await trigger.click()
      await expect(dropdown(page)).toBeVisible()
      await expect(dropdown(page).evaluate((element) => element.parentElement?.tagName)).resolves.toBe('BODY')
      await expect(dropdown(page)).not.toHaveClass(/is-absolute/)
      await options(page).first().click()
      await expect(trigger.locator('.template-select__text')).toHaveText('第一个')
      await expect(dropdown(page)).toHaveCount(0)
      await expect(component.getByTestId('submit-count')).toHaveText('0')
      await trigger.click()
      await expect(dropdown(page)).toBeVisible()
      await trigger.press('Escape')
      await expect(dropdown(page)).toHaveCount(0)
      await trigger.click()
      await expect(dropdown(page)).toBeVisible()
      await component.unmount()
      await expect(dropdown(page)).toHaveCount(0)
    })
  }

  test('SELECT-19 resolves the default target to body for a Sender inside a real ShadowRoot', async ({
    mount,
    page,
  }) => {
    await mount(SenderExtensionsFixture, {
      props: { kind: 'template', templateScenario: 'two-selects', senderLocation: 'shadow', appendTarget: 'body' },
    })
    const trigger = page.locator('[data-testid="sender-root"] .template-select__trigger').first()

    await expect(trigger.evaluate((element) => element.getRootNode() instanceof ShadowRoot)).resolves.toBe(true)
    await trigger.click()
    await expect(dropdown(page)).toBeVisible()
    await expect(dropdown(page).evaluate((element) => element.parentElement?.tagName)).resolves.toBe('BODY')
  })

  test('SELECT-20 resolves an explicit body target for a Sender inside a real ShadowRoot', async ({ mount, page }) => {
    await mount(SenderExtensionsFixture, {
      props: {
        kind: 'template',
        templateScenario: 'two-selects',
        senderLocation: 'shadow',
        appendTarget: 'explicit-body',
      },
    })
    const trigger = page.locator('[data-testid="sender-root"] .template-select__trigger').first()

    await expect(trigger.evaluate((element) => element.getRootNode() instanceof ShadowRoot)).resolves.toBe(true)
    await trigger.click()
    await expect(dropdown(page)).toBeVisible()
    await expect(dropdown(page).evaluate((element) => element.parentElement?.tagName)).resolves.toBe('BODY')
  })
})
