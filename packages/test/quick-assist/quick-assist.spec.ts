import { expect, test, type Page } from '@playwright/test'
import type {
  QuickAssistContext,
  QuickAssistInstance,
  QuickAssistOptions,
  QuickAssistPlacement,
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

async function dragSelectText(page: Page, selector: string, backward = false) {
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
  if (backward) [points.start, points.end] = [points.end, points.start]
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

test('button borders survive the component library global reset', async ({ page }) => {
  await select(page)
  await expect(page.locator(trigger)).toHaveCSS('border', '1px solid rgb(230, 230, 230)')
  await page.locator(trigger).click()
  const suggestion = page.locator('.tr-quick-assist__suggestion').first()
  await expect(suggestion).toHaveCSS('border', '1px solid rgb(230, 230, 230)')
  await suggestion.hover()
  await expect(suggestion).toHaveCSS('border-color', 'color(srgb 0.772157 0.772157 0.772157)')
})

async function selectDirection(page: Page, selector: string, backward: boolean) {
  await page.locator(selector).evaluate((element, reverse) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
    const nodes: Node[] = []
    for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node)
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    window
      .getSelection()!
      .setBaseAndExtent(
        reverse ? last : first,
        reverse ? last.textContent!.length : 0,
        reverse ? first : last,
        reverse ? 0 : last.textContent!.length,
      )
    document.dispatchEvent(new Event('selectionchange'))
  }, backward)
}

async function prepareLines(page: Page, placement?: QuickAssistPlacement, bottom = false, left = 240) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(
    ({ placement, bottom, left }) => {
      window.resetQuickAssist({ trigger: placement ? { placement } : {} })
      const element = document.querySelector<HTMLElement>('#mixed')!
      Object.assign(element.style, {
        position: 'fixed',
        left: `${left}px`,
        top: bottom ? 'auto' : '180px',
        bottom: bottom ? '10px' : 'auto',
        width: '500px',
        margin: '0',
        lineHeight: '36px',
      })
      element.innerHTML =
        '<span id="first-line">第一行的文字比较长，<b>包含多个片段</b></span><br>' +
        '<span id="last-line" style="margin-left:60px">末行<b>短文本</b></span>'
    },
    { placement, bottom, left },
  )
  await select(page, '#mixed')
  await expect(page.locator(trigger)).toBeVisible()
}

async function lineGeometry(page: Page, side: 'top' | 'bottom') {
  return page.locator(trigger).evaluate((button, side) => {
    const line = document.querySelector(side === 'top' ? '#first-line' : '#last-line')!
    const range = document.createRange()
    range.selectNodeContents(line.firstChild!)
    const first = range.getBoundingClientRect()
    range.selectNodeContents(line.querySelector('b')!.firstChild!)
    const last = range.getBoundingClientRect()
    return {
      button: button.getBoundingClientRect().toJSON(),
      line: {
        left: first.left,
        right: last.right,
        top: Math.min(first.top, last.top),
        bottom: Math.max(first.bottom, last.bottom),
      },
    }
  }, side)
}

for (const selector of ['#term', '#mixed']) {
  test(`direction filtering precedes deduplication for ${selector}`, async ({ page }) => {
    await selectDirection(page, selector, true)
    await expect(page.locator(trigger)).toHaveCount(0)
    await selectDirection(page, selector, false)
    await expect(page.locator(trigger)).toBeVisible()
    await selectDirection(page, selector, true)
    await expect(page.locator(trigger)).toHaveCount(0)
    await selectDirection(page, selector, false)
    await expect(page.locator(trigger)).toBeVisible()
    await page.evaluate(() => window.qa.updateOptions({ selection: { forwardOnly: false } }))
    await selectDirection(page, selector, true)
    await expect(page.locator(trigger)).toBeVisible()
    await page.evaluate(() => window.qa.updateOptions({ selection: { forwardOnly: true } }))
    await selectDirection(page, selector, true)
    await expect(page.locator(trigger)).toHaveCount(0)
  })
}

