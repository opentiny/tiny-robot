import { expect, test, type Page } from '@playwright/test'
import type { QuickAssistInstance, QuickAssistOptions, Suggestion } from '../../components/src/vanilla'

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
  await page.evaluate(() => window.resetQuickAssist({ trigger: { showDelay: 180 } }))
  await select(page, '#term')
  await expect(page.locator(trigger)).toHaveCount(0)
  expect(await page.evaluate(() => window.qaEvents.map((event) => event.type))).toEqual(['selection'])
  await page.waitForTimeout(80)
  await expect(page.locator(trigger)).toHaveCount(0)
  await expect(page.locator(trigger)).toBeVisible()
  expect(await page.evaluate(() => window.qaEvents.map((event) => event.type))).toEqual(['selection', 'trigger_show'])
})

test('showDelay restarts for a newer selection and cancels an invalid selection', async ({ page }) => {
  await page.evaluate(() => window.resetQuickAssist({ trigger: { showDelay: 200 } }))
  await select(page, '#term')
  await page.waitForTimeout(100)
  await select(page, '#other-term')
  await page.waitForTimeout(120)
  await expect(page.locator(trigger)).toHaveCount(0)
  await expect(page.locator(trigger)).toBeVisible()
  expect(await page.evaluate(() => window.qaEvents.filter((event) => event.type === 'trigger_show').length)).toBe(1)
  await select(page, '#long')
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.waitForTimeout(220)
  await expect(page.locator(trigger)).toHaveCount(0)
})

test('showDelay waits for mouse release and is canceled by disable', async ({ page }) => {
  await page.evaluate(() => window.resetQuickAssist({ trigger: { showDelay: 150 } }))
  const rect = await page.locator('#term').evaluate((element) => {
    const range = document.createRange()
    range.selectNodeContents(element)
    return range.getBoundingClientRect().toJSON()
  })
  const y = rect.top + rect.height / 2
  await page.mouse.move(rect.left + 1, y)
  await page.mouse.down()
  await page.mouse.move(rect.right - 1, y, { steps: 8 })
  await page.waitForTimeout(180)
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.mouse.up()
  await expect(page.locator(trigger)).toBeVisible()
  await select(page, '#other-term')
  await page.evaluate(() => window.qa.disable())
  await page.waitForTimeout(180)
  await expect(page.locator(trigger)).toHaveCount(0)
})

test('showDelay validates input and cancels pending work on update or destroy', async ({ page }) => {
  await page.evaluate(() => window.resetQuickAssist({ trigger: { showDelay: 160 } }))
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
  await page.evaluate(() => window.qa.updateOptions({ trigger: { showDelay: 0 } }))
  await page.waitForTimeout(180)
  await expect(page.locator(trigger)).toHaveCount(0)
  await select(page, '#other-term')
  await expect(page.locator(trigger)).toBeVisible()
  await page.evaluate(() => window.qa.updateOptions({ trigger: { showDelay: 160 } }))
  await select(page, '#term')
  await page.evaluate(() => window.qa.destroy())
  await page.waitForTimeout(180)
  await expect(page.locator(trigger)).toHaveCount(0)
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

test('Escape, outside, route and lifecycle close reliably', async ({ page }) => {
  await open(page)
  await page.keyboard.press('Escape')
  await expect(page.locator(popover)).toHaveCount(0)
  await open(page)
  await page.locator('#outside-button').click()
  await expect(page.locator(popover)).toHaveCount(0)
  await open(page)
  await page.evaluate(() => window.dispatchEvent(new PopStateEvent('popstate')))
  await expect(page.locator(popover)).toHaveCount(0)
  await page.evaluate(() => window.qa.disable())
  await select(page)
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.evaluate(() => window.qa.enable())
  await select(page)
  await expect(page.locator(trigger)).toBeVisible()
  await page.evaluate(() => {
    window.qa.destroy()
    window.qa.destroy()
    window.qa.enable()
  })
  await select(page)
  await expect(page.locator('.tr-quick-assist')).toHaveCount(0)
})

test('native mouse selection and copy preserve host behavior', async ({ page }) => {
  await dragSelectText(page, '#short')
  await expect(page.locator(trigger)).toBeVisible()
  expect(await page.evaluate(() => window.getSelection()?.toString())).toContain('ECS')
  await page.locator('#outside-button').click()
  await page.locator('#link').click()
  await expect(page).toHaveURL(/#link-target$/)
})

test('a keyboard completion keyup inspects the active text selection', async ({ page }) => {
  await page.locator('#keyboard-term').evaluate((element) => {
    document.addEventListener('selectionchange', (event) => event.stopImmediatePropagation(), {
      capture: true,
      once: true,
    })
    const range = document.createRange()
    range.selectNodeContents(element)
    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)
  })
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString())).toBe('键盘选择测试')
  await page.keyboard.press('Shift')
  await expect(page.locator(trigger)).toBeVisible()
})

