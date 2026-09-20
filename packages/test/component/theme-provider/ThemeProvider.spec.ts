import { expect, test } from '@playwright/experimental-ct-vue'
import type { Page } from '@playwright/test'
import ThemeProviderFixture from './ThemeProvider.fixture.vue'

const installMatchMedia = async (page: Page, initialDark = false) => {
  await page.evaluate((dark) => {
    let matches = dark
    const listeners = new Set<(event: MediaQueryListEvent) => void>()
    const mediaQuery = {
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      get matches() {
        return matches
      },
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
        listeners.delete(listener),
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => true,
    }

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => mediaQuery,
    })

    ;(window as typeof window & { setSystemDark: (value: boolean) => void }).setSystemDark = (value) => {
      matches = value
      const event = { matches: value, media: mediaQuery.media } as MediaQueryListEvent
      listeners.forEach((listener) => listener(event))
    }
  }, initialDark)
}

test.beforeEach(async ({ page }) => {
  await installMatchMedia(page)
})

test.describe('ThemeProvider and useTheme', () => {
  test('renders its slot and applies explicit theme data to the default html target', async ({ mount, page }) => {
    const component = await mount(ThemeProviderFixture)

    await expect(component.getByTestId('default-slot')).toHaveText('Default provider slot')
    await expect(page.locator('html')).toHaveAttribute('data-tr-theme', 'default-theme')
    await expect(page.locator('html')).toHaveAttribute('data-tr-color-mode', 'light')
  })

  test('applies controlled theme models to a custom target element', async ({ mount }) => {
    const component = await mount(ThemeProviderFixture)
    const target = component.getByTestId('controlled-target')

    await expect(target).toHaveAttribute('data-tr-theme', 'ocean')
    await expect(target).toHaveAttribute('data-tr-color-mode', 'light')
    await expect(component.getByTestId('controlled-theme-model')).toHaveText('ocean')
    await expect(component.getByTestId('controlled-mode-model')).toHaveText('auto')
  })

  test('updates theme and color-mode models through useTheme', async ({ mount }) => {
    const component = await mount(ThemeProviderFixture)
    const consumer = component.getByTestId('controlled-consumer')
    const target = component.getByTestId('controlled-target')

    await consumer.getByRole('button', { name: 'Set forest theme' }).click()
    await expect(component.getByTestId('controlled-theme-model')).toHaveText('forest')
    await expect(target).toHaveAttribute('data-tr-theme', 'forest')
    await expect(consumer.getByTestId('controlled-result')).toHaveText('true')

    await consumer.getByRole('button', { name: 'Set dark mode' }).click()
    await expect(component.getByTestId('controlled-mode-model')).toHaveText('dark')
    await expect(target).toHaveAttribute('data-tr-color-mode', 'dark')

    await consumer.getByRole('button', { name: 'Toggle color mode' }).click()
    await expect(component.getByTestId('controlled-mode-model')).toHaveText('light')
    await expect(consumer.getByTestId('controlled-resolved-mode')).toHaveText('light')
  })

  test('resolves auto mode from matchMedia and reacts to system changes', async ({ mount, page }) => {
    const component = await mount(ThemeProviderFixture)
    const target = component.getByTestId('controlled-target')

    await expect(target).toHaveAttribute('data-tr-color-mode', 'light')
    await page.evaluate(() => {
      ;(window as typeof window & { setSystemDark: (value: boolean) => void }).setSystemDark(true)
    })
    await expect(target).toHaveAttribute('data-tr-color-mode', 'dark')
    await expect(component.getByTestId('controlled-system-mode')).toHaveText('dark')
  })

  test('restores and merges persisted theme data using the configured key', async ({ mount }) => {
    const component = await mount(ThemeProviderFixture)
    const target = component.getByTestId('stored-target')
    const consumer = component.getByTestId('stored-consumer')

    await expect(target).toHaveAttribute('data-tr-theme', 'stored-theme')
    await expect(target).toHaveAttribute('data-tr-color-mode', 'dark')
    await consumer.getByRole('button', { name: 'Set forest theme' }).click()
    await expect(component.getByTestId('stored-value')).toHaveText(
      JSON.stringify({ theme: 'forest', colorMode: 'dark', retained: 'yes' }),
    )
  })

  test('falls back to explicit props when stored JSON is malformed', async ({ mount }) => {
    const component = await mount(ThemeProviderFixture)
    const target = component.getByTestId('malformed-target')

    await expect(component.getByTestId('malformed-slot')).toBeVisible()
    await expect(target).toHaveAttribute('data-tr-theme', 'safe-theme')
    await expect(target).toHaveAttribute('data-tr-color-mode', 'light')
  })

  test('returns false when useTheme setters run outside a provider', async ({ mount }) => {
    const component = await mount(ThemeProviderFixture)
    const outside = component.getByTestId('outside-consumer')

    await outside.getByRole('button', { name: 'Set forest theme' }).click()
    await expect(outside.getByTestId('outside-result')).toHaveText('false')
    await outside.getByRole('button', { name: 'Set dark mode' }).click()
    await expect(outside.getByTestId('outside-result')).toHaveText('false')
    await outside.getByRole('button', { name: 'Toggle color mode' }).click()
    await expect(outside.getByTestId('outside-result')).toHaveText('false')
  })
})
