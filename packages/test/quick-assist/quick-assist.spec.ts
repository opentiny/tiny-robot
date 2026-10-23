import { expect, test, type Page } from '@playwright/test'
import type {
  QuickAssistContext,
  QuickAssistInstance,
  QuickAssistOptions,
  Suggestion,
} from '../../components/src/vanilla'

declare global {
  interface Window {
    TinyRobotVanilla: { createQuickAssist(options: QuickAssistOptions): QuickAssistInstance }
    pendingAdapter: Array<() => void>
    pendingSuggestions: Map<string, (items: Suggestion[]) => void>
    qa2: QuickAssistInstance
    resolveSuggestion: () => void
  }
}

const trigger = '.tr-quick-assist__trigger'
const popover = '.tr-quick-assist__popover'

async function select(page: Page, selector = '#term') {
  await page.locator(selector).scrollIntoViewIfNeeded()
  await page.locator(selector).evaluate((element) => {
    const range = document.createRange()
    range.selectNodeContents(element)
    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)
    document.dispatchEvent(new Event('selectionchange'))
  })
}

async function dragSelectText(page: Page, selector: string) {
  const target = page.locator(selector)
  await target.scrollIntoViewIfNeeded()
  const points = await target.evaluate((element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
    const textNodes: Text[] = []
    for (let current = walker.nextNode(); current; current = walker.nextNode()) {
      if (current.textContent?.trim()) textNodes.push(current as Text)
    }
    const first = document.createRange()
    first.selectNodeContents(textNodes[0])
    const last = document.createRange()
    last.selectNodeContents(textNodes[textNodes.length - 1])
    const firstRect = first.getBoundingClientRect()
    const lastRect = last.getBoundingClientRect()
    const y = (firstRect.top + firstRect.bottom) / 2
    return {
      start: { x: firstRect.left + 1, y },
      end: { x: lastRect.right - 1, y: (lastRect.top + lastRect.bottom) / 2 },
    }
  })
  await page.mouse.move(points.start.x, points.start.y)
  await page.mouse.down()
  await page.mouse.move(points.end.x, points.end.y, { steps: 8 })
  await page.mouse.up()
}

async function open(page: Page, selector = '#term') {
  await select(page, selector)
  await page.locator(trigger).click()
  await expect(page.locator(popover)).toBeVisible()
}

async function pauseClock(page: Page) {
  await page.clock.install()
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000))
}

test.beforeEach(async ({ page }) => {
  await page.goto('/quick-assist/index.html')
  await page.waitForFunction(() => typeof window.resetQuickAssist === 'function')
})

test('manual submission closes before adapter and opens the host chat with context', async ({ page }) => {
  await open(page)
  const input = page.locator(`${popover} textarea`)
  await expect(input).toHaveValue('竞价计费')
  await input.fill('与按需计费有什么区别？')
  await input.press('Enter')
  await expect(page.locator(popover)).toHaveCount(0)
  await expect(page.locator('#chat')).toBeVisible()
  const requests = await page.evaluate(() => window.qaRequests)
  expect(requests).toHaveLength(1)
  expect(requests[0].prompt).toBe('与按需计费有什么区别？')
  expect(requests[0].context.selection?.text).toBe('竞价计费')
  expect(requests[0]).not.toHaveProperty('selection.range')
})

test('suggestion label is distinct from prompt and single click submits', async ({ page }) => {
  await page.evaluate(() =>
    window.resetQuickAssist({
      suggestions: [{ id: 'explain', label: '解释术语', prompt: '请结合上下文解释计费方式' }],
    }),
  )
  await open(page)
  await page.getByRole('button', { name: '解释术语', exact: true }).click()
  expect(await page.evaluate(() => window.qaRequests[0].prompt)).toBe('请结合上下文解释计费方式')
  await expect(page.locator(popover)).toHaveCount(0)
})