test('telemetry never includes raw requests or context', async ({ page }) => {
  await open(page)
  await page.locator(`${popover} textarea`).press('Enter')
  const events = await page.evaluate(() => window.qaEvents)
  expect(events.map((event) => event.type)).toContain('submit')
  expect(JSON.stringify(events)).not.toContain('竞价计费')
  expect(events.find((event) => event.type === 'submit')).not.toHaveProperty('request')
})

test('late recommendation after close cannot reopen the UI', async ({ page }) => {
  await page.evaluate(() => {
    let resolve!: (items: { id: string; label: string; prompt: string }[]) => void
    const pending = new Promise<{ id: string; label: string; prompt: string }[]>((done) => {
      resolve = done
    })
    Object.assign(window, { resolveSuggestion: () => resolve([{ id: 'late', label: '迟到任务', prompt: '迟到问题' }]) })
    window.resetQuickAssist({ getSuggestions: () => pending })
  })
  await open(page)
  await page.keyboard.press('Escape')
  await page.evaluate(() => window.resolveSuggestion())
  await expect(page.locator(popover)).toHaveCount(0)
  await select(page, '#cell')
  await page.locator(trigger).click()
  await expect(page.locator(`${popover} textarea`)).toHaveValue('实例规格')
})

test('failed provider preserves manual submission and reports error', async ({ page }) => {
  await page.evaluate(() =>
    window.resetQuickAssist({
      getSuggestions: async () => {
        throw new Error('provider failure')
      },
    }),
  )
  await open(page)
  await expect
    .poll(() =>
      page.evaluate(() => window.qaEvents.some((event) => event.type === 'error' && event.stage === 'suggestions')),
    )
    .toBe(true)
  await page.locator(`${popover} textarea`).press('Enter')
  await expect(page.locator('#chat')).toBeVisible()
})

test('sanitizer failure never invokes provider or adapter', async ({ page }) => {
  await page.evaluate(() =>
    window.resetQuickAssist({
      sanitizeContext: () => {
        throw new Error('sanitize failed')
      },
      getSuggestions: () => {
        throw new Error('SHOULD_NOT_RUN')
      },
    }),
  )
  await open(page)
  await page.locator(`${popover} textarea`).press('Enter')
  expect(await page.evaluate(() => window.qaRequests.length)).toBe(0)
  await expect.poll(() => page.evaluate(() => window.qaEvents.some((event) => event.type === 'error'))).toBe(true)
  expect(
    await page.evaluate(() =>
      window.qaEvents.filter((event) => event.type === 'error').map((event) => event.error.message),
    ),
  ).not.toContain('SHOULD_NOT_RUN')
})

test('Enter during IME composition does not submit', async ({ page }) => {
  await open(page)
  const input = page.locator(`${popover} textarea`)
  await input.dispatchEvent('compositionstart')
  await input.press('Enter')
  expect(await page.evaluate(() => window.qaRequests.length)).toBe(0)
  await input.dispatchEvent('compositionend')
  await input.press('Enter')
  await expect(page.locator('#chat')).toBeVisible()
})

test('unsafe attributes and suggestion HTML are inert', async ({ page }) => {
  await page.evaluate(() =>
    window.resetQuickAssist({
      attrs: { trigger: { 'data-testid': 'safe-trigger', onclick: 'window.BAD=true', style: 'display:none' } },
      suggestions: [{ id: 'html', label: '<img src=x onerror="window.BAD=true">', prompt: 'safe' }],
    }),
  )
  await select(page)
  await expect(page.getByTestId('safe-trigger')).toBeVisible()
  expect(await page.locator(trigger).getAttribute('onclick')).toBeNull()
  await page.locator(trigger).click()
  await expect(page.locator(`${popover} img`)).toHaveCount(0)
  expect(await page.evaluate(() => 'BAD' in window)).toBe(false)
})

test('popover remains in viewport at right bottom edge', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 400 })
  await page.locator('#term').evaluate((element) => {
    Object.assign((element as HTMLElement).style, { position: 'fixed', right: '0', bottom: '0', margin: '0' })
  })
  await open(page)
  const box = await page.locator(popover).boundingBox()
  expect(box).not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.y).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(480)
  expect(box!.y + box!.height).toBeLessThanOrEqual(400)
})

