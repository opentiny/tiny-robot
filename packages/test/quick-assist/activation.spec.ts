import { expect, test } from '@playwright/test'
import type { QuickAssistActivationInput, Suggestion } from '../../components/src/vanilla'
import type {} from './main'

declare global {
  interface Window {
    makeActivation: (text?: string, identity?: string) => QuickAssistActivationInput
    sourceEmits: Array<(input: QuickAssistActivationInput | null) => void>
    sourceStops: Array<() => void>
    addSource: () => void
    anchorNotify?: () => void
    anchorValid: boolean
    anchorX: number
    anchorReleased: number
    resolveLocalSuggestions?: (items: Suggestion[]) => void
    localSuggestionSignal?: AbortSignal
    defaultProviderCalls: number
  }
}
const trigger = '.tr-quick-assist__trigger'
const popover = '.tr-quick-assist__popover'

test.beforeEach(async ({ page }) => {
  await page.goto('/quick-assist/index.html')
  await page.waitForFunction(() => !!window.qa)
  await page.evaluate(() => {
    window.anchorValid = true
    window.anchorX = 220
    window.anchorReleased = 0
    window.makeActivation = (text = 'explainCode()', identity) => ({
      source: 'editor',
      text,
      identity,
      direction: 'backward',
      getRect: () => (window.anchorValid ? new DOMRect(window.anchorX, 180, 0, 20) : null),
      onInvalidate: (notify) => {
        window.anchorNotify = notify
        return () => {
          window.anchorReleased++
        }
      },
    })
    window.sourceEmits = []
    window.sourceStops = []
    window.addSource = () => {
      window.sourceStops.push(
        window.qa.registerSource({
          name: 'same-name',
          activate: (emit) => {
            window.sourceEmits.push(emit)
          },
          deactivate() {},
        }),
      )
    }
  })
})

test('direct activation opens and focuses the composer without entry events or showDelay', async ({ page }) => {
  await page.evaluate(() => {
    window.qa.updateOptions({ trigger: { showDelay: 10_000 } })
    window.qa.activate({ text: '直接解释', anchor: document.querySelector('#term')!, open: 'popover' })
  })
  await expect(page.locator(`${popover} textarea`)).toBeFocused()
  await expect(page.locator(trigger)).toHaveCount(0)
  const events = await page.evaluate(() => window.qaEvents.map((event) => event.type))
  expect(events).toContain('selection')
  expect(events).toContain('popover_show')
  expect(events).not.toContain('trigger_show')
  expect(events).not.toContain('trigger_click')
  await page.evaluate(() => document.querySelector('#scope')!.remove())
  await expect(page.locator(popover)).toHaveCount(0)
})

test('per-activation templates are frozen, sanitized, isolated and opt out of the default provider', async ({
  page,
}) => {
  await page.evaluate(() => {
    window.defaultProviderCalls = 0
    window.qa.updateOptions({
      suggestions: [{ id: 'global', label: '页面默认问题', prompt: '页面问题' }],
      getSuggestions: () => {
        window.defaultProviderCalls++
        return [{ id: 'remote', label: '页面远程问题', prompt: '页面远程问题' }]
      },
      sanitizeContext: (context) => ({ ...context, text: 'sanitized code' }),
    })
    const local = [{ id: 'code', label: '代码专属问题', prompt: '代码问题' }]
    window.qa.activate({
      ...window.makeActivation(),
      open: 'popover',
      suggestions: [
        ...local,
        { id: 'factory', getLabel: (context) => context.text, getPrompt: (context) => `Explain ${context.text}` },
      ],
    })
    local[0].label = 'MUTATED'
  })
  await expect(page.locator('.tr-quick-assist__suggestion')).toHaveText(['代码专属问题', 'sanitized code'])
  expect(await page.evaluate(() => window.defaultProviderCalls)).toBe(0)
  await page.getByRole('button', { name: 'sanitized code', exact: true }).click()
  expect(await page.evaluate(() => window.qaRequests[0].prompt)).toBe('Explain sanitized code')
  await page.evaluate(() => window.qa.activate({ ...window.makeActivation(), open: 'popover' }))
  await expect(page.locator('.tr-quick-assist__suggestion')).toHaveText(['页面默认问题', '页面远程问题'])
  expect(await page.evaluate(() => window.defaultProviderCalls)).toBe(1)
  await page.evaluate(() => window.qa.activate({ ...window.makeActivation(), open: 'popover', suggestions: [] }))
  await expect(page.locator('.tr-quick-assist__suggestion')).toHaveCount(0)
  expect(await page.evaluate(() => window.defaultProviderCalls)).toBe(1)
  await page.evaluate(() => window.qa.activate({ ...window.makeActivation(), open: 'popover', getSuggestions: null }))
  await expect(page.locator('.tr-quick-assist__suggestion')).toHaveText(['页面默认问题'])
})

