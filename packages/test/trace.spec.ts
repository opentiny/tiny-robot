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

  test('renders empty and error states and emits error events', async ({ page }) => {
    await page.evaluate(() => window.traceFixture.trace.setItems([]))
    await expect(page.locator('.tr-trajectory__empty')).toHaveText('暂无轨迹')

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

  test('normalizes large item collections without spreading arguments', async ({ page }) => {
    const count = await page.evaluate(() => {
      const items = Array.from({ length: 100_000 }, (_, index) => ({
        id: `item-${index}`,
        type: 'info',
        message: 'item',
        startTime: index,
        endTime: index + 1,
      }))
      return window.traceFixture.normalize(items)
    })

    expect(count).toBe(100_000)
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
})
