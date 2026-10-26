import { expect, test } from '@playwright/test'
import type {} from './main'

for (const entry of ['index', 'umd']) {
  test.describe(entry, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/quick-assist/${entry}.html`)
      await page.waitForFunction(() => !!window.qa)
    })

    for (const owner of ['validator', 'provider']) {
      test(`remote structured metadata is isolated from ${owner} mutations`, async ({ page }) => {
        await page.evaluate((owner) => {
          const cycle: Record<string, unknown> = {}
          cycle.self = cycle
          const meta = {
            nested: { value: 'original' },
            date: new Date('2026-01-01T00:00:00Z'),
            map: new Map([['key', { value: 'original' }]]),
            set: new Set(['original']),
            bytes: new Uint8Array([42]),
            bigint: BigInt(123),
            cycle,
          }
          const mutate = (value: typeof meta) => {
            value.nested.value = 'mutated'
            value.date.setUTCFullYear(2000)
            value.map.get('key')!.value = 'mutated'
            value.set.clear()
            value.bytes[0] = 0
            value.cycle.self = null
          }
          window.qa.updateOptions({
            suggestions: [],
            getSuggestions: async () => [{ id: 'remote', label: 'Remote metadata', prompt: 'explain', meta }],
            validateSuggestion: (suggestion) => {
              if (owner === 'validator') mutate(suggestion.meta as typeof meta)
              return true
            },
            mergeSuggestions: (_base, incoming) => {
              if ((incoming[0].meta as typeof meta).nested.value !== 'original') {
                throw new Error('Validator mutated merge input')
              }
              // A retained provider object is mutated after its result has been received.
              if (owner === 'provider') mutate(meta)
              return incoming
            },
            adapter: {
              submit: (request) => {
                window.qaRequests.push(request)
              },
            },
          })
          window.qa.activate({ text: 'Explain', anchor: document.querySelector('#term')!, open: 'popover' })
        }, owner)
        await page.getByRole('button', { name: 'Remote metadata', exact: true }).click()
        expect(
          await page.evaluate(() => {
            const meta = window.qaRequests[0].suggestion!.meta!
            return {
              nested: meta.nested,
              date: (meta.date as Date).toISOString(),
              map: (meta.map as Map<string, { value: string }>).get('key'),
              set: [...(meta.set as Set<string>)],
              bytes: [...(meta.bytes as Uint8Array)],
              bigint: meta.bigint === BigInt(123),
              cycle: (meta.cycle as Record<string, unknown>).self === meta.cycle,
            }
          }),
        ).toEqual({
          nested: { value: 'original' },
          date: '2026-01-01T00:00:00.000Z',
          map: { value: 'original' },
          set: ['original'],
          bytes: [42],
          bigint: true,
          cycle: true,
        })
        expect(await page.evaluate(() => window.qaEvents.some((event) => event.type === 'error'))).toBe(false)
      })
    }

    for (const validSibling of [true, false]) {
      test(`uncloneable remote metadata is filtered, valid sibling: ${validSibling}`, async ({ page }) => {
        await page.evaluate((validSibling) => {
          window.qa.updateOptions({
            suggestions: [{ id: 'base', label: 'Base fallback', prompt: 'base' }],
            getSuggestions: async () => [
              { id: 'invalid', label: 'Invalid', prompt: 'invalid', meta: { fn: () => {} } },
              ...(validSibling
                ? [{ id: 'valid', label: 'Valid remote', prompt: 'valid', meta: { nested: { value: 'clean' } } }]
                : []),
            ],
          })
          window.qa.activate({ text: 'Explain', anchor: document.querySelector('#term')!, open: 'popover' })
        }, validSibling)
        await expect(page.locator('.tr-quick-assist__suggestion')).toHaveText(
          validSibling ? ['Base fallback', 'Valid remote'] : ['Base fallback'],
        )
        await expect
          .poll(() =>
            page.evaluate(() =>
              window.qaEvents.some((event) => event.type === 'error' && event.stage === 'suggestions'),
            ),
          )
          .toBe(!validSibling)
      })
    }

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