test('per-activation asynchronous recommendations are aborted and cannot replace a new session', async ({ page }) => {
  await page.evaluate(() => {
    window.qa.activate({
      ...window.makeActivation('old'),
      open: 'popover',
      suggestions: [],
      getSuggestions: (_context, signal) => {
        window.localSuggestionSignal = signal
        return new Promise((resolve) => {
          window.resolveLocalSuggestions = resolve
        })
      },
    })
  })
  await expect.poll(() => page.evaluate(() => !!window.resolveLocalSuggestions)).toBe(true)
  await page.evaluate(() => {
    window.qa.activate({
      ...window.makeActivation('new'),
      open: 'popover',
      suggestions: [{ id: 'new', label: '新会话问题', prompt: '新会话问题' }],
    })
    window.resolveLocalSuggestions?.([{ id: 'stale', label: '旧异步问题', prompt: '旧异步问题' }])
  })
  await expect(page.locator('.tr-quick-assist__suggestion')).toHaveText(['新会话问题'])
  expect(await page.evaluate(() => window.localSuggestionSignal?.aborted)).toBe(true)
})

test('explicit activation freezes nearby/meta and reuses the sanitized submission pipeline', async ({ page }) => {
  await page.evaluate(() => {
    window.qa.updateOptions({
      nearbyContext: { maxLength: 8 },
      getNearbyContext: () => {
        throw new Error('DOM-only hook must not run')
      },
      selection: {
        validate: () => {
          throw new Error('DOM-only validation must not run')
        },
      },
      sanitizeContext: (context) => ({ ...context, meta: { ...context.meta, secret: '[redacted]' } }),
    })
    let nearby = 'before code context'
    const meta = { language: 'typescript', secret: 'private', nested: { version: 1 } }
    window.qa.activate({ ...window.makeActivation(), meta, getNearbyText: () => nearby })
    nearby = 'new context'
    meta.nested.version = 2
    document.dispatchEvent(new Event('selectionchange'))
  })
  await expect(page.locator(trigger)).toBeVisible()
  const box = await page.locator(trigger).boundingBox()
  expect(box!.x).toBeCloseTo(220, 0)
  await expect.poll(async () => (await page.locator(trigger).boundingBox())!.y).toBeCloseTo(208, 0)
  await page.locator(trigger).click()
  await expect(page.locator(`${popover} textarea`)).toHaveValue('explainCode()')
  await page.locator(`${popover} textarea`).press('Enter')
  await expect.poll(() => page.evaluate(() => window.qaRequests.length)).toBe(1)
  const request = await page.evaluate(() => window.qaRequests[0])
  expect(request.source).toBe('editor')
  expect(request.context.nearbyText).toBe('before c')
  expect(request.context.meta).toEqual({ language: 'typescript', secret: '[redacted]', nested: { version: 1 } })
  expect(await page.evaluate(() => window.anchorReleased)).toBe(1)
})