test('native backward mouse selection only triggers with forwardOnly disabled', async ({ page }) => {
  await dragSelectText(page, '#short', true)
  expect(await page.evaluate(() => window.getSelection()!.toString().length)).toBeGreaterThan(0)
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.evaluate(() => {
    window.qa.updateOptions({ selection: { forwardOnly: false } })
    window.getSelection()!.removeAllRanges()
  })
  await dragSelectText(page, '#short', true)
  await expect(page.locator(trigger)).toBeVisible()
})

test('keyboard completion inspects backward selections and respects direction filtering', async ({ page }) => {
  await page.locator('#keyboard-term').evaluate((element) => {
    document.addEventListener('selectionchange', (event) => event.stopImmediatePropagation(), { capture: true })
    window.getSelection()!.setBaseAndExtent(element.firstChild!, element.textContent!.length, element.firstChild!, 0)
  })
  await page.keyboard.press('Shift')
  expect(await page.evaluate(() => window.getSelection()!.toString())).not.toBe('')
  await expect(page.locator(trigger)).toHaveCount(0)
  await page.evaluate(() => window.qa.updateOptions({ selection: { forwardOnly: false } }))
  await page.keyboard.press('Shift')
  await expect(page.locator(trigger)).toBeVisible()
})

test('reversing the same pending selection cancels delayed display despite custom validation', async ({ page }) => {
  await page.evaluate(() =>
    window.resetQuickAssist({ trigger: { showDelay: 300 }, selection: { validate: () => true } }),
  )
  await pauseClock(page)
  await selectDirection(page, '#mixed', false)
  await selectDirection(page, '#mixed', true)
  await page.clock.runFor(500)
  await expect(page.locator(trigger)).toHaveCount(0)
  expect(await page.evaluate(() => window.qaEvents.some((event) => event.type === 'trigger_show'))).toBe(false)
})

test('delayed display rechecks direction even without selectionchange delivery', async ({ page }) => {
  await page.evaluate(() => window.resetQuickAssist({ trigger: { showDelay: 300 } }))
  await pauseClock(page)
  await selectDirection(page, '#term', false)
  await page.locator('#term').evaluate((element) => {
    document.addEventListener('selectionchange', (event) => event.stopImmediatePropagation(), { capture: true })
    window.getSelection()!.setBaseAndExtent(element.firstChild!, element.textContent!.length, element.firstChild!, 0)
  })
  await page.clock.runFor(500)
  await expect(page.locator(trigger)).toHaveCount(0)
})

for (const placement of [
  undefined,
  'auto',
  'bottom',
  'bottom-start',
  'bottom-end',
  'top',
  'top-start',
  'top-end',
] as const) {
  test(`placement ${placement ?? 'default'} aligns with first/last visual line`, async ({ page }) => {
    await prepareLines(page, placement)
    const side = placement?.startsWith('top') ? 'top' : 'bottom'
    const geometry = await lineGeometry(page, side)
    const { button, line } = geometry
    if (placement?.endsWith('-start')) expect(button.right).toBeCloseTo(line.left, 0)
    else if (!placement || placement.endsWith('-end')) expect(button.left).toBeCloseTo(line.right, 0)
    else expect(Math.abs((button.left + button.right) / 2 - (line.left + line.right) / 2)).toBeLessThanOrEqual(0.5)
    expect(side === 'top' ? line.top - button.bottom : button.top - line.bottom).toBeCloseTo(8, 0)
  })
}

test('flipping bottom-end uses the first line right edge', async ({ page }) => {
  await prepareLines(page, 'bottom-end', true)
  await expect(page.locator(trigger)).toHaveAttribute('data-placement', 'top-end')
  const geometry = await lineGeometry(page, 'top')
  expect(geometry.button.left).toBeCloseTo(geometry.line.right, 0)
  expect(geometry.line.top - geometry.button.bottom).toBeCloseTo(8, 0)
})

