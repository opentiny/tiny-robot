import { expect, test } from '@playwright/experimental-ct-vue'
import LayoutAccessibilityFixture from './LayoutAccessibility.fixture.vue'

test.describe('Layout drawer accessibility', () => {
  test('connects the toggle to a named modal drawer and reflects its state', async ({ mount }) => {
    const component = await mount(LayoutAccessibilityFixture)
    const toggle = component.getByRole('button', { name: 'Toggle conversations' })
    const drawer = component.locator('aside[role="dialog"][aria-label="Conversation navigation"]')

    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(drawer).toHaveAttribute('aria-modal', 'true')
    await expect(drawer).toHaveAttribute('id', /.+/)
    const drawerId = await drawer.getAttribute('id')
    expect(drawerId).not.toBeNull()
    await expect(toggle).toHaveAttribute('aria-controls', drawerId!)

    await toggle.click()

    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(component.getByTestId('drawer-first')).toBeFocused()
    await expect(component.locator('.tr-layout__main')).toHaveAttribute('inert', '')
  })

  test('traps focus and restores it after Escape closes the drawer', async ({ mount, page }) => {
    const component = await mount(LayoutAccessibilityFixture)
    const toggle = component.getByRole('button', { name: 'Toggle conversations' })
    const first = component.getByTestId('drawer-first')
    const last = component.getByTestId('drawer-last')

    await toggle.click()
    await expect(component.locator('aside[role="dialog"]')).toHaveClass(/tr-layout__aside--expanded/)
    await expect(component.locator('aside[role="dialog"]')).not.toHaveAttribute('inert', '')
    await expect(first).toBeFocused()

    await first.press('Shift+Tab')
    await expect(last).toBeFocused()
    await last.press('Tab')
    await expect(first).toBeFocused()

    await page.keyboard.press('Escape')

    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toBeFocused()
  })

  test('does not steal restored focus when the drawer closes during its reveal', async ({ mount, page }) => {
    const component = await mount(LayoutAccessibilityFixture)
    const toggle = component.getByRole('button', { name: 'Toggle conversations' })

    await toggle.click()
    await page.waitForTimeout(20)
    await component.locator('.tr-layout__body').dispatchEvent('keydown', { key: 'Escape' })

    await expect(toggle).toBeFocused()
    await page.waitForTimeout(300)
    await expect(toggle).toBeFocused()
  })
})