test('synthetic validation overrides text rules but cannot bypass length or geometry', async ({ page }) => {
  await page.evaluate(() => {
    window.qa.updateOptions({ selection: { maxTextLength: 6, validateActivation: () => true } })
    window.qa.activate(window.makeActivation('1234567'))
  })
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.evaluate(() =>
    window.qa.activate({ ...window.makeActivation('123'), getRect: () => new DOMRect(NaN, 20, 0, 20) }),
  )
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.evaluate(() => window.qa.activate(window.makeActivation('=>')))
  await expect(page.locator(trigger)).toBeVisible()
})

test('invalidation is installed during showDelay and releases exactly once', async ({ page }) => {
  await page.evaluate(() => {
    window.qa.updateOptions({ trigger: { showDelay: 500 } })
    window.qa.activate(window.makeActivation())
    window.anchorValid = false
    window.anchorNotify?.()
  })
  await expect.poll(() => page.evaluate(() => window.anchorReleased)).toBe(1)
  await page.waitForTimeout(550)
  await expect(page.locator(trigger)).toHaveCount(0)
  expect(await page.evaluate(() => window.qaEvents.filter((e) => e.type === 'close').map((e) => e.reason))).toContain(
    'anchor-invalid',
  )
})

test('anchor notifications reposition the composer and remain subscribed until close', async ({ page }) => {
  await page.evaluate(() => window.qa.activate(window.makeActivation()))
  await page.locator(trigger).click()
  const before = await page.locator(popover).boundingBox()
  await page.evaluate(() => {
    window.anchorX += 80
    window.anchorNotify?.()
  })
  await expect.poll(async () => (await page.locator(popover).boundingBox())!.x).toBeCloseTo(before!.x + 80, 0)
  expect(await page.evaluate(() => window.anchorReleased)).toBe(0)
  await page.evaluate(() => {
    window.anchorValid = false
    window.anchorNotify?.()
  })
  await expect(page.locator(popover)).toHaveCount(0)
  expect(await page.evaluate(() => window.anchorReleased)).toBe(1)
})

test('element shortcut detects ancestor removal without scroll or window resize', async ({ page }) => {
  await page.evaluate(() => window.qa.activate({ text: 'shortcut', anchor: document.querySelector('#term')! }))
  await expect(page.locator(trigger)).toBeVisible()
  await page.evaluate(() => document.querySelector('#scope')!.remove())
  await expect(page.locator(trigger)).toHaveCount(0)
  expect(
    await page.evaluate(() => window.qaEvents.some((e) => e.type === 'close' && e.reason === 'anchor-invalid')),
  ).toBe(true)
})

test('element shortcut observes ancestor hiding during the delay', async ({ page }) => {
  await page.evaluate(() => {
    window.qa.updateOptions({ trigger: { showDelay: 500 } })
    window.qa.activate({ text: 'shortcut', anchor: document.querySelector('#term')! })
    document.querySelector<HTMLElement>('#scope')!.style.display = 'none'
  })
  await expect
    .poll(() => page.evaluate(() => window.qaEvents.some((e) => e.type === 'close' && e.reason === 'anchor-invalid')))
    .toBe(true)
  await page.waitForTimeout(550)
  await expect(page.locator(trigger)).toHaveCount(0)
})

test('same-name sources and same identities have isolated ownership', async ({ page }) => {
  await page.evaluate(() => {
    window.addSource()
    window.addSource()
    window.sourceEmits[0](window.makeActivation('first', 'same'))
    window.sourceEmits[1](window.makeActivation('second', 'same'))
    window.sourceEmits[0](null)
    window.sourceStops[0]()
    document.dispatchEvent(new Event('selectionchange'))
  })
  await page.locator(trigger).click()
  await expect(page.locator(`${popover} textarea`)).toHaveValue('second')
  await page.evaluate(() => window.sourceEmits[1](null))
  await expect(page.locator(popover)).toHaveCount(0)
})

test('an invalid automatic selection clears the old session and allows reselection', async ({ page }) => {
  await page.evaluate(() => {
    window.addSource()
    window.sourceEmits[0](window.makeActivation('old', 'old'))
  })
  await expect(page.locator(trigger)).toBeVisible()
  await page.evaluate(() => window.sourceEmits[0](window.makeActivation('123456', 'invalid')))
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.evaluate(() => window.sourceEmits[0](window.makeActivation('old', 'old')))
  await expect(page.locator(trigger)).toBeVisible()
})