for (const reason of ['escape', 'manual', 'outside'] as const) {
  test(`${reason} dismissal stays closed for the same selection and allows a new selection`, async ({ page }) => {
    await dragSelectText(page, '#term')
    await expect(page.locator(trigger)).toBeVisible()
    if (reason === 'escape') await page.keyboard.press('Escape')
    else if (reason === 'manual') await page.evaluate(() => window.qa.close())
    else {
      // Keep the page selection intact, as a non-selectable host control can.
      await page.locator('#outside-button').evaluate((element) => {
        element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      })
    }
    await page.evaluate(() => {
      document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Control' }))
      document.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'mouse' }))
    })
    await expect(page.locator(trigger)).toHaveCount(0)
    expect(await page.evaluate(() => window.qaEvents.filter((event) => event.type === 'trigger_show').length)).toBe(1)
    await select(page, '#other-term')
    await expect(page.locator(trigger)).toBeVisible()
  })
}

test('default recommendation labels insert dollar sequences literally', async ({ page }) => {
  const text = "a$&b x$$y c$`d e$'f"
  await page.locator('#term').evaluate((element, value) => (element.textContent = value), text)
  await open(page)
  await expect(page.getByRole('button', { name: `解释 ${text}`, exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: `${text}适用场景`, exact: true })).toBeVisible()
})

test('canceled touch allows subsequent mouse and keyboard selection', async ({ page }) => {
  await page.evaluate(() => {
    document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch' }))
    document.dispatchEvent(new PointerEvent('pointercancel', { pointerType: 'touch' }))
  })
  await page.waitForTimeout(350)
  await dragSelectText(page, '#term')
  await expect(page.locator(trigger)).toBeVisible()
  await page.keyboard.press('Escape')
  await page.locator('#other-term').evaluate((element) => {
    const selection = window.getSelection()!
    const range = document.createRange()
    range.selectNodeContents(element)
    selection.removeAllRanges()
    selection.addRange(range)
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift' }))
  })
  await expect(page.locator(trigger)).toBeVisible()
})

test('disable clears an unfinished touch gesture before re-enable', async ({ page }) => {
  await page.evaluate(() => {
    document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch' }))
    window.qa.disable()
    window.qa.enable()
  })
  await select(page)
  await expect(page.locator(trigger)).toBeVisible()
})

test('default validation rejects invalid and excluded selections', async ({ page }) => {
  for (const id of [
    'url',
    'bare-url',
    'digits',
    'uuid',
    'zero-uuid',
    'punctuation',
    'long',
    'outside',
    'contenteditable',
    'monaco',
    'sensitive-cross',
  ]) {
    await select(page, `#${id}`)
    await expect(page.locator(trigger), id).toHaveCount(0)
  }
  await select(page, '#short')
  await expect(page.locator(trigger)).toBeVisible()
})

test('read-only contenteditable permits selection and nearby context while editable ancestors remain excluded', async ({
  page,
}) => {
  await open(page, '#readonly-term')
  await page.locator(`${popover} textarea`).press('Enter')
  const request = await page.evaluate(() => window.qaRequests[0])
  expect(request.context.text).toBe('只读术语')
  expect(request.context.nearbyText).toBe('只读上下文 只读术语')
  await select(page, '#readonly-uppercase')
  await expect(page.locator(trigger)).toBeVisible()
  for (const selector of ['#readonly-in-editor', '#plaintext-editor', '#empty-editor', '#contenteditable']) {
    await select(page, selector)
    await expect(page.locator(trigger), selector).toHaveCount(0)
  }
})

test('extending a valid selection beyond the configured limit removes the trigger', async ({ page }) => {
  await page.evaluate(() => window.resetQuickAssist({ selection: { maxTextLength: 12 } }))
  await page.locator('#long').scrollIntoViewIfNeeded()
  await page.locator('#long').evaluate((element) => {
    const range = document.createRange()
    range.setStart(element.firstChild!, 0)
    range.setEnd(element.firstChild!, 4)
    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)
    document.dispatchEvent(new Event('selectionchange'))
  })
  await expect(page.locator(trigger)).toBeVisible()
  await page.evaluate(() => {
    const selection = window.getSelection()!
    selection.extend(selection.anchorNode!, 24)
    document.dispatchEvent(new Event('selectionchange'))
  })
  const selectedLength = await page.evaluate(() => window.getSelection()?.toString().trim().length ?? 0)
  expect(selectedLength).toBeGreaterThan(12)
  await expect(page.locator(trigger)).toHaveCount(0)
})

