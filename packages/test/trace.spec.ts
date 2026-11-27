import { expect, test } from '@playwright/test'

test.describe('Trace vanilla component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/trace.html')
    await page.waitForFunction(() => !!window.traceFixture)
  })

  test('selects timeline segments and message rows with button semantics', async ({ page }) => {
    const segments = page.locator('.tr-trajectory__segment')
    const rows = page.locator('.tr-trajectory__item')

    await expect(segments).toHaveCount(4)
    await expect(rows).toHaveCount(4)
    await expect(page.locator('.tr-trajectory__list')).not.toHaveAttribute('role', 'listbox')
    await expect(segments.first()).toHaveAttribute('aria-pressed', 'false')
    await expect(rows.first()).toHaveAttribute('aria-pressed', 'false')

    await segments.nth(1).click()
    await expect(segments.nth(1)).toHaveAttribute('aria-pressed', 'true')
    await expect(rows.nth(1)).toHaveAttribute('aria-pressed', 'true')

    await rows.nth(2).click()
    await expect(segments.nth(2)).toHaveAttribute('aria-pressed', 'true')
    await expect(rows.nth(2)).toHaveAttribute('aria-pressed', 'true')
  })

  test('preserves keyboard focus after selecting a timeline segment', async ({ page }) => {
    const firstSegment = page.locator('.tr-trajectory__segment').first()
    await firstSegment.focus()
    await page.keyboard.press('Enter')

    await expect
      .poll(() => page.evaluate(() => document.activeElement?.getAttribute('data-tr-trajectory-id')))
      .toBe('prepare')
    await page.keyboard.press('Tab')
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.getAttribute('data-tr-trajectory-id')))
      .toBe('load')
  })

  test('preserves keyboard focus inside a shadow root after selecting a timeline segment', async ({ page }) => {
    await page.evaluate(() => {
      const shadowHost = document.createElement('div')
      shadowHost.id = 'trace-shadow-focus-test'
      const shadowRoot = shadowHost.attachShadow({ mode: 'open' })
      const container = document.createElement('div')
      container.style.width = '500px'
      shadowRoot.append(container)
      document.body.append(shadowHost)
      window.traceFixture.createTrace({
        container,
        items: [
          { id: 'shadow-first', type: 'info', message: 'first', startTime: 0, endTime: 1 },
          { id: 'shadow-second', type: 'success', message: 'second', startTime: 1, endTime: 2 },
        ],
      })
      const first = container.querySelector<HTMLElement>('.tr-trajectory__segment')!
      first.focus()
    })

    await page.keyboard.press('Enter')
    await expect
      .poll(() =>
        page.evaluate(() =>
          document
            .querySelector('#trace-shadow-focus-test')
            ?.shadowRoot?.activeElement?.getAttribute('data-tr-trajectory-id'),
        ),
      )
      .toBe('shadow-first')

    await page.keyboard.press('Tab')
    await expect
      .poll(() =>
        page.evaluate(() =>
          document
            .querySelector('#trace-shadow-focus-test')
            ?.shadowRoot?.activeElement?.getAttribute('data-tr-trajectory-id'),
        ),
      )
      .toBe('shadow-second')

    await page.evaluate(() => document.querySelector('#trace-shadow-focus-test')?.remove())
  })

  test('supports compact, clock, none, and custom duration formats', async ({ page }) => {
    const duration = page.locator('.tr-trajectory__duration')

    await expect(duration.first()).toHaveText('00:00:00')
    await page.evaluate(() => window.traceFixture.trace.updateOptions({ durationFormat: 'compact' }))
    await expect(duration.first()).toHaveText('420ms')

    await page.evaluate(() => window.traceFixture.trace.updateOptions({ durationFormat: 'none' }))
    await expect(page.locator('.tr-trajectory__duration')).toHaveCount(0)
    await expect(page.locator('.tr-trajectory__list.is-no-duration')).toHaveCount(1)

    const formatterCalls = await page.evaluate(() => {
      let calls = 0
      window.traceFixture.trace.updateOptions({
        durationFormat: 'none',
        formatDuration: () => {
          calls += 1
          return 'should not be rendered'
        },
      })
      return calls
    })
    expect(formatterCalls).toBe(0)

    await page.evaluate(() =>
      window.traceFixture.trace.updateOptions({
        durationFormat: 'compact',
        formatDuration: (durationMs) => `${durationMs} ms`,
      }),
    )
    await expect(duration.first()).toHaveText('420 ms')
  })

  test('renders default colors and non-string values', async ({ page }) => {
    await expect(page.locator('[data-tr-trajectory-id="prepare"] .tr-trajectory__label')).toHaveCSS(
      'background-color',
      'rgb(191, 219, 254)',
    )

    await page.evaluate(() => {
      window.traceFixture.trace.setItems([
        {
          id: 'object',
          type: 'info',
          label: 42,
          message: { detail: 'object message' },
          startTime: 0,
          endTime: 1000,
        },
      ])
    })
    await expect(page.locator('.tr-trajectory__label')).toHaveText('42')
    await expect(page.locator('.tr-trajectory__message')).toHaveText('{"detail":"object message"}')

    await page.evaluate(() => {
      window.traceFixture.trace.setItems([
        { id: 'unknown', type: 'unknown-type', message: 'unknown', startTime: 0, endTime: 1000 },
      ])
    })
    await expect(page.locator('.tr-trajectory__label')).toHaveCSS('background-color', 'rgb(100, 116, 139)')
  })

  test('preserves built-in text color when a label background is overridden', async ({ page }) => {
    await page.evaluate(() =>
      window.traceFixture.trace.updateOptions({
        labels: { info: { color: '#ffffff' } },
      }),
    )

    await expect(page.locator('[data-tr-trajectory-id="prepare"] .tr-trajectory__label-text')).toHaveCSS(
      'color',
      'rgb(37, 99, 235)',
    )

    await page.evaluate(() =>
      window.traceFixture.trace.updateOptions({
        labels: { info: { color: '#ffffff', textColor: undefined } },
      }),
    )

    await expect(page.locator('[data-tr-trajectory-id="prepare"] .tr-trajectory__label-text')).toHaveCSS(
      'color',
      'rgb(37, 99, 235)',
    )
  })

  test('supports programmatic selection and dynamic item updates', async ({ page }) => {
    const result = await page.evaluate(() => {
      window.traceFixture.resetEvents()
      window.traceFixture.trace.select('load')
      const selected = window.traceFixture.trace.getSelectedId()
      window.traceFixture.trace.clearSelection()
      const cleared = window.traceFixture.trace.getSelectedId()
      window.traceFixture.trace.setItems([
        { id: 'next', type: 'success', label: '下一步', message: '更新后的记录', startTime: 0, endTime: 800 },
      ])
      return {
        selected,
        cleared,
        events: window.traceFixture.events.map((event) => event.type),
      }
    })

    expect(result.selected).toBe('load')
    expect(result.cleared).toBe(null)
    expect(result.events).toEqual(['select', 'select', 'update'])
    await expect(page.locator('.tr-trajectory__item')).toHaveCount(1)
    await expect(page.locator('.tr-trajectory__message')).toHaveText('更新后的记录')

    await page.evaluate(() => {
      window.traceFixture.trace.select('next')
      window.traceFixture.trace.setItems([
        { id: 'replacement', type: 'info', message: '替换后的记录', startTime: 100, endTime: 900 },
      ])
    })
    await expect(page.locator('.tr-trajectory__item')).toHaveAttribute('aria-pressed', 'false')
    expect(await page.evaluate(() => window.traceFixture.trace.getSelectedId())).toBe(null)
  })

  test('updates axis range and label options', async ({ page }) => {
    const initialWidth = await page
      .locator('.tr-trajectory__segment')
      .first()
      .evaluate((element) => element.style.width)

    const result = await page.evaluate(() => {
      window.traceFixture.resetEvents()
      window.traceFixture.trace.updateOptions({
        axis: { startTime: 0, endTime: 20_000 },
        labels: { info: { text: '信息', color: '#fef3c7', textColor: '#a16207' } },
      })
      const label = document.querySelector<HTMLElement>('[data-tr-trajectory-id="prepare"] .tr-trajectory__label')
      return {
        events: window.traceFixture.events.map((event) => event.type),
        width: document.querySelector<HTMLElement>('.tr-trajectory__segment')?.style.width,
        background: label ? getComputedStyle(label).backgroundColor : '',
      }
    })

    expect(result.events).toEqual(['update'])
    expect(result.width).not.toBe(initialWidth)
    expect(result.background).toBe('rgb(254, 243, 199)')

    await page.evaluate(() => window.traceFixture.trace.updateOptions({ axis: {} }))
    await expect(page.locator('.tr-trajectory__segment')).toHaveCount(4)
  })

  test('renders overlapping timeline items on separate clickable lanes', async ({ page }) => {
    await page.evaluate(() => {
      window.traceFixture.trace.setItems([
        { id: 'outer', type: 'info', message: 'outer', startTime: 0, endTime: 100 },
        { id: 'inner', type: 'success', message: 'inner', startTime: 25, endTime: 75 },
      ])
    })

    const segments = page.locator('.tr-trajectory__segment')
    await expect(segments).toHaveCount(2)
    expect(await segments.nth(0).evaluate((element) => element.style.top)).not.toBe(
      await segments.nth(1).evaluate((element) => element.style.top),
    )

    await segments.nth(0).click()
    await expect(segments.nth(0)).toHaveAttribute('aria-pressed', 'true')
    await segments.nth(1).click()
    await expect(segments.nth(1)).toHaveAttribute('aria-pressed', 'true')
  })

  test('assigns lanes chronologically while preserving message order', async ({ page }) => {
    await page.evaluate(() => {
      window.traceFixture.trace.setItems(
        Array.from({ length: 100 }, (_, index) => {
          const startTime = (99 - index) * 2
          return {
            id: `item-${99 - index}`,
            type: 'info',
            message: `item-${99 - index}`,
            startTime,
            endTime: startTime + 1,
          }
        }),
      )
    })

    await expect(page.locator('.tr-trajectory__segment')).toHaveCount(100)
    await expect(page.locator('.tr-trajectory__track')).toHaveAttribute('style', /height: 18px/)
    await expect(page.locator('.tr-trajectory__item').first()).toHaveAttribute('data-tr-trajectory-id', 'item-99')
    await expect(page.locator('.tr-trajectory__item').last()).toHaveAttribute('data-tr-trajectory-id', 'item-0')
  })

  test('keeps coincident zero-duration timeline items separately selectable', async ({ page }) => {
    await page.evaluate(() => {
      window.traceFixture.trace.setItems([
        { id: 'zero-a', type: 'info', message: 'zero-a', startTime: 5, endTime: 5 },
        { id: 'zero-b', type: 'success', message: 'zero-b', startTime: 5, endTime: 5 },
      ])
    })

    const segments = page.locator('.tr-trajectory__segment')
    await expect(segments).toHaveCount(2)
    expect(await segments.nth(0).evaluate((element) => element.style.top)).not.toBe(
      await segments.nth(1).evaluate((element) => element.style.top),
    )

    await segments.nth(0).click()
    await expect(segments.nth(0)).toHaveAttribute('aria-pressed', 'true')
    await segments.nth(1).click()
    await expect(segments.nth(1)).toHaveAttribute('aria-pressed', 'true')
  })

  test('keeps a zero-duration item separate from a record starting at the same time', async ({ page }) => {
    await page.evaluate(() => {
      window.traceFixture.trace.setItems([
        { id: 'point', type: 'info', message: 'point', startTime: 5, endTime: 5 },
        { id: 'range', type: 'success', message: 'range', startTime: 5, endTime: 10 },
      ])
    })

    const segments = page.locator('.tr-trajectory__segment')
    await expect(segments).toHaveCount(2)
    expect(await segments.nth(0).evaluate((element) => element.style.top)).not.toBe(
      await segments.nth(1).evaluate((element) => element.style.top),
    )

    await segments.nth(0).click()
    await expect(segments.nth(0)).toHaveAttribute('aria-pressed', 'true')
    await segments.nth(1).click()
    await expect(segments.nth(1)).toHaveAttribute('aria-pressed', 'true')
  })

  test('renders empty and error states and emits error events', async ({ page }) => {
    await page.evaluate(() => window.traceFixture.trace.setItems([]))
    await expect(page.locator('.tr-trajectory__empty')).toHaveText('暂无轨迹')
    await expect(page.locator('.tr-trajectory__empty')).toHaveCSS('color', 'rgb(89, 89, 89)')

    await page.evaluate(() => window.traceFixture.trace.updateOptions({ messages: { empty: '没有执行记录' } }))
    await expect(page.locator('.tr-trajectory__empty')).toHaveText('没有执行记录')

    const result = await page.evaluate(() => {
      window.traceFixture.resetEvents()
      window.traceFixture.trace.setItems([
        { id: 'duplicate', type: 'info', message: 'one', startTime: 0, endTime: 1 },
        { id: 'duplicate', type: 'info', message: 'two', startTime: 1, endTime: 2 },
      ])
      const duplicateEvents = window.traceFixture.events.map((event) => event.type)
      const duplicateMessage = document.querySelector('.tr-trajectory__error')?.textContent ?? ''
      window.traceFixture.resetEvents()
      window.traceFixture.trace.setItems([
        { id: 'invalid-time', type: 'info', message: 'invalid', startTime: 10, endTime: 1 },
      ])
      return {
        duplicateEvents,
        duplicateMessage,
        invalidTimeEvents: window.traceFixture.events.map((event) => event.type),
        invalidTimeMessage: document.querySelector('.tr-trajectory__error')?.textContent ?? '',
      }
    })
    expect(result.duplicateEvents).toEqual(['error'])
    expect(result.invalidTimeEvents).toEqual(['error'])
    expect(result.duplicateMessage).toContain('Duplicate trajectory item id')
    expect(result.invalidTimeMessage).toContain('endTime must be >= startTime')
  })

  test('uses the existing vanilla error color in dark mode', async ({ page }) => {
    await page.evaluate(() => window.traceFixture.configureTheme('dark'))
    await page.evaluate(() =>
      window.traceFixture.trace.setItems([
        { id: 'invalid', type: 'info', message: 'invalid', startTime: 10, endTime: 1 },
      ]),
    )

    await expect(page.locator('.tr-trajectory__error')).toHaveCSS('color', 'rgb(217, 72, 56)')
  })

  test('keeps the previous state when a candidate render fails', async ({ page }) => {
    const result = await page.evaluate(() => {
      window.traceFixture.trace.select('prepare')
      window.traceFixture.trace.updateOptions({
        formatDuration: (_duration, item) => {
          if (item.id === 'bad') throw new Error('duration formatter failed')
          return 'ok'
        },
      })
      window.traceFixture.resetEvents()
      window.traceFixture.trace.setItems([{ id: 'bad', type: 'error', message: 'bad', startTime: 0, endTime: 1 }])
      return {
        selectedId: window.traceFixture.trace.getSelectedId(),
        events: window.traceFixture.events.map((event) => event.type),
      }
    })

    expect(result.selectedId).toBe('prepare')
    expect(result.events).toEqual(['error'])
    await expect(page.locator('.tr-trajectory__error')).toHaveText('duration formatter failed')

    await page.evaluate(() => window.traceFixture.trace.updateOptions({ formatDuration: undefined }))
    await expect(page.locator('[data-tr-trajectory-id="prepare"]').first()).toBeVisible()
    expect(await page.evaluate(() => window.traceFixture.trace.getSelectedId())).toBe('prepare')

    const updateResult = await page.evaluate(() => {
      window.traceFixture.trace.setItems([{ id: 'bad', type: 'error', message: 'bad', startTime: 0, endTime: 1 }])
      window.traceFixture.trace.select('bad')
      window.traceFixture.resetEvents()
      window.traceFixture.trace.updateOptions({
        formatDuration: () => {
          throw new Error('option formatter failed')
        },
      })
      return {
        selectedId: window.traceFixture.trace.getSelectedId(),
        events: window.traceFixture.events.map((event) => event.type),
      }
    })

    expect(updateResult.selectedId).toBe('bad')
    expect(updateResult.events).toEqual(['error'])
    await expect(page.locator('.tr-trajectory__error')).toHaveText('option formatter failed')
    await page.evaluate(() => window.traceFixture.trace.updateOptions({ formatDuration: undefined }))
    await expect(page.locator('[data-tr-trajectory-id="bad"]').first()).toBeVisible()
  })

  test('omits timeline segments outside the explicit axis and supports a one-sided empty axis', async ({ page }) => {
    await page.evaluate(() => {
      window.traceFixture.trace.updateOptions({ axis: { startTime: 10, endTime: 20 } })
      window.traceFixture.trace.setItems([
        { id: 'before', type: 'info', message: 'before', startTime: 0, endTime: 5 },
        { id: 'after', type: 'success', message: 'after', startTime: 30, endTime: 40 },
      ])
    })

    await expect(page.locator('.tr-trajectory__segment')).toHaveCount(0)
    await expect(page.locator('.tr-trajectory__item')).toHaveCount(2)

    await page.evaluate(() => {
      window.traceFixture.trace.setItems([])
      window.traceFixture.trace.updateOptions({ axis: { startTime: 10, endTime: undefined } })
    })
    await expect(page.locator('.tr-trajectory__empty')).toBeVisible()
    await expect(page.locator('.tr-trajectory__error')).toHaveCount(0)
  })

  test('keeps one-sided axis ranges valid when all records are on the opposite side', async ({ page }) => {
    await page.evaluate(() => {
      window.traceFixture.trace.updateOptions({ axis: { startTime: 10, endTime: undefined } })
      window.traceFixture.trace.setItems([{ id: 'before', type: 'info', message: 'before', startTime: 0, endTime: 5 }])
    })

    await expect(page.locator('.tr-trajectory__segment')).toHaveCount(0)
    await expect(page.locator('.tr-trajectory__item')).toHaveCount(1)
    await expect(page.locator('.tr-trajectory__error')).toHaveCount(0)

    await page.evaluate(() => {
      window.traceFixture.trace.updateOptions({ axis: { startTime: undefined, endTime: 10 } })
      window.traceFixture.trace.setItems([{ id: 'after', type: 'info', message: 'after', startTime: 20, endTime: 25 }])
    })
    await expect(page.locator('.tr-trajectory__segment')).toHaveCount(0)
    await expect(page.locator('.tr-trajectory__item')).toHaveCount(1)
    await expect(page.locator('.tr-trajectory__error')).toHaveCount(0)
  })

  test('renders intersecting records as separate point markers on a zero-length axis', async ({ page }) => {
    await page.evaluate(() => {
      window.traceFixture.trace.updateOptions({ axis: { startTime: 5, endTime: 5 } })
      window.traceFixture.trace.setItems([
        { id: 'crossing', type: 'info', message: 'crossing', startTime: 0, endTime: 10 },
        { id: 'point', type: 'success', message: 'point', startTime: 5, endTime: 5 },
      ])
    })

    const segments = page.locator('.tr-trajectory__segment')
    await expect(segments).toHaveCount(2)
    const leftPositions = await segments.evaluateAll((elements) => elements.map((element) => element.style.left))
    expect(leftPositions[0]).toBe(leftPositions[1])
    await expect(segments.nth(0)).toHaveAttribute('style', /width: 4px/)
    await expect(segments.nth(1)).toHaveAttribute('style', /width: 4px/)
    await expect(segments.nth(0)).toHaveAttribute('style', /transform: translateX\(-50%\)/)
    expect(await segments.nth(0).evaluate((element) => element.style.top)).not.toBe(
      await segments.nth(1).evaluate((element) => element.style.top),
    )
  })

  test('handles clicks from an iframe-owned document', async ({ page }) => {
    const selectedId = await page.evaluate(() => {
      const iframe = document.createElement('iframe')
      document.body.append(iframe)
      const iframeDocument = iframe.contentDocument!
      const container = iframeDocument.createElement('div')
      iframeDocument.body.append(container)
      const instance = window.traceFixture.createTrace({
        container,
        items: [{ id: 'iframe-item', type: 'info', message: 'iframe', startTime: 0, endTime: 1 }],
      })
      container.querySelector<HTMLElement>('.tr-trajectory__item')!.click()
      const result = instance.getSelectedId()
      instance.destroy()
      iframe.remove()
      return result
    })

    expect(selectedId).toBe('iframe-item')
  })

  test('preserves milliseconds for Date values created by an iframe window', async ({ page }) => {
    const duration = await page.evaluate(() => {
      const iframe = document.createElement('iframe')
      document.body.append(iframe)
      const iframeDocument = iframe.contentDocument!
      const DateConstructor = iframe.contentWindow!.Date
      const container = iframeDocument.createElement('div')
      iframeDocument.body.append(container)
      const instance = window.traceFixture.createTrace({
        container,
        items: [
          {
            id: 'cross-window-date',
            type: 'info',
            message: 'cross-window-date',
            startTime: new DateConstructor('2026-11-26T10:00:00.100Z'),
            endTime: new DateConstructor('2026-11-26T10:00:00.420Z'),
          },
        ],
      })
      const text = container.querySelector('.tr-trajectory__duration')?.textContent ?? ''
      instance.destroy()
      iframe.remove()
      return text
    })

    expect(duration).toBe('320ms')
  })

  test('reflows timeline without reformatting durations when the container resizes', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    await page.evaluate(() => {
      const container = document.createElement('div')
      container.style.width = '900px'
      document.body.append(container)
      const state = { calls: 0, width: 0, fail: false, container, observer: undefined as ResizeObserver | undefined }
      const instance = window.traceFixture.createTrace({
        container,
        items: [{ id: 'resize', type: 'info', message: 'resize', startTime: 0, endTime: 1 }],
        formatDuration: () => {
          state.calls += 1
          if (state.fail) throw new Error('formatter unavailable')
          return '1ms'
        },
      })
      state.observer = new ResizeObserver(([entry]) => {
        state.width = Math.round(entry.contentRect.width)
      })
      state.observer.observe(container)
      Reflect.set(state, 'instance', instance)
      Reflect.set(window, '__traceResizeTest', state)
    })

    await page.waitForFunction(() => (Reflect.get(window, '__traceResizeTest') as { width: number }).width > 0)
    const initialCalls = await page.evaluate(
      () => (Reflect.get(window, '__traceResizeTest') as { calls: number }).calls,
    )

    await page.evaluate(() => {
      const state = Reflect.get(window, '__traceResizeTest') as { container: HTMLElement; fail: boolean }
      state.fail = true
      state.container.style.width = '390px'
    })
    await page.waitForFunction(() => (Reflect.get(window, '__traceResizeTest') as { width: number }).width === 390)
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))

    expect(pageErrors).toEqual([])
    await expect
      .poll(() => page.evaluate(() => (Reflect.get(window, '__traceResizeTest') as { calls: number }).calls))
      .toBe(initialCalls)
    await page.evaluate(() => {
      const state = Reflect.get(window, '__traceResizeTest') as {
        observer: ResizeObserver
        instance: { destroy(): void }
        container: HTMLElement
      }
      state.observer.disconnect()
      state.instance.destroy()
      state.container.remove()
      Reflect.deleteProperty(window, '__traceResizeTest')
    })
  })

  test('expands the selected message for touch and keyboard users', async ({ page }) => {
    await page.evaluate(() => {
      window.traceFixture.trace.setItems([
        {
          id: 'long',
          type: 'info',
          message: 'This is a long message that should be readable after selection.',
          startTime: 0,
          endTime: 1,
        },
      ])
    })
    const row = page.locator('.tr-trajectory__item')
    await row.click()
    await expect(row.locator('.tr-trajectory__message')).toHaveCSS('white-space', 'normal')
  })

  test('follows the configured vanilla theme and accepts host variable overrides', async ({ page }) => {
    await page.evaluate(() => window.traceFixture.configureTheme('dark'))
    await expect(page.locator('.tr-trajectory')).toHaveCSS('background-color', 'rgb(38, 38, 38)')
    await expect(page.locator('.tr-trajectory__track')).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.2)')

    await page.locator('.tr-trajectory__item').first().click()
    await expect(page.locator('.tr-trajectory__item').first()).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.2)')
    await page.locator('.tr-trajectory__item').nth(1).hover()
    await expect(page.locator('.tr-trajectory__item').nth(1)).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.2)')

    await page.locator('#trace').evaluate((element) => element.style.setProperty('--tr-trajectory-bg', '#000000'))
    await expect(page.locator('.tr-trajectory')).toHaveCSS('background-color', 'rgb(0, 0, 0)')
  })

  test('keeps a visible keyboard focus indicator on message rows', async ({ page }) => {
    const outline = await page
      .locator('.tr-trajectory__item')
      .first()
      .evaluate((element) => {
        element.focus()
        const style = getComputedStyle(element)
        return { width: style.outlineWidth, style: style.outlineStyle }
      })

    expect(outline).toEqual({ width: '2px', style: 'solid' })
  })

  test('applies valid options when selectedId is unknown', async ({ page }) => {
    const result = await page.evaluate(() => {
      window.traceFixture.resetEvents()
      window.traceFixture.trace.updateOptions({
        selectedId: 'missing-id',
        labels: { info: { text: '信息', color: '#fef3c7', textColor: '#a16207' } },
      })
      const label = document.querySelector<HTMLElement>('[data-tr-trajectory-id="prepare"] .tr-trajectory__label')
      return {
        selectedId: window.traceFixture.trace.getSelectedId(),
        events: window.traceFixture.events.map((event) => event.type),
        background: label ? getComputedStyle(label).backgroundColor : '',
      }
    })

    expect(result.selectedId).toBe(null)
    expect(result.events).toEqual(['update'])
    expect(result.background).toBe('rgb(254, 243, 199)')
  })

  test('removes its DOM when destroyed', async ({ page }) => {
    await expect(page.locator('.tr-trajectory')).toHaveCount(1)
    const eventCount = await page.evaluate(() => {
      window.traceFixture.resetEvents()
      window.traceFixture.trace.destroy()
      window.traceFixture.trace.select('prepare')
      return window.traceFixture.events.length
    })
    expect(eventCount).toBe(0)
    await expect(page.locator('.tr-trajectory')).toHaveCount(0)
  })

  test('validates invalid UMD options before installing styles', async ({ page }) => {
    const errors = await page.evaluate(() => {
      const messages: string[] = []
      let installedStyleDuringCall = false
      const observer = new MutationObserver((records) => {
        installedStyleDuringCall ||= records.some((record) =>
          Array.from(record.addedNodes).some(
            (node) => node instanceof HTMLStyleElement && node.hasAttribute('data-tr-vanilla-style'),
          ),
        )
      })
      observer.observe(document.head, { childList: true })
      try {
        window.traceFixture.createUMDTrace(null as never)
      } catch (error) {
        messages.push(error instanceof Error ? error.message : String(error))
      }
      try {
        window.traceFixture.createUMDTrace({ container: null as never, items: [] })
      } catch (error) {
        messages.push(error instanceof Error ? error.message : String(error))
      }
      try {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        window.traceFixture.createUMDTrace({ container: svg as never, items: [] })
      } catch (error) {
        messages.push(error instanceof Error ? error.message : String(error))
      }
      try {
        window.traceFixture.createUMDTrace({
          container: document.createElement('div'),
          items: [{ id: 1, type: 'info', message: 'invalid', startTime: 0, endTime: 1 } as never],
        })
      } catch (error) {
        messages.push(error instanceof Error ? error.message : String(error))
      }
      observer.disconnect()
      return { messages, installedStyleDuringCall }
    })

    expect(errors.messages).toEqual([
      'Trajectory options must be an object',
      'Trajectory requires an HTMLElement container',
      'Trajectory requires an HTMLElement container',
      'Trajectory item id must be a non-empty string',
    ])
    expect(errors.installedStyleDuringCall).toBe(false)
  })

  test('validates runtime option values during creation and updates', async ({ page }) => {
    const errors = await page.evaluate(() => {
      const messages: string[] = []
      const container = document.createElement('div')
      const options = { container, items: window.traceFixture.items }
      for (const invalid of [{ durationFormat: 'invalid' }, { formatDuration: 'invalid' }, { onEvent: 'invalid' }]) {
        try {
          window.traceFixture.createUMDTrace({ ...options, ...invalid } as never)
        } catch (error) {
          messages.push(error instanceof Error ? error.message : String(error))
        }
      }

      window.traceFixture.resetEvents()
      window.traceFixture.trace.updateOptions({ durationFormat: 'invalid' } as never)
      messages.push(
        ...window.traceFixture.events.map((event) => (event.type === 'error' ? event.error.message : event.type)),
      )
      return messages
    })

    expect(errors).toEqual([
      'Trajectory durationFormat must be compact, clock, or none',
      'Trajectory formatDuration must be a function',
      'Trajectory onEvent must be a function',
      'Trajectory durationFormat must be compact, clock, or none',
    ])
  })

  test('reports invalid update options through the error event', async ({ page }) => {
    const result = await page.evaluate(() => {
      window.traceFixture.resetEvents()
      window.traceFixture.trace.updateOptions(null as never)
      return window.traceFixture.events.map((event) => event.type)
    })

    expect(result).toEqual(['error'])
    await expect(page.locator('.tr-trajectory__error')).toHaveText('Trajectory update options must be an object')
  })

  test('keeps a point marker separate when it starts at a positive segment endpoint', async ({ page }) => {
    await page.evaluate(() => {
      window.traceFixture.trace.setItems([
        { id: 'point', type: 'info', message: 'point', startTime: 5, endTime: 5 },
        { id: 'range', type: 'success', message: 'range', startTime: 0, endTime: 5 },
      ])
    })

    const segments = page.locator('.tr-trajectory__segment')
    await expect(segments).toHaveCount(2)
    expect(await segments.nth(0).evaluate((element) => element.style.top)).not.toBe(
      await segments.nth(1).evaluate((element) => element.style.top),
    )

    await segments.nth(0).click()
    await expect(segments.nth(0)).toHaveAttribute('aria-pressed', 'true')
    await segments.nth(1).click()
    await expect(segments.nth(1)).toHaveAttribute('aria-pressed', 'true')
  })

  test('keeps short adjacent timeline segments independently clickable in a narrow container', async ({ page }) => {
    const result = await page.evaluate(() => {
      const container = document.createElement('div')
      container.style.width = '390px'
      document.body.append(container)
      const instance = window.traceFixture.createTrace({
        container,
        items: [
          { id: 'first', type: 'info', message: 'first', startTime: 0, endTime: 1 },
          { id: 'second', type: 'info', message: 'second', startTime: 1, endTime: 2 },
          { id: 'rest', type: 'info', message: 'rest', startTime: 2, endTime: 1000 },
        ],
      })
      const hits: Array<{ id: string; hitId: string | null; selectedId: string | null }> = []
      for (const id of ['first', 'second', 'rest']) {
        const segment = container.querySelector<HTMLElement>(`[data-tr-trajectory-id="${id}"]`)
        const rect = segment!.getBoundingClientRect()
        const target = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        ) as HTMLElement | null
        target?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        hits.push({ id, hitId: target?.dataset.trTrajectoryId ?? null, selectedId: instance.getSelectedId() })
      }
      instance.destroy()
      container.remove()
      return hits
    })

    expect(result).toEqual([
      { id: 'first', hitId: 'first', selectedId: 'first' },
      { id: 'second', hitId: 'second', selectedId: 'second' },
      { id: 'rest', hitId: 'rest', selectedId: 'rest' },
    ])
  })

  test('lays out many overlapping timeline segments without losing their lanes', async ({ page }) => {
    const count = await page.evaluate(() => {
      const container = document.createElement('div')
      container.style.width = '390px'
      document.body.append(container)
      const instance = window.traceFixture.createTrace({
        container,
        items: Array.from({ length: 2000 }, (_, index) => ({
          id: `overlap-${index}`,
          type: 'info',
          message: 'overlap',
          startTime: 0,
          endTime: 1,
        })),
      })
      const result = container.querySelectorAll('.tr-trajectory__segment').length
      instance.destroy()
      container.remove()
      return result
    })

    expect(count).toBe(2000)
  })
})
