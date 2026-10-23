import { expect, test } from '@playwright/test'
import type {} from './main'

for (const entry of ['index', 'umd']) {
  test.describe(entry, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/quick-assist/${entry}.html`)
      await page.waitForFunction(() => !!window.qa)
    })

    test('an anchor that restores visibility under a hidden ancestor can activate', async ({ page }) => {
      await page.evaluate(() => {
        const parent = document.createElement('div')
        parent.id = 'hidden-parent'
        parent.style.visibility = 'hidden'
        const anchor = document.createElement('button')
        anchor.id = 'visible-anchor'
        anchor.style.visibility = 'visible'
        anchor.textContent = 'Visible anchor'
        parent.append(anchor)
        document.body.prepend(parent)
        window.qa.activate({ text: 'Explain the visible anchor', anchor })
      })
      const trigger = page.locator('.tr-quick-assist__trigger')
      await expect(trigger).toBeVisible()
      // Trigger an ancestor observation; the visible override must remain valid.
      await page.locator('#hidden-parent').evaluate((parent) => {
        parent.style.color = 'blue'
      })
      await page.evaluate(
        () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
      )
      await expect(trigger).toBeVisible()
      await trigger.click()
      await expect(page.locator('.tr-quick-assist__popover')).toBeVisible()
      await page.locator('#visible-anchor').evaluate((anchor) => {
        anchor.style.visibility = 'inherit'
      })
      await expect(page.locator('.tr-quick-assist__popover')).toHaveCount(0)
      expect(
        await page.evaluate(() =>
          window.qaEvents.some((event) => event.type === 'close' && event.reason === 'anchor-invalid'),
        ),
      ).toBe(true)
    })

    for (const hidden of ['inherited-visibility', 'own-visibility', 'ancestor-display', 'ancestor-hidden']) {
      test(`a hidden anchor is rejected: ${hidden}`, async ({ page }) => {
        await page.evaluate((hidden) => {
          const parent = document.createElement('div')
          const anchor = document.createElement('button')
          anchor.textContent = 'Hidden anchor'
          if (hidden === 'inherited-visibility') parent.style.visibility = 'hidden'
          if (hidden === 'own-visibility') anchor.style.visibility = 'hidden'
          if (hidden === 'ancestor-display') {
            parent.style.display = 'none'
            anchor.style.visibility = 'visible'
          }
          if (hidden === 'ancestor-hidden') {
            parent.hidden = true
            anchor.style.visibility = 'visible'
          }
          parent.append(anchor)
          document.body.prepend(parent)
          window.qa.activate({ text: 'Explain hidden anchor', anchor })
        }, hidden)
        await expect(page.locator('.tr-quick-assist__trigger')).toHaveCount(0)
        expect(await page.evaluate(() => window.qaEvents.length)).toBe(0)
      })
    }

    for (const width of [1280, 240]) {
      test(`a long trigger label stays inside its button at viewport width ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 720 })
        const label = 'Ask the AI assistant about this selection with a very long trigger label'
        await page.evaluate((label) => {
          window.qa.updateOptions({ trigger: { label } })
          window.qa.activate({ text: 'Explain this term', anchor: document.querySelector('#term')! })
        }, label)
        const trigger = page.getByRole('button', { name: label, exact: true })
        await expect(trigger).toBeVisible()
        await expect(trigger).toHaveAttribute('title', label)
        const geometry = await trigger.evaluate((button) => {
          const text = button.querySelector<HTMLElement>('.tr-quick-assist__trigger-label')!
          const icon = button.querySelector('.tr-quick-assist__sparkle')!
          const buttonRect = button.getBoundingClientRect()
          const textRect = text.getBoundingClientRect()
          return {
            buttonWidth: buttonRect.width,
            buttonLeft: buttonRect.left,
            buttonRight: buttonRect.right,
            textRight: textRect.right,
            textClipped: text.scrollWidth > text.clientWidth,
            overflow: getComputedStyle(text).overflow,
            textOverflow: getComputedStyle(text).textOverflow,
            iconWidth: icon.getBoundingClientRect().width,
          }
        })
        expect(geometry.buttonWidth).toBeLessThanOrEqual(Math.min(220, width - 16))
        expect(geometry.buttonLeft).toBeGreaterThanOrEqual(0)
        expect(geometry.buttonRight).toBeLessThanOrEqual(width)
        expect(geometry.textRight).toBeLessThan(geometry.buttonRight)
        expect(geometry.textClipped).toBe(true)
        expect(geometry.overflow).toBe('hidden')
        expect(geometry.textOverflow).toBe('ellipsis')
        expect(geometry.iconWidth).toBe(16)
        await trigger.click()
        await expect(page.locator('.tr-quick-assist__popover')).toBeVisible()
      })
    }
  })
}