test('mouse drag beyond the configured limit leaves no trigger', async ({ page }) => {
  await page.evaluate(() => window.resetQuickAssist({ selection: { maxTextLength: 12 } }))
  await dragSelectText(page, '#selection-limit')
  const selectedLength = await page.evaluate(() => window.getSelection()?.toString().trim().length ?? 0)
  expect(selectedLength).toBeGreaterThan(12)
  await expect(page.locator(trigger)).toHaveCount(0)
})

test('default trigger appears only after mouse selection ends', async ({ page }) => {
  const rect = await page.locator('#term').evaluate((element) => {
    const range = document.createRange()
    range.selectNodeContents(element)
    return range.getBoundingClientRect().toJSON()
  })
  const y = rect.top + rect.height / 2
  await page.mouse.move(rect.left + 1, y)
  await page.mouse.down()
  await page.mouse.move(rect.right - 1, y, { steps: 8 })
  await page.waitForTimeout(100)
  expect(await page.evaluate(() => window.getSelection()?.toString().trim().length ?? 0)).toBeGreaterThan(0)
  await expect(page.locator(trigger)).toHaveCount(0)
  expect(await page.evaluate(() => window.qaEvents.filter((event) => event.type === 'trigger_show').length)).toBe(0)
  await page.mouse.up()
  await expect(page.locator(trigger)).toBeVisible()
  expect(await page.evaluate(() => window.qaEvents.filter((event) => event.type === 'trigger_show').length)).toBe(1)
})

test('showDelay waits after selection settles and emits trigger_show only when visible', async ({ page }) => {
  await pauseClock(page)
  await page.evaluate(() => window.resetQuickAssist({ trigger: { showDelay: 800 } }))
  await select(page, '#term')
  await expect(page.locator(trigger)).toHaveCount(0)
  expect(await page.evaluate(() => window.qaEvents.map((event) => event.type))).toEqual(['selection'])
  await page.clock.runFor(799)
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.clock.runFor(1)
  await expect(page.locator(trigger)).toBeVisible()
  expect(await page.evaluate(() => window.qaEvents.map((event) => event.type))).toEqual(['selection', 'trigger_show'])
})

test('showDelay restarts for a newer selection and cancels an invalid selection', async ({ page }) => {
  await pauseClock(page)
  await page.evaluate(() => window.resetQuickAssist({ trigger: { showDelay: 800 } }))
  await select(page, '#term')
  await page.clock.runFor(400)
  await select(page, '#other-term')
  // Pass the first selection's deadline but stay before the new deadline.
  await page.clock.runFor(500)
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.clock.runFor(300)
  await expect(page.locator(trigger)).toBeVisible()
  expect(await page.evaluate(() => window.qaEvents.filter((event) => event.type === 'trigger_show').length)).toBe(1)
  await select(page, '#term')
  await expect(page.locator(trigger)).toHaveCount(0)
  await select(page, '#long')
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.clock.runFor(900)
  await expect(page.locator(trigger)).toHaveCount(0)
  expect(await page.evaluate(() => window.qaEvents.filter((event) => event.type === 'trigger_show').length)).toBe(1)
})