test('flipping top-start uses the last line left edge', async ({ page }) => {
  await prepareLines(page, 'top-start')
  await page.locator('#mixed').evaluate((element) => {
    ;(element as HTMLElement).style.top = '8px'
  })
  await selectDirection(page, '#mixed', true)
  await selectDirection(page, '#mixed', false)
  await expect(page.locator(trigger)).toHaveAttribute('data-placement', 'bottom-start')
  const { button, line } = await lineGeometry(page, 'bottom')
  expect(button.right).toBeCloseTo(line.left, 0)
  expect(button.top - line.bottom).toBeCloseTo(8, 0)
})

test('natural wrapping and partial text selection anchor to the selected last line', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const lastLine = await page.locator('#mixed').evaluate((element) => {
    Object.assign((element as HTMLElement).style, { position: 'fixed', left: '240px', top: '180px', width: '240px' })
    element.textContent = '这是自然换行的测试文字，用来验证跨行选区的末行定位，只选取其中部分文字。'
    const range = document.createRange()
    range.setStart(element.firstChild!, 3)
    range.setEnd(element.firstChild!, 23)
    const rects = Array.from(range.getClientRects())
    if (rects.length < 2) throw new Error('Expected a wrapped selection')
    window.getSelection()!.removeAllRanges()
    window.getSelection()!.addRange(range)
    document.dispatchEvent(new Event('selectionchange'))
    return rects[rects.length - 1].toJSON()
  })
  await expect(page.locator(trigger)).toBeVisible()
  const box = await page.locator(trigger).boundingBox()
  expect(box!.x).toBeCloseTo(lastLine.right, 0)
  expect(box!.y - lastLine.bottom).toBeCloseTo(8, 0)
})

test('multiline forward selection can end to the left of its starting point', async ({ page }) => {
  await prepareLines(page)
  await page.evaluate(() => {
    window.qa.close()
    const first = document.querySelector('#first-line')!.firstChild!
    const last = document.querySelector('#last-line b')!.firstChild!
    window.getSelection()!.setBaseAndExtent(first, 10, last, last.textContent!.length)
    document.dispatchEvent(new Event('selectionchange'))
  })
  await expect(page.locator(trigger)).toBeVisible()
})

for (const placement of ['top', 'bottom', 'auto', 'top-start', 'top-end', 'bottom-start', 'bottom-end'] as const) {
  test(`popover ${placement} uses the same selected-line positioning as the trigger`, async ({ page }) => {
    await prepareLines(page, placement, false, 360)
    await page.locator(trigger).click()
    await expect(page.locator(`${popover} textarea`)).toBeFocused()
    const side = placement.startsWith('top') ? 'top' : 'bottom'
    const geometry = await page.locator(popover).evaluate((element, side) => {
      const range = document.createRange()
      range.selectNodeContents(document.querySelector(side === 'top' ? '#first-line' : '#last-line')!)
      return { box: element.getBoundingClientRect().toJSON(), line: range.getBoundingClientRect().toJSON() }
    }, side)
    const { box, line } = geometry
    if (side === 'top') expect(box.bottom).toBeCloseTo(line.top - 8, 0)
    else expect(box.top).toBeCloseTo(line.bottom + 8, 0)
    if (placement.endsWith('-start')) expect(box.right).toBeCloseTo(line.left, 0)
    else if (placement.endsWith('-end')) expect(box.left).toBeCloseTo(line.right, 0)
    else expect(box.left + box.width / 2).toBeCloseTo(line.left + line.width / 2, 0)
  })
}

test('popover flips against the selected first line near the viewport bottom', async ({ page }) => {
  await prepareLines(page, 'bottom-end', true)
  await page.locator(trigger).click()
  await expect(page.locator(popover)).toHaveAttribute('data-placement', 'top-end')
  const gap = await page.locator(popover).evaluate((element) => {
    const range = document.createRange()
    range.selectNodeContents(document.querySelector('#first-line')!)
    return range.getBoundingClientRect().top - element.getBoundingClientRect().bottom
  })
  expect(gap).toBeCloseTo(8, 0)
})