test('automatic source does not reopen a dismissed selection; explicit API can reopen it', async ({ page }) => {
  await page.evaluate(() => {
    window.addSource()
    window.sourceEmits[0](window.makeActivation('same selection', 'same'))
  })
  await page.locator(trigger).click()
  await page.keyboard.press('Escape')
  await page.evaluate(() => window.sourceEmits[0](window.makeActivation('same selection', 'same')))
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.evaluate(() => window.qa.activate(window.makeActivation('same selection', 'same')))
  await expect(page.locator(trigger)).toBeVisible()
  await page.evaluate(() => {
    window.qa.close()
    window.sourceEmits[0](null)
    window.sourceEmits[0](window.makeActivation('same selection', 'same'))
  })
  await expect(page.locator(trigger)).toBeVisible()
})

test('old emitters cannot revive after disable, options rebuild, unregister or destroy', async ({ page }) => {
  await page.evaluate(() => {
    window.addSource()
    window.qa.disable()
    window.sourceEmits[0](window.makeActivation())
    window.qa.activate(window.makeActivation())
    window.qa.enable()
    window.sourceEmits[0](window.makeActivation('stale disabled'))
  })
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.evaluate(() => window.sourceEmits[1](window.makeActivation('current')))
  await expect(page.locator(trigger)).toBeVisible()
  await page.evaluate(() => {
    window.qa.updateOptions({ trigger: { offset: 12 } })
    window.sourceEmits[1](window.makeActivation('stale options'))
  })
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.evaluate(() => window.sourceEmits[2](window.makeActivation('new options')))
  await expect(page.locator(trigger)).toBeVisible()
  await page.evaluate(() => {
    window.sourceStops[0]()
    window.sourceEmits[2](window.makeActivation('unregistered'))
  })
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.evaluate(() => {
    window.qa.destroy()
    window.sourceEmits[2](window.makeActivation('destroyed'))
    window.qa.activate(window.makeActivation())
  })
  await expect(page.locator(trigger)).toHaveCount(0)
})

for (const callback of ['getRect', 'validateActivation', 'getNearbyText', 'close'] as const) {
  for (const mutation of ['unregister', 'disable-enable', 'updateOptions'] as const) {
    test(`in-flight emit is invalidated by ${mutation} inside ${callback}`, async ({ page }) => {
      await page.evaluate(
        ({ callback, mutation }) => {
          let armed = false
          const invalidate = () => {
            if (!armed) return
            armed = false
            if (mutation === 'unregister') window.sourceStops[0]()
            else if (mutation === 'disable-enable') {
              window.qa.disable()
              window.qa.enable()
            } else window.qa.updateOptions({ trigger: { offset: 12 } })
          }
          window.qa.updateOptions({
            selection: {
              validateActivation: () => {
                if (callback === 'validateActivation') invalidate()
                return true
              },
            },
            onEvent: (event) => {
              window.qaEvents.push(event)
              if (callback === 'close' && event.type === 'close' && event.reason === 'reselection') invalidate()
            },
          })
          window.addSource()
          if (callback === 'close') window.sourceEmits[0](window.makeActivation('old selection', 'old'))
          window.qaEvents.length = 0
          const input = window.makeActivation('new selection', 'new')
          const getRect = input.getRect
          input.getRect = () => {
            if (callback === 'getRect') invalidate()
            return getRect()
          }
          input.getNearbyText = () => {
            if (callback === 'getNearbyText') invalidate()
            return 'nearby code'
          }
          armed = true
          window.sourceEmits[0](input)
        },
        { callback, mutation },
      )
      await expect(page.locator(trigger)).toHaveCount(0)
      await expect(page.locator(popover)).toHaveCount(0)
      expect(await page.evaluate(() => window.qaEvents.some((event) => event.type === 'selection'))).toBe(false)
      if (mutation !== 'unregister') {
        await page.evaluate(() => window.sourceEmits.at(-1)!(window.makeActivation('fresh selection', 'fresh')))
        await expect(page.locator(trigger)).toBeVisible()
      }
    })
  }
}