test('showDelay waits for mouse release and is canceled by disable', async ({ page }) => {
  await pauseClock(page)
  await page.evaluate(() => window.resetQuickAssist({ trigger: { showDelay: 800 } }))
  const rect = await page.locator('#term').evaluate((element) => {
    const range = document.createRange()
    range.selectNodeContents(element)
    return range.getBoundingClientRect().toJSON()
  })
  const y = rect.top + rect.height / 2
  await page.mouse.move(rect.left + 1, y)
  await page.mouse.down()
  await page.mouse.move(rect.right - 1, y, { steps: 8 })
  await page.clock.runFor(900)
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.mouse.up()
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.clock.runFor(800)
  await expect(page.locator(trigger)).toBeVisible()
  await select(page, '#other-term')
  await expect(page.locator(trigger)).toHaveCount(0)
  expect(await page.evaluate(() => window.qaEvents.filter((event) => event.type === 'trigger_show').length)).toBe(1)
  await page.evaluate(() => window.qa.disable())
  await page.clock.runFor(900)
  await expect(page.locator(trigger)).toHaveCount(0)
  expect(await page.evaluate(() => window.qaEvents.filter((event) => event.type === 'trigger_show').length)).toBe(1)
})

test('showDelay validates input and cancels pending work on update or destroy', async ({ page }) => {
  await pauseClock(page)
  await page.evaluate(() => window.resetQuickAssist({ trigger: { showDelay: 800 } }))
  const error = await page.evaluate(() => {
    try {
      window.qa.updateOptions({ trigger: { showDelay: -1 } })
      return ''
    } catch (caught) {
      return (caught as Error).message
    }
  })
  expect(error).toContain('trigger.showDelay')
  await select(page, '#term')
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.evaluate(() => window.qa.updateOptions({ trigger: { showDelay: 0 } }))
  await page.clock.runFor(900)
  await expect(page.locator(trigger)).toHaveCount(0)
  expect(await page.evaluate(() => window.qaEvents.filter((event) => event.type === 'trigger_show').length)).toBe(0)
  await select(page, '#other-term')
  await expect(page.locator(trigger)).toBeVisible()
  await page.evaluate(() => window.qa.updateOptions({ trigger: { showDelay: 800 } }))
  await select(page, '#term')
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.evaluate(() => window.qa.destroy())
  await page.clock.runFor(900)
  await expect(page.locator(trigger)).toHaveCount(0)
  expect(await page.evaluate(() => window.qaEvents.filter((event) => event.type === 'trigger_show').length)).toBe(1)
})

test('nearby context excludes sensitive, hidden and form content', async ({ page }) => {
  await select(page, '#nearby-term')
  await page.locator(trigger).click()
  await page.locator(`${popover} textarea`).press('Enter')
  const context = await page.evaluate(() => window.qaRequests[0].context)
  expect(context.nearbyText).toContain('计费模式')
  expect(JSON.stringify(context)).not.toMatch(/HIDDEN_SECRET|PASSWORD_VALUE|HIDDEN_TEXT/)
})

test('async-only opens immediately and accepts input while suggestions load', async ({ page }) => {
  await page.evaluate(() => window.resetQuickAssist({ getSuggestions: () => new Promise(() => {}) }))
  await open(page)
  const input = page.locator(`${popover} textarea`)
  await input.fill('手动问题')
  await input.press('Enter')
  await expect(page.locator('#chat')).toBeVisible()
})

test('async results append and deduplicate templates', async ({ page }) => {
  await page.evaluate(() =>
    window.resetQuickAssist({
      suggestions: [{ id: 'base', label: '基础任务', prompt: '基础问题' }],
      getSuggestions: async () => [
        { id: 'base', label: '不应替换', prompt: '重复任务' },
        { id: 'extra', label: '补充任务', prompt: '补充问题' },
      ],
    }),
  )
  await open(page)
  await expect(page.getByRole('button', { name: '基础任务', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '补充任务', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '不应替换', exact: true })).toHaveCount(0)
})

test('sanitize completes before provider and removes URL query and hash by default', async ({ page }) => {
  await page.evaluate(() => {
    history.replaceState({}, '', '?token=URL_SECRET#secret')
    window.resetQuickAssist({
      getContext: () => ({ token: 'SECRET' }),
      sanitizeContext: async (context) => ({ ...context, businessContext: { safe: true } }),
      getSuggestions: (context) => {
        if (JSON.stringify(context).includes('SECRET')) throw new Error('context leaked')
        return [{ id: 'safe', label: '安全任务', prompt: '安全问题' }]
      },
    })
  })
  await open(page)
  await page.getByRole('button', { name: '安全任务', exact: true }).click()
  const request = await page.evaluate(() => window.qaRequests[0])
  expect(request.context.businessContext).toEqual({ safe: true })
  expect(request.context.page?.url).not.toContain('token')
})

