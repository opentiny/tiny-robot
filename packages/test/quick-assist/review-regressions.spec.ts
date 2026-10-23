import { expect, test } from '@playwright/test'
import type {} from './main'

for (const entry of ['index', 'umd']) {
  test.describe(entry, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/quick-assist/${entry}.html`)
      await page.waitForFunction(() => !!window.qa)
    })

    test('each remote callback receives an independent sanitized context', async ({ page }) => {
      await page.evaluate(() => {
        window.qa.updateOptions({
          suggestions: [],
          sanitizeContext: (context) => ({ ...context, text: 'sanitized', meta: { nested: { value: 'clean' } } }),
          getSuggestions: async (context) => {
            context.text = 'provider mutation'
            ;(context.meta!.nested as { value: string }).value = 'provider mutation'
            await Promise.resolve()
            return [
              { id: 'first', label: 'First', prompt: 'first' },
              { id: 'second', label: 'Second', prompt: 'second' },
            ]
          },
          validateSuggestion: (_suggestion, context) => {
            const valid = context.text === 'sanitized' && (context.meta!.nested as { value: string }).value === 'clean'
            context.text = 'validator mutation'
            ;(context.meta!.nested as { value: string }).value = 'validator mutation'
            return valid
          },
          mergeSuggestions: (_base, incoming, context) => {
            if (context.text !== 'sanitized' || (context.meta!.nested as { value: string }).value !== 'clean') {
              throw new Error('Merge context was mutated')
            }
            return incoming
          },
          adapter: {
            submit: (request) => {
              window.qaRequests.push(request)
            },
          },
        })
        window.qa.activate({ text: 'Explain this', anchor: document.querySelector('#term')!, open: 'popover' })
      })
      await expect(page.locator('.tr-quick-assist__suggestion')).toHaveText(['First', 'Second'])
      await page.getByRole('button', { name: 'Second', exact: true }).click()
      expect(await page.evaluate(() => window.qaRequests[0].context)).toMatchObject({
        text: 'sanitized',
        meta: { nested: { value: 'clean' } },
      })
      expect(await page.evaluate(() => window.qaEvents.some((event) => event.type === 'error'))).toBe(false)
    })

    test('activation and suggestion metadata preserve structured values and detach from callers', async ({ page }) => {
      await page.evaluate(() => {
        window.qa.updateOptions({
          adapter: {
            submit: (request) => {
              window.qaRequests.push(request)
            },
          },
        })
        const makeMeta = () => {
          const cycle: Record<string, unknown> = {}
          cycle.self = cycle
          return {
            date: new Date('2026-01-01T00:00:00Z'),
            map: new Map([['key', { value: 'original' }]]),
            set: new Set(['original']),
            bytes: new Uint8Array([42]),
            bigint: BigInt(123),
            cycle,
          }
        }
        const meta = makeMeta()
        const suggestionMeta = makeMeta()
        window.qa.activate({
          text: 'Explain metadata',
          anchor: document.querySelector('#term')!,
          open: 'popover',
          meta,
          suggestions: [{ id: 'meta', label: 'Metadata', prompt: 'explain', meta: suggestionMeta }],
        })
        for (const original of [meta, suggestionMeta]) {
          original.date.setUTCFullYear(2000)
          original.map.get('key')!.value = 'mutated'
          original.set.clear()
          original.bytes[0] = 0
          original.cycle.self = null
        }
      })
      await expect(page.getByRole('button', { name: 'Metadata', exact: true })).toBeVisible()
      await page.getByRole('button', { name: 'Metadata', exact: true }).click()
      expect(
        await page.evaluate(() => {
          const request = window.qaRequests[0]
          return [request.context.meta, request.suggestion?.meta].map((meta) => {
            const date = meta?.date as Date
            const map = meta?.map as Map<string, { value: string }>
            const set = meta?.set as Set<string>
            const bytes = meta?.bytes as Uint8Array
            const cycle = meta?.cycle as Record<string, unknown>
            return {
              date: date instanceof Date && date.toISOString(),
              map: map instanceof Map && map.get('key')?.value,
              set: set instanceof Set && [...set],
              bytes: bytes instanceof Uint8Array && [...bytes],
              bigint: meta?.bigint === BigInt(123),
              cycle: cycle?.self === cycle,
            }
          })
        }),
      ).toEqual(
        Array(2).fill({
          date: '2026-01-01T00:00:00.000Z',
          map: 'original',
          set: ['original'],
          bytes: [42],
          bigint: true,
          cycle: true,
        }),
      )
      expect(await page.evaluate(() => window.qaEvents.some((event) => event.type === 'error'))).toBe(false)
    })
  })
}