for (const close of ['escape', 'outside', 'submit', 'disable', 'destroy', 'detach', 'update'] as const) {
  test(`gray selection highlight survives input focus and is released on ${close}`, async ({ page }, testInfo) => {
    await open(page)
    await expect(page.locator(`${popover} textarea`)).toBeFocused()
    const highlights = () =>
      page.evaluate(() => [...CSS.highlights.keys()].filter((name) => name.startsWith('tr-quick-assist-selection-')))
    const names = await highlights()
    expect(names).toHaveLength(1)
    expect(
      await page.locator('#term').evaluate(
        (element, name) => ({
          text: [...CSS.highlights.get(name)!].map((range) => (range as Range).toString()).join(''),
          color: getComputedStyle(element, `::highlight(${name})`).backgroundColor,
          html: element.innerHTML,
        }),
        names[0],
      ),
    ).toEqual({ text: '竞价计费', color: 'rgb(217, 217, 217)', html: '竞价计费' })
    if (close === 'escape') {
      await page.screenshot({ path: testInfo.outputPath('gray-selection-popover.png'), animations: 'disabled' })
      await testInfo.attach('gray-selection-popover', {
        path: testInfo.outputPath('gray-selection-popover.png'),
        contentType: 'image/png',
      })
    }
    await page.locator(`${popover} textarea`).fill('输入问题时仍保留高亮')
    expect(await highlights()).toEqual(names)
    if (close === 'escape') await page.keyboard.press('Escape')
    else if (close === 'outside') await page.locator('#outside-button').click()
    else if (close === 'submit') await page.locator(`${popover} textarea`).press('Enter')
    else
      await page.evaluate((method) => {
        if (method === 'detach') document.querySelector('#term')!.remove()
        else if (method === 'update') window.qa.updateOptions({ trigger: { offset: 12 } })
        else window.qa[method]()
      }, close)
    await expect(page.locator(popover)).toHaveCount(0)
    expect(await highlights()).toEqual([])
  })
}

for (const dark of [false, true]) {
  test(`retained selection is readable with strict style CSP on a ${dark ? 'dark' : 'light'} host`, async ({
    page,
  }) => {
    await page.evaluate((dark) => {
      if (dark) {
        document.body.style.backgroundColor = '#161616'
        document.body.style.color = '#eeeeee'
      }
      const policy = document.createElement('meta')
      policy.httpEquiv = 'Content-Security-Policy'
      policy.content = "style-src 'self'"
      document.head.append(policy)
    }, dark)
    await open(page)
    expect(
      await page.locator('#term').evaluate((element) => {
        const style = getComputedStyle(element, '::highlight(tr-quick-assist-selection-retained)')
        return { background: style.backgroundColor, color: style.color }
      }),
    ).toEqual({ background: 'rgb(217, 217, 217)', color: 'rgb(25, 25, 25)' })
    await expect(page.locator('[data-tr-quick-assist] style')).toHaveCount(0)
    await page.locator(`${popover} textarea`).fill('保留高亮并发送')
    await page.keyboard.press('Enter')
    expect(await page.evaluate(() => window.qaRequests[0].query)).toBe('保留高亮并发送')
  })
}

test('closing one instance retains other instance ranges and unrelated host highlights', async ({ page }) => {
  await page.goto('/quick-assist/umd.html')
  await page.waitForFunction(() => typeof window.TinyRobotVanilla?.createQuickAssist === 'function')
  await page.evaluate(() => {
    window.qa2 = window.TinyRobotVanilla.createQuickAssist({ include: ['#scope'], adapter: { submit() {} } })
    const range = document.createRange()
    range.selectNodeContents(document.querySelector('#term')!)
    CSS.highlights.set('host-highlight', new Highlight(range))
  })
  await select(page)
  await expect(page.locator(trigger)).toHaveCount(2)
  // Open both without an outside pointerdown dismissing the other instance.
  await page.locator(trigger).evaluateAll((buttons) => buttons.forEach((button) => (button as HTMLElement).click()))
  await expect(page.locator(popover)).toHaveCount(2)
  expect(await page.evaluate(() => CSS.highlights.get('tr-quick-assist-selection-retained')!.size)).toBe(2)
  await page.evaluate(() => window.qa.destroy())
  await expect(page.locator(popover)).toHaveCount(1)
  expect(
    await page.evaluate(() => ({
      retained: CSS.highlights.get('tr-quick-assist-selection-retained')!.size,
      host: CSS.highlights.get('host-highlight')!.size,
    })),
  ).toEqual({ retained: 1, host: 1 })
  await page.evaluate(() => window.qa2.destroy())
  expect(await page.evaluate(() => [...CSS.highlights.keys()])).toEqual(['host-highlight'])
})