test('sanitized context is isolated from factories, providers, merge and prompt hooks', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.evaluate(() => {
    let sanitized: QuickAssistContext
    const assertSafe = (context: QuickAssistContext) => {
      if (
        context.text !== '竞价计费' ||
        context.selection?.text !== '竞价计费' ||
        (context.businessContext?.nested as { safe: boolean }).safe !== true ||
        (context.meta?.values as string[])[0] !== 'safe'
      ) {
        throw new Error('A previous hook mutated this context')
      }
    }
    const mutate = (context: QuickAssistContext) => {
      context.text = 'MUTATED'
      context.selection!.text = 'MUTATED'
      ;(context.businessContext!.nested as { safe: boolean }).safe = false
      ;(context.meta!.values as string[])[0] = 'MUTATED'
    }
    window.resetQuickAssist({
      sanitizeContext: (context) => {
        sanitized = { ...context, businessContext: { nested: { safe: true } }, meta: { values: ['safe'] } }
        return sanitized
      },
      suggestions: [
        {
          id: 'factory',
          getLabel: (context) => {
            assertSafe(context)
            mutate(context)
            return '隔离任务'
          },
          getPrompt: (context) => {
            assertSafe(context)
            mutate(context)
            return '隔离问题'
          },
        },
      ],
      getSuggestions: async (context) => {
        assertSafe(context)
        mutate(sanitized)
        // Keep a reference after the async provider finishes, too.
        window.resolveSuggestion = () => mutate(context)
        await Promise.resolve()
        return []
      },
      mergeSuggestions: (base, _incoming, context) => {
        assertSafe(context)
        mutate(context)
        return base
      },
      buildPrompt: ({ context }) => {
        assertSafe(context)
        mutate(context)
        return '独立 prompt'
      },
    })
  })
  await open(page)
  await expect(page.locator(`${popover} [data-state="loading"]`)).toHaveCount(0)
  await page.evaluate(() => window.resolveSuggestion())
  await page.locator(`${popover} textarea`).press('Enter')
  await expect(page.locator('#chat')).toBeVisible()
  const request = await page.evaluate(() => window.qaRequests[0])
  expect(request.context.text).toBe('竞价计费')
  expect(request.context.selection?.text).toBe('竞价计费')
  expect(request.context.businessContext).toEqual({ nested: { safe: true } })
  expect(request.context.meta).toEqual({ values: ['safe'] })
  expect(request.prompt).toBe('独立 prompt')
  expect(await page.evaluate(() => window.qaEvents.filter((event) => event.type === 'error'))).toEqual([])
  expect(errors).toEqual([])
})

for (const invalid of [
  'array',
  'empty',
  'null',
  'date',
  'source',
  'text',
  'selection',
  'page',
  'nearbyText',
  'businessContext',
  'meta',
  'uncloneable',
]) {
  test(`invalid sanitizer result (${invalid}) blocks providers and submission`, async ({ page }) => {
    await page.evaluate((invalid) => {
      window.resetQuickAssist({
        sanitizeContext: (context) => {
          const values: Record<string, unknown> = {
            array: [],
            empty: {},
            null: null,
            date: new Date(),
            source: { ...context, source: 1 },
            text: { ...context, text: null },
            selection: { ...context, selection: {} },
            page: { ...context, page: { url: 1 } },
            nearbyText: { ...context, nearbyText: [] },
            businessContext: { ...context, businessContext: [] },
            meta: { ...context, meta: new Date() },
            uncloneable: { ...context, meta: { fn() {} } },
          }
          return values[invalid] as QuickAssistContext
        },
        getSuggestions: () => {
          throw new Error('SHOULD_NOT_RUN')
        },
      })
    }, invalid)
    await open(page)
    await expect
      .poll(() =>
        page.evaluate(() => window.qaEvents.filter((event) => event.type === 'error').map((event) => event.stage)),
      )
      .toEqual(['sanitize'])
    await expect(page.locator(`${popover} .tr-quick-assist__submit`)).toBeDisabled()
    await page.locator(`${popover} textarea`).press('Enter')
    expect(await page.evaluate(() => window.qaRequests)).toEqual([])
  })
}