for (const open of ['trigger', 'popover'] as const) {
  test(`source removed during ${open} geometry check cannot leave orphaned UI`, async ({ page }) => {
    await page.evaluate((open) => {
      window.addSource()
      let reads = 0
      const input = window.makeActivation()
      const getRect = input.getRect
      window.sourceEmits[0]({
        ...input,
        open,
        getRect: () => {
          // First validate, then initialize the session anchor, then show UI.
          if (++reads === 3) window.sourceStops[0]()
          return getRect()
        },
      })
    }, open)
    await expect(page.locator(trigger)).toHaveCount(0)
    await expect(page.locator(popover)).toHaveCount(0)
  })
}

test('significant anchor movement on scroll closes the entry', async ({ page }) => {
  await page.evaluate(() => window.qa.activate(window.makeActivation()))
  await expect(page.locator(trigger)).toBeVisible()
  await page.evaluate(() => {
    window.anchorX += 10
    document.dispatchEvent(new Event('scroll'))
  })
  await expect(page.locator(trigger)).toHaveCount(0)
  expect(await page.evaluate(() => window.qaEvents.some((e) => e.type === 'close' && e.reason === 'scroll'))).toBe(true)
})

test('throwing providers or synchronous invalidation cannot leak a delayed session', async ({ page }) => {
  await page.evaluate(() => {
    window.qa.activate({
      ...window.makeActivation(),
      getRect: () => {
        throw new Error('invalid geometry')
      },
    })
    window.qa.updateOptions({ trigger: { showDelay: 50 } })
    window.qa.activate({
      ...window.makeActivation(),
      onInvalidate: (notify) => {
        window.anchorValid = false
        notify()
        return () => {
          window.anchorReleased++
        }
      },
    })
  })
  await expect.poll(() => page.evaluate(() => window.anchorReleased)).toBe(1)
  await expect(page.locator(trigger)).toHaveCount(0)
  expect(await page.evaluate(() => window.qaEvents.some((e) => e.type === 'error' && e.stage === 'callback'))).toBe(
    true,
  )
})

test('automatic identity is retained even when an event hook immediately closes the session', async ({ page }) => {
  await page.evaluate(() => {
    let activations = 0
    window.qa.updateOptions({
      onEvent: (event) => {
        window.qaEvents.push(event)
        if (event.type === 'trigger_show') {
          activations++
          window.qa.close()
        }
      },
    })
    window.addSource()
    window.sourceEmits[0](window.makeActivation('same', 'same'))
    window.sourceEmits[0](window.makeActivation('same', 'same'))
    if (activations !== 1) throw new Error('Dismissed identity reopened')
  })
  await expect(page.locator(trigger)).toHaveCount(0)
})

test('cleanup can open a new session without the previous close removing its UI', async ({ page }) => {
  await page.evaluate(() => {
    window.qa.activate({
      ...window.makeActivation('old'),
      onInvalidate: () => () => {
        window.qa.activate({ ...window.makeActivation('new'), onInvalidate: undefined })
      },
    })
    window.qa.close()
  })
  await page.locator(trigger).click()
  await expect(page.locator(`${popover} textarea`)).toHaveValue('new')
})

test('UMD instance exposes the same explicit activation workflow', async ({ page }) => {
  await page.goto('/quick-assist/umd.html')
  await page.waitForFunction(() => !!window.qa)
  await page.evaluate(() => window.qa.activate({ text: 'UMD 主动解释', anchor: document.querySelector('#term')! }))
  await page.locator(trigger).click()
  await expect(page.locator(`${popover} textarea`)).toHaveValue('UMD 主动解释')
  await page.locator(`${popover} textarea`).press('Enter')
  await expect.poll(() => page.evaluate(() => window.qaRequests.length)).toBe(1)
  expect(await page.evaluate(() => window.qaRequests[0].source)).toBe('manual')
})