test('popover keeps its last-line trigger anchor after layout changes', async ({ page }) => {
  await prepareLines(page)
  await page.locator(trigger).click()
  await expect(page.locator(popover)).toBeVisible()
  const before = await page.locator(popover).boundingBox()
  await page.locator('#mixed').evaluate((element) => {
    ;(element as HTMLElement).style.left = '280px'
    element.append(document.createTextNode('')) // Trigger the existing layout observer.
  })
  await expect.poll(async () => (await page.locator(popover).boundingBox())!.x).toBeCloseTo(before!.x + 40, 0)
})

for (const placement of ['bottom-start', 'bottom-end'] as const) {
  test(`${placement} shifts the outward trigger inside viewport edges`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.evaluate((placement) => {
      window.resetQuickAssist({ trigger: { placement } })
      const element = document.querySelector<HTMLElement>('#term')!
      Object.assign(element.style, {
        position: 'fixed',
        top: '180px',
        margin: '0',
        left: placement === 'bottom-start' ? '0' : 'auto',
        right: placement === 'bottom-end' ? '0' : 'auto',
      })
    }, placement)
    await select(page)
    await expect(page.locator(trigger)).toBeVisible()
    const box = await page.locator(trigger).boundingBox()
    if (placement === 'bottom-start') expect(box!.x).toBe(8)
    else expect(box!.x + box!.width).toBe(page.viewportSize()!.width - 8)
  })
}

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

for (const method of ['right-click', 'contextmenu'] as const) {
  test(`${method} hides the trigger without clearing or reactivating the selection`, async ({ page }) => {
    await select(page)
    await expect(page.locator(trigger)).toBeVisible()
    if (method === 'right-click') {
      await page.locator('#term').click({ button: 'right', position: { x: 10, y: 10 } })
    } else {
      const allowed = await page
        .locator('#term')
        .evaluate((element) =>
          element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })),
        )
      expect(allowed).toBe(true)
    }
    await expect(page.locator(trigger)).toHaveCount(0)
    expect(await page.evaluate(() => window.getSelection()?.toString())).toBe('竞价计费')
    await page.evaluate(() => {
      document.dispatchEvent(new Event('selectionchange'))
      document.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'mouse' }))
      document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ContextMenu' }))
    })
    await expect(page.locator(trigger)).toHaveCount(0)
    await select(page, '#other-term')
    await expect(page.locator(trigger)).toBeVisible()
  })
}

test('contextmenu cancels a pending trigger', async ({ page }) => {
  await pauseClock(page)
  await page.evaluate(() => window.resetQuickAssist({ trigger: { showDelay: 800 } }))
  await select(page)
  await page.locator('#term').dispatchEvent('contextmenu')
  await page.clock.runFor(1000)
  await expect(page.locator(trigger)).toHaveCount(0)
  expect(await page.evaluate(() => window.qaEvents.some((event) => event.type === 'trigger_show'))).toBe(false)
})

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

for (const customPrompt of [false, true]) {
  for (const editInput of [false, true]) {
    test(`suggestion query uses its label with customPrompt=${customPrompt} and editInput=${editInput}`, async ({
      page,
    }) => {
      await page.evaluate((customPrompt) => {
        document.querySelector('#term')!.textContent = '计费模式'
        window.resetQuickAssist({
          suggestions: [{ id: 'explain', label: '解释 计费模式', prompt: '请解释计费模式的含义' }],
          ...(customPrompt
            ? {
                buildPrompt: ({ query, context, suggestion }) => `${query}|${context.text}|${suggestion?.prompt}`,
              }
            : {}),
        })
      }, customPrompt)
      await open(page)
      if (editInput) await page.locator(`${popover} textarea`).fill('与推荐项无关的输入')
      await page.getByRole('button', { name: '解释 计费模式', exact: true }).click()
      const requests = await page.evaluate(() => window.qaRequests)
      expect(requests).toHaveLength(1)
      expect(requests[0]).toMatchObject({
        query: '解释 计费模式',
        prompt: customPrompt ? '解释 计费模式|计费模式|请解释计费模式的含义' : '请解释计费模式的含义',
        context: { text: '计费模式' },
        suggestion: { id: 'explain', label: '解释 计费模式', prompt: '请解释计费模式的含义' },
      })
    })
  }
}