test('scroll closes trigger and detached anchor closes popover', async ({ page }) => {
  await select(page)
  await expect(page.locator(trigger)).toBeVisible()
  await page.evaluate(() => window.scrollBy(0, 30))
  await expect(page.locator(trigger)).toHaveCount(0)
  await open(page, '#cell')
  await page.locator('#cell').evaluate((element) => element.remove())
  await expect(page.locator(popover)).toHaveCount(0)
})

test('reselecting the same range after scroll reopens the trigger', async ({ page }) => {
  await page.locator('#term').evaluate((element) => {
    const target = element as HTMLElement
    target.style.marginTop = '250px'
  })
  await select(page, '#term')
  await expect(page.locator(trigger)).toBeVisible()
  await page.evaluate(() => window.scrollBy(0, 30))
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.locator('#term').evaluate((element) => {
    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.collapse(element.firstChild!, 0)
  })
  await dragSelectText(page, '#term')
  await expect(page.locator(trigger)).toBeVisible()
  const state = await page.evaluate(() => {
    const selection = window.getSelection()
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null
    return {
      text: selection?.toString(),
      startOffset: range?.startOffset,
      endOffset: range?.endOffset,
      events: window.qaEvents.map((event) => ({
        type: event.type,
        sessionId: event.sessionId,
        ...(event.type === 'close' ? { reason: event.reason } : {}),
      })),
      triggerCount: document.querySelectorAll('.tr-quick-assist__trigger').length,
    }
  })
  expect(state, JSON.stringify(state)).toMatchObject({ text: '竞价计费', triggerCount: 1 })
})

test('a real mouse drag across DOM text nodes captures the complete selection', async ({ page }) => {
  await dragSelectText(page, '#mixed')
  await expect(page.locator(trigger)).toBeVisible()
  const selected = await page.evaluate(() => window.getSelection()?.toString().replace(/\s+/gu, ''))
  expect(selected).toBe('包年包月按需计费竞价计费')
  await page.locator(trigger).click()
  await page.locator(`${popover} textarea`).press('Enter')
  const request = await page.evaluate(() => window.qaRequests[0])
  expect(request.context.selection?.text.replace(/\s+/gu, '')).toBe('包年包月按需计费竞价计费')
})

test('the same text in a different DOM range starts a fresh session', async ({ page }) => {
  await page.evaluate(() =>
    window.resetQuickAssist({
      getNearbyContext: (snapshot) => snapshot.anchorElement?.id,
    }),
  )
  await select(page, '#term')
  await expect(page.locator(trigger)).toBeVisible()
  const firstSessionId = await page.evaluate(
    () => window.qaEvents.find((event) => event.type === 'selection')?.sessionId,
  )
  await select(page, '#term-copy')
  await expect(page.locator(trigger)).toBeVisible()
  const sessionIds = await page.evaluate(() =>
    window.qaEvents.filter((event) => event.type === 'selection').map((event) => event.sessionId),
  )
  expect(sessionIds).toHaveLength(2)
  expect(sessionIds[1]).not.toBe(firstSessionId)
  await page.locator(trigger).click()
  await page.locator(`${popover} textarea`).press('Enter')
  const request = await page.evaluate(() => window.qaRequests[0])
  expect(request.context.text).toBe('竞价计费')
  expect(request.context.nearbyText).toBe('term-copy')
})

test('an invalid selection clears a previously valid trigger', async ({ page }) => {
  await select(page, '#term')
  await expect(page.locator(trigger)).toBeVisible()
  await select(page, '#bare-url')
  await expect(page.locator(trigger)).toHaveCount(0)
  await select(page, '#short')
  await expect(page.locator(trigger)).toBeVisible()
  await select(page, '#zero-uuid')
  await expect(page.locator(trigger)).toHaveCount(0)
})

test('late A recommendations cannot replace a newer B session', async ({ page }) => {
  await page.evaluate(() => {
    window.pendingSuggestions = new Map()
    window.resetQuickAssist({
      getSuggestions: (context) => new Promise((resolve) => window.pendingSuggestions.set(context.text, resolve)),
    })
  })
  await select(page, '#term')
  await page.locator(trigger).click()
  await expect.poll(() => page.evaluate(() => window.pendingSuggestions.has('竞价计费'))).toBe(true)
  await select(page, '#other-term')
  await expect(page.locator(trigger)).toBeVisible()
  await page.locator(trigger).click()
  await expect.poll(() => page.evaluate(() => window.pendingSuggestions.has('网络安全组'))).toBe(true)
  await page.evaluate(() => {
    window.pendingSuggestions.get('网络安全组')!([{ id: 'b', label: 'B 最新结果', prompt: 'B' }])
  })
  await expect(page.getByRole('button', { name: 'B 最新结果', exact: true })).toBeVisible()
  await page.evaluate(() => {
    window.pendingSuggestions.get('竞价计费')!([{ id: 'a', label: 'A 迟到结果', prompt: 'A' }])
  })
  await expect(page.getByRole('button', { name: 'B 最新结果', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'A 迟到结果', exact: true })).toHaveCount(0)
})