for (const stage of ['context', 'sanitize'] as const) {
  for (const kind of ['function', 'dom', 'proxy']) {
    test(`non-cloneable ${kind} reports actionable ${stage} error and blocks submission`, async ({ page }) => {
      await page.evaluate(
        ({ stage, kind }) => {
          const value =
            kind === 'function' ? () => undefined : kind === 'dom' ? document.createElement('div') : new Proxy({}, {})
          window.resetQuickAssist({
            getContext: () => ({ nested: { value } }),
            sanitizeContext: stage === 'sanitize' ? (context) => context : undefined,
            getSuggestions: () => {
              throw new Error('SHOULD_NOT_RUN')
            },
          })
        },
        { stage, kind },
      )
      await open(page)
      await expect
        .poll(() =>
          page.evaluate(() => window.qaEvents.filter((event) => event.type === 'error').map((event) => event.stage)),
        )
        .toEqual([stage])
      const messages = await page.evaluate(() =>
        window.qaEvents.filter((event) => event.type === 'error').map((event) => event.error.message),
      )
      expect(messages).toHaveLength(1)
      expect(messages[0]).toContain('QuickAssistContext must contain only structured-cloneable data')
      expect(messages[0]).toContain('no functions, DOM nodes or reactive proxies')
      expect(messages[0]).toContain('DataCloneError')
      await expect(page.locator(`${popover} .tr-quick-assist__submit`)).toBeDisabled()
      await page.locator(`${popover} textarea`).press('Enter')
      expect(await page.evaluate(() => window.qaRequests.length)).toBe(0)
    })
  }
}

test('shared-memory context is rejected across views, collections, cycles and realms', async ({ page }) => {
  await page.route('**/quick-assist/index.html', async (route) => {
    const response = await route.fetch()
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        'cross-origin-opener-policy': 'same-origin',
        'cross-origin-embedder-policy': 'require-corp',
      },
    })
  })
  await page.goto('/quick-assist/index.html')
  await page.waitForFunction(() => typeof window.resetQuickAssist === 'function')
  expect(await page.evaluate(() => crossOriginIsolated)).toBe(true)
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  for (const kind of [
    'buffer',
    'typed-array',
    'data-view',
    'map-key',
    'map-value',
    'set',
    'array',
    'cycle',
    'error-cause',
    'iframe',
    'wasm-memory',
  ]) {
    await page.evaluate((kind) => {
      const buffer = new SharedArrayBuffer(1)
      const bytes = new Uint8Array(buffer)
      let data: unknown = buffer
      if (kind === 'typed-array') data = bytes
      if (kind === 'data-view') data = new DataView(buffer)
      if (kind === 'map-key') data = new Map([[buffer, 'value']])
      if (kind === 'map-value') data = new Map([['key', bytes]])
      if (kind === 'set') data = new Set([bytes])
      if (kind === 'array') data = [{ nested: bytes }]
      if (kind === 'cycle') {
        const cycle = new Map<unknown, unknown>()
        cycle.set('self', cycle)
        cycle.set('nested', new Set([bytes]))
        data = cycle
      }
      if (kind === 'error-cause') data = new Error('nested buffer', { cause: bytes })
      if (kind === 'wasm-memory') data = new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true })
      if (kind === 'iframe') {
        const iframe = document.createElement('iframe')
        document.body.append(iframe)
        const view = iframe.contentWindow as Window & typeof globalThis
        data = new view.Map([['nested', new view.Uint8Array(new view.SharedArrayBuffer(1))]])
        iframe.remove()
      }
      window.resetQuickAssist({
        sanitizeContext: (context) => ({ ...context, businessContext: { data } }),
        getSuggestions: () => {
          throw new Error('SHOULD_NOT_RUN')
        },
      })
    }, kind)
    await open(page)
    await expect
      .poll(() =>
        page.evaluate(() => window.qaEvents.filter((event) => event.type === 'error').map((event) => event.stage)),
      )
      .toEqual(['sanitize'])
    expect(
      await page.evaluate(() =>
        window.qaEvents.filter((event) => event.type === 'error').map((event) => event.error.message),
      ),
    ).toEqual(['QuickAssistContext must not contain SharedArrayBuffer or views of shared memory'])
    await expect(page.locator(`${popover} .tr-quick-assist__submit`)).toBeDisabled()
    await page.locator(`${popover} textarea`).press('Enter')
    expect(await page.evaluate(() => window.qaRequests.length)).toBe(0)
  }
  expect(pageErrors).toEqual([])
})

