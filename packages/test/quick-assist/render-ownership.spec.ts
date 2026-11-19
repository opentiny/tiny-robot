import { expect, test } from '@playwright/test'
import type { Suggestion } from '../../components/src/vanilla'
import type { QuickAssistSession } from '../../components/src/vanilla/quick-assist/core/types'
import type { QuickAssistUIController } from '../../components/src/vanilla/quick-assist/ui'
import type {} from './main'

declare global {
  interface Window {
    ownershipPending: Array<{ resolve(items: Suggestion[]): void; reject(error: Error): void }>
    reopenOwnedPopover: () => void
  }
}

for (const entry of ['index', 'umd']) {
  for (const outcome of ['resolve', 'reject']) {
    test(`${entry} ignores a superseded popover's late ${outcome} after the current response`, async ({ page }) => {
      await page.goto(`/quick-assist/${entry}.html`)
      await page.waitForFunction(() => !!window.qa)
      await page.evaluate(() => {
        window.ownershipPending = []
        window.qa.updateOptions({
          suggestions: [],
          getSuggestions: () =>
            new Promise<Suggestion[]>((resolve, reject) => window.ownershipPending.push({ resolve, reject })),
        })
        window.qa.activate({ text: '推荐归属', anchor: document.querySelector('#term')! })
        const trigger = document.querySelector<HTMLButtonElement>('.tr-quick-assist__trigger')!
        window.reopenOwnedPopover = () => trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      })
      await page.locator('.tr-quick-assist__trigger').click()
      await expect.poll(() => page.evaluate(() => window.ownershipPending.length)).toBe(1)
      await page.evaluate(() => window.reopenOwnedPopover())
      await expect.poll(() => page.evaluate(() => window.ownershipPending.length)).toBe(2)
      await page.evaluate(() =>
        window.ownershipPending[1].resolve([{ id: 'B', label: 'Current B', prompt: 'B prompt' }]),
      )
      const suggestions = page.locator('.tr-quick-assist__suggestion')
      await expect(suggestions).toHaveText(['Current B'])
      await page.evaluate(async (outcome) => {
        if (outcome === 'resolve') {
          window.ownershipPending[0].resolve([{ id: 'A', label: 'Stale A', prompt: 'A prompt' }])
        } else window.ownershipPending[0].reject(new Error('Stale A failure'))
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
      }, outcome)
      await expect(suggestions).toHaveText(['Current B'])
      expect(await page.evaluate(() => window.qaEvents.filter((event) => event.type === 'error'))).toEqual([])
      await suggestions.click()
      expect(await page.evaluate(() => window.qaRequests[0])).toMatchObject({ query: 'Current B', prompt: 'B prompt' })
    })
  }
}

test('the newest standalone suggestion update owns the list and disabled state', async ({ page }) => {
  await page.goto('/quick-assist/index.html')
  await page.waitForFunction(() => !!window.qa)
  const sourceUrl = `/@fs${new URL('../../components/src/vanilla/quick-assist/ui/index.ts', import.meta.url).pathname}`
  const result = await page.evaluate(async (sourceUrl) => {
    window.qa.destroy()
    const { createQuickAssistUI }: typeof import('../../components/src/vanilla/quick-assist/ui') = await import(
      sourceUrl
    )
    let nested = false
    const clicked: string[] = []
    const controller: QuickAssistUIController = createQuickAssistUI({
      root: document,
      attrs: {
        suggestion: (suggestion) => {
          if (suggestion.id === 'A' && !nested) {
            nested = true
            controller.update({ suggestions: [{ id: 'B', label: 'Newest B', prompt: 'B' }], submittingDisabled: true })
          }
          return {}
        },
      },
    })
    const session: QuickAssistSession = {
      id: 100,
      activation: { source: 'standalone', text: 'render ownership' },
      controller: new AbortController(),
      state: 'composer',
      suggestions: [{ id: 'A', label: 'Stale A', prompt: 'A' }],
      inputValue: '',
      originalActiveElement: null,
      submitStarted: false,
    }
    try {
      controller.showPopover({
        session,
        onSubmit() {},
        onClose() {},
        onSuggestionClick: (item) => clicked.push(item.id),
      })
      const buttons = () => [...document.querySelectorAll<HTMLButtonElement>('.tr-quick-assist__suggestion')]
      const disabled = buttons().map((button) => ({ label: button.textContent, disabled: button.disabled }))
      buttons().forEach((button) => button.click())
      const disabledClicks = clicked.slice()
      controller.update({ submittingDisabled: false })
      buttons().forEach((button) => button.click())
      return { disabled, disabledClicks, clicked }
    } finally {
      controller.destroy()
    }
  }, sourceUrl)
  expect(result).toEqual({ disabled: [{ label: 'Newest B', disabled: true }], disabledClicks: [], clicked: ['B'] })
  await expect(page.locator('.tr-quick-assist')).toHaveCount(0)
})