test('late adapter completion leaves a newer composer untouched', async ({ page }) => {
  await page.evaluate(() => {
    window.pendingAdapter = []
    window.resetQuickAssist({
      adapter: {
        submit(request) {
          window.qaRequests.push(request)
          return new Promise<void>((resolve) => window.pendingAdapter.push(resolve))
        },
      },
    })
  })
  await open(page)
  await page.locator(`${popover} textarea`).fill('A 请求')
  await page.locator(`${popover} textarea`).press('Enter')
  await expect(page.locator(popover)).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => window.pendingAdapter.length)).toBe(1)
  await select(page, '#other-term')
  await page.locator(trigger).click()
  await expect(page.locator(`${popover} textarea`)).toHaveValue('网络安全组')
  await page.evaluate(() => window.pendingAdapter[0]())
  await expect(page.locator(`${popover} textarea`)).toHaveValue('网络安全组')
  await expect(page.locator(popover)).toBeVisible()
})

test('updateOptions closes stale UI and applies the new nested options', async ({ page }) => {
  await page.evaluate(() =>
    window.resetQuickAssist({
      trigger: { label: '旧入口' },
      selection: { maxTextLength: 300 },
      suggestions: [{ id: 'old', label: '旧任务', prompt: '旧问题' }],
    }),
  )
  await select(page, '#term')
  await expect(page.getByRole('button', { name: '旧入口', exact: true })).toBeVisible()
  await page.evaluate(() =>
    window.qa.updateOptions({
      trigger: { label: '新入口' },
      selection: { maxTextLength: 12 },
      suggestions: [{ id: 'new', label: '新任务', prompt: '新问题' }],
    }),
  )
  await expect(page.locator(trigger)).toHaveCount(0)
  await select(page, '#term')
  await expect(page.getByRole('button', { name: '新入口', exact: true })).toBeVisible()
  await page.locator(trigger).click()
  await expect(page.getByRole('button', { name: '新任务', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '旧任务', exact: true })).toHaveCount(0)
  await page.keyboard.press('Escape')
  await select(page, '#long')
  await expect(page.locator(trigger)).toHaveCount(0)
})

test('updateOptions rejects a different root document without disabling the instance', async ({ page }) => {
  const error = await page.evaluate(() => {
    try {
      window.qa.updateOptions({ root: document.implementation.createHTMLDocument('other root') })
      return ''
    } catch (caught) {
      return (caught as Error).message
    }
  })
  expect(error).toContain('root cannot change')
  await select(page)
  await expect(page.locator(trigger)).toBeVisible()
})

test('UMD script injects shared CSS and completes an interaction', async ({ page }) => {
  await page.goto('/quick-assist/umd.html')
  await page.waitForFunction(() => typeof window.TinyRobotVanilla?.createQuickAssist === 'function')
  await expect(page.locator('[data-tr-quick-assist-style]')).toHaveCount(1)
  await select(page)
  await page.locator(trigger).click()
  await expect(page.locator(`${popover} textarea`)).toHaveValue('UMD 智能帮助')
  await page.locator(`${popover} textarea`).fill('从 UMD 发送的问题')
  await page.locator(`${popover} textarea`).press('Enter')
  await expect(page.locator(popover)).toHaveCount(0)
  await expect(page.locator('#host-chat')).toBeVisible()
  const request = await page.evaluate(() => window.qaRequests[0])
  expect(request.prompt).toBe('从 UMD 发送的问题')
  expect(request.context.selection?.text).toBe('UMD 智能帮助')

  await page.evaluate(() => {
    window.qa2 = window.TinyRobotVanilla.createQuickAssist({
      include: ['#scope'],
      adapter: { submit() {} },
    })
  })
  await expect(page.locator('[data-tr-quick-assist-style]')).toHaveCount(1)
  await page.evaluate(() => window.qa.destroy())
  await expect(page.locator('[data-tr-quick-assist-style]')).toHaveCount(1)
  await page.evaluate(() => window.qa2.destroy())
  await expect(page.locator('[data-tr-quick-assist-style]')).toHaveCount(0)
})

test('capture a real browser screenshot of the QuickAssist popover', async ({ page }) => {
  const screenshotPath = process.env.QUICK_ASSIST_SCREENSHOT_PATH
  test.skip(!screenshotPath, 'Set QUICK_ASSIST_SCREENSHOT_PATH to save visual evidence')
  await open(page)
  await page.screenshot({ path: screenshotPath!, animations: 'disabled' })
})