test('async-only opens immediately and accepts input while suggestions load', async ({ page }) => {
  await page.evaluate(() => window.resetQuickAssist({ getSuggestions: () => new Promise(() => {}) }))
  await open(page)
  const input = page.locator(`${popover} textarea`)
  await input.fill('手动问题')
  await input.press('Enter')
  await expect(page.locator('#chat')).toBeVisible()
  expect(await page.evaluate(() => window.qaRequests[0])).toMatchObject({
    query: '手动问题',
    prompt: '手动问题',
  })
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

test('remote validation filters malformed and rejected items before merging with sanitized context', async ({
  page,
}) => {
  await page.evaluate(() => {
    const checked: string[] = []
    window.resetQuickAssist({
      suggestions: [{ id: 'static', label: '静态问题', prompt: '静态内容' }],
      sanitizeContext: (context) => ({ ...context, text: '脱敏文本' }),
      getSuggestions: () =>
        [
          null,
          { id: '', label: '无效标识', prompt: '问题' },
          { id: 'blank-label', label: '  ', prompt: '问题' },
          { id: 'blank-prompt', label: '空问题', prompt: '\n' },
          { id: 'missing', label: '缺少问题' },
          { id: 'rejected', label: '业务拒绝', prompt: '不相关内容' },
          { id: 'accepted', label: '有效推荐', prompt: '关于脱敏文本的问题' },
        ] as Suggestion[],
      validateSuggestion: (suggestion, context) => {
        checked.push(suggestion.id)
        document.documentElement.dataset.validatedIds = JSON.stringify(checked)
        const accepted = context.text === '脱敏文本' && suggestion.prompt.includes(context.text)
        suggestion.label = '校验不应修改展示内容'
        return accepted
      },
      mergeSuggestions: (base, incoming) => {
        if (incoming.length !== 1 || incoming[0].id !== 'accepted') throw new Error('merge received invalid items')
        return [...incoming, ...base]
      },
    })
  })
  await open(page)
  await expect(page.getByRole('button', { name: '有效推荐', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '静态问题', exact: true })).toBeVisible()
  expect(await page.locator('html').getAttribute('data-validated-ids')).toBe('["rejected","accepted"]')
  expect(await page.evaluate(() => window.qaEvents.some((event) => event.type === 'error'))).toBe(false)
  await page.getByRole('button', { name: '有效推荐', exact: true }).click()
  expect(await page.evaluate(() => window.qaRequests[0].prompt)).toBe('关于脱敏文本的问题')
})

for (const failure of [
  'malformed',
  'rejected',
  'exception',
  'async-validator',
  'non-array',
  'invalid-merge',
] as const) {
  test(`remote validation ${failure} preserves static questions and reports an error`, async ({ page }) => {
    await page.evaluate((failure) => {
      window.resetQuickAssist({
        suggestions: [{ id: 'static', label: '静态问题', prompt: '静态内容' }],
        getSuggestions: () => {
          if (failure === 'non-array') return {} as Suggestion[]
          if (failure === 'malformed') return [{ id: 'bad', label: '', prompt: '问题' }]
          return [{ id: 'remote', label: '远程问题', prompt: '远程内容' }]
        },
        validateSuggestion: () => {
          if (failure === 'exception') throw new Error('业务校验失败')
          if (failure === 'async-validator') return Promise.resolve(true) as unknown as boolean
          return failure !== 'rejected'
        },
        mergeSuggestions: () => {
          document.documentElement.dataset.invalidMergeCalled = 'true'
          if (failure === 'invalid-merge') return [{ id: 'bad', label: '合并结果', prompt: ' ' }]
          throw new Error('must not merge failed recommendations')
        },
      })
    }, failure)
    await open(page)
    await expect
      .poll(() =>
        page.evaluate(() => window.qaEvents.some((event) => event.type === 'error' && event.stage === 'suggestions')),
      )
      .toBe(true)
    await expect(page.getByRole('button', { name: '静态问题', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '远程问题', exact: true })).toHaveCount(0)
    expect(await page.locator('html').getAttribute('data-invalid-merge-called')).toBe(
      failure === 'invalid-merge' ? 'true' : null,
    )
    await page.getByRole('button', { name: '静态问题', exact: true }).click()
    expect(await page.evaluate(() => window.qaRequests[0].prompt)).toBe('静态内容')
  })
}

test('explicit empty remote results still merge without calling validation', async ({ page }) => {
  await page.evaluate(() =>
    window.resetQuickAssist({
      suggestions: [{ id: 'static', label: '静态问题', prompt: '静态内容' }],
      getSuggestions: () => [],
      validateSuggestion: () => {
        throw new Error('empty results must not be validated')
      },
      mergeSuggestions: (_base, incoming) => incoming,
    }),
  )
  await open(page)
  await expect(page.locator(`${popover} [data-state="empty"]`)).toBeVisible()
  await expect(page.getByRole('button', { name: '静态问题', exact: true })).toHaveCount(0)
  expect(await page.evaluate(() => window.qaEvents.some((event) => event.type === 'error'))).toBe(false)
})

test('remote-only all-invalid recommendations allow manual submission and validation can be updated', async ({
  page,
}) => {
  await page.evaluate(() =>
    window.resetQuickAssist({
      getSuggestions: () => [{ id: 'remote', label: '远程问题', prompt: '远程内容' }],
      validateSuggestion: () => false,
    }),
  )
  await open(page)
  await expect(page.locator(`${popover} [data-state="error"]`)).toBeVisible()
  await page.locator(`${popover} textarea`).fill('手动问题')
  await page.locator(`${popover} textarea`).press('Enter')
  expect(await page.evaluate(() => window.qaRequests[0].prompt)).toBe('手动问题')
  await page.evaluate(() => window.qa.updateOptions({ validateSuggestion: () => true }))
  await open(page)
  await expect(page.getByRole('button', { name: '远程问题', exact: true })).toBeVisible()
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

test('updateOptions replaces supplied nested groups and preserves omitted top-level options', async ({ page }) => {
  await page.evaluate(() => {
    window.resetQuickAssist({
      trigger: { label: '旧入口', showDelay: 800, offset: 40, placement: 'top' },
      selection: { maxTextLength: 3, validate: () => false },
      nearbyContext: { maxLength: 4 },
      messages: { inputLabel: '旧输入', submitLabel: '旧发送' },
      suggestions: [{ id: 'retained', label: '保留任务', prompt: '保留问题' }],
    })
    window.qa.updateOptions({
      trigger: { showDelay: 0 },
      selection: { maxTextLength: 100 },
      nearbyContext: { blockSelectors: ['#scope'] },
      messages: { submitLabel: '新发送' },
    })
  })
  await select(page, '#nearby-term')
  const entry = page.getByRole('button', { name: '智能帮助', exact: true })
  await expect(entry).toBeVisible()
  await expect
    .poll(() =>
      entry.evaluate((element) => {
        const anchor = window.getSelection()!.getRangeAt(0).getBoundingClientRect()
        return element.getBoundingClientRect().top - anchor.bottom
      }),
    )
    .toBeCloseTo(8, 0)
  await entry.click()
  const input = page.getByRole('textbox', { name: '请输入问题', exact: true })
  await expect(input).toBeVisible()
  await expect(page.getByRole('button', { name: '保留任务', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '新发送', exact: true }).click()
  const request = await page.evaluate(() => window.qaRequests[0])
  expect(request.context.nearbyText).toBe('计费模式 弹性计费')
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