test('ordinary buffers and circular collections remain isolated and submit successfully', async ({ page }) => {
  await page.evaluate(() => {
    const cycle = new Map<string, unknown>()
    cycle.set('self', cycle)
    cycle.set('values', new Set(['safe']))
    window.resetQuickAssist({
      adapter: {
        submit: (request) => {
          window.qaRequests.push(request)
        },
      },
      sanitizeContext: (context) => ({
        ...context,
        businessContext: { bytes: new Uint8Array(new ArrayBuffer(1)), cycle },
      }),
      getSuggestions: (context) => {
        const business = context.businessContext!
        ;(business.bytes as Uint8Array)[0] = 42
        const values = (business.cycle as Map<string, unknown>).get('values') as Set<string>
        values.add('changed')
        return []
      },
    })
  })
  await open(page)
  await expect(page.locator(`${popover} [data-state="loading"]`)).toHaveCount(0)
  await page.locator(`${popover} textarea`).press('Enter')
  await expect.poll(() => page.evaluate(() => window.qaRequests.length)).toBe(1)
  expect(
    await page.evaluate(() => {
      const business = window.qaRequests[0].context.businessContext!
      const cycle = business.cycle as Map<string, unknown>
      return {
        byte: (business.bytes as Uint8Array)[0],
        circular: cycle.get('self') === cycle,
        values: [...(cycle.get('values') as Set<string>)],
      }
    }),
  ).toEqual({ byte: 0, circular: true, values: ['safe'] })
  expect(await page.evaluate(() => window.qaEvents.filter((event) => event.type === 'error'))).toEqual([])
})

test('sanitizer may remove every optional context field', async ({ page }) => {
  await page.evaluate(() => window.resetQuickAssist({ sanitizeContext: () => ({ source: 'safe', text: 'safe' }) }))
  await open(page)
  await page.locator(`${popover} textarea`).press('Enter')
  await expect(page.locator('#chat')).toBeVisible()
  expect(await page.evaluate(() => window.qaRequests[0].context)).toEqual({ source: 'safe', text: 'safe' })
})

test('throwing suggestion attributes report callback errors and preserve manual submission', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.evaluate(() =>
    window.resetQuickAssist({
      attrs: {
        suggestion: () => {
          throw new Error('attrs boom')
        },
      },
    }),
  )
  await open(page)
  await expect(page.locator(`${popover} .tr-quick-assist__suggestion`)).toHaveCount(2)
  await expect(page.locator(`${popover} .tr-quick-assist__submit`)).toBeEnabled()
  const events = await page.evaluate(() =>
    window.qaEvents
      .filter((event) => event.type === 'error')
      .map((event) => ({ stage: event.stage, sessionId: event.sessionId, message: event.error.message })),
  )
  expect(events).toHaveLength(2)
  for (const event of events) expect(event).toEqual({ stage: 'callback', sessionId: 1, message: 'attrs boom' })
  await page.locator(`${popover} textarea`).fill('继续手动提问')
  await page.locator(`${popover} .tr-quick-assist__submit`).click()
  await expect(page.locator('#chat')).toBeVisible()
  expect(await page.evaluate(() => window.qaRequests[0].prompt)).toBe('继续手动提问')
  expect(errors).toEqual([])
})

