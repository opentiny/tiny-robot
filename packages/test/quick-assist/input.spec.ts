import { expect, test } from '@playwright/test'
import type {} from './main'

// Keep browser scrollbars enabled so rendering checks also catch duplicate native rails.
test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } })

for (const entry of ['index', 'umd']) {
  test.describe(`${entry} input`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/quick-assist/${entry}.html`)
      await page.waitForFunction(() => !!window.qa)
    })

    test.describe('persistent scrollbar', () => {
      for (const mode of ['light', 'dark']) {
        test(`reserves a rail near the right border and retains it while idle in ${mode}`, async ({ page }, info) => {
          await page.evaluate((mode) => {
            document.documentElement.setAttribute('data-tr-color-mode', mode)
            window.qa.activate({ text: '检查滚动条', anchor: document.querySelector('#term')!, open: 'popover' })
          }, mode)
          const input = page.locator('.tr-quick-assist__input')
          const rail = page.locator('.tr-quick-assist__scrollbar')
          const thumb = rail.locator('.tr-quick-assist__scrollbar-thumb')
          await page.locator('.tr-quick-assist__popover').evaluate(async (element) => {
            await Promise.all(element.getAnimations().map((animation) => animation.finished))
          })
          await input.fill('第一行\n第二行\n第三行')
          await expect(thumb).toHaveCSS('height', '16px')
          await expect(thumb).toHaveCSS('width', '4px')
          await input.fill(
            Array.from({ length: 20 }, (_, index) => `第${index + 1}行：用于验证文字和滚动条不会重叠`).join('\n'),
          )
          await expect(input).toHaveCSS('overflow-y', 'scroll')
          const geometry = await input.evaluate((element) => {
            const area = element as HTMLTextAreaElement
            const rect = area.getBoundingClientRect()
            const form = area.closest('.tr-quick-assist__composer')!
            const composer = form.getBoundingClientRect()
            const rail = form.querySelector('.tr-quick-assist__scrollbar')!.getBoundingClientRect()
            const thumb = form.querySelector('.tr-quick-assist__scrollbar-thumb')!
            const paddingRight = parseFloat(getComputedStyle(area).paddingRight)
            return {
              gutter: rail.width,
              nativeGutter: area.offsetWidth - area.clientWidth,
              thumbHeight: thumb.getBoundingClientRect().height,
              thumbColor: getComputedStyle(thumb).backgroundColor,
              rightInset: composer.right - rail.right,
              textRailGap: rail.left - (rect.right - paddingRight),
              overflowing: area.scrollHeight > area.clientHeight,
              clip: { x: rail.x, y: rail.y, width: rail.width, height: rail.height },
            }
          })
          expect(geometry.gutter).toBe(4)
          expect(geometry.nativeGutter).toBe(0)
          expect(geometry.thumbHeight).toBe(16)
          expect(geometry.thumbColor).toBe(mode === 'light' ? 'rgb(219, 219, 219)' : 'rgb(128, 128, 128)')
          expect(geometry.rightInset).toBe(4)
          expect(geometry.textRailGap).toBe(4)
          expect(geometry.overflowing).toBe(true)
          await input.evaluate((element) => {
            element.scrollTop = 0
          })
          await input.hover()
          await page.mouse.wheel(0, 180)
          await expect.poll(() => input.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
          await input.evaluate(
            (element) =>
              new Promise<void>((resolve) => {
                let last = element.scrollTop
                let stableFrames = 0
                const settle = () => {
                  const current = element.scrollTop
                  stableFrames = current === last ? stableFrames + 1 : 0
                  last = current
                  if (stableFrames >= 8) resolve()
                  else requestAnimationFrame(settle)
                }
                requestAnimationFrame(settle)
              }),
          )
          await page.mouse.move(1, 1)
          const scrolling = await page.screenshot({
            path: info.outputPath('rail-after-scroll.png'),
            clip: geometry.clip,
            caret: 'hide',
            animations: 'disabled',
          })
          // Intentionally wait past the OS overlay scrollbar's usual idle fade.
          await page.waitForTimeout(3500)
          const idle = await page.screenshot({
            path: info.outputPath('rail-after-idle.png'),
            clip: geometry.clip,
            caret: 'hide',
            animations: 'disabled',
          })
          expect(idle.equals(scrolling), 'the dedicated scrollbar rail must not fade after scrolling stops').toBe(true)
          await page
            .locator('.tr-quick-assist__popover')
            .screenshot({ path: info.outputPath('idle-popover.png'), caret: 'hide' })
          const maxScroll = await input.evaluate((element) => element.scrollHeight - element.clientHeight)
          await rail.focus()
          await rail.press('End')
          await expect.poll(() => input.evaluate((element) => element.scrollTop)).toBe(maxScroll)
          await expect(rail).toHaveAttribute('aria-valuenow', String(maxScroll))
          await rail.press('Home')
          await expect.poll(() => input.evaluate((element) => element.scrollTop)).toBe(0)
          await rail.press('ArrowDown')
          await expect.poll(() => input.evaluate((element) => element.scrollTop)).toBe(18)
          await rail.press('Home')
          const knob = await thumb.boundingBox()
          const track = await rail.boundingBox()
          await page.mouse.move(knob!.x + 2, knob!.y + 8)
          await page.mouse.down()
          await page.mouse.move(knob!.x + 2, track!.y + track!.height - 1, { steps: 8 })
          await page.mouse.up()
          await expect.poll(() => input.evaluate((element) => element.scrollTop)).toBe(maxScroll)
          await input.fill('短文本')
          await expect(page.locator('.tr-quick-assist__composer')).toHaveCSS('height', '40px')
          await expect(input).toHaveCSS('overflow-y', 'hidden')
          await expect(rail).toBeHidden()
        })
      }
    })

    test('input defaults to empty without losing selection context', async ({ page }) => {
      await page.evaluate(() => {
        window.qa.updateOptions({ input: {} })
        window.qa.activate({ text: '保留选区上下文', anchor: document.querySelector('#term')!, open: 'popover' })
      })
      const input = page.locator('.tr-quick-assist__input')
      await expect(input).toHaveValue('')
      await expect(page.locator('.tr-quick-assist__submit')).toBeDisabled()
      await input.fill('解释内容')
      await input.press('Enter')
      await expect.poll(() => page.evaluate(() => window.qaRequests[0]?.context.text)).toBe('保留选区上下文')
      await page.evaluate(() => {
        window.qa.updateOptions({ input: { autoFill: true } })
        window.qa.activate({ text: '显式开启预填', anchor: document.querySelector('#term')!, open: 'popover' })
      })
      await expect(input).toHaveValue('显式开启预填')
    })

    test('limit tooltip only exists for a configured character limit', async ({ page }) => {
      const open = () =>
        page.evaluate(() =>
          window.qa.activate({
            text: '输入限制',
            anchor: document.querySelector('#term')!,
            open: 'popover',
          }),
        )
      const tooltip = page.locator('.tr-quick-assist__limit-tooltip')
      await open()
      await expect(tooltip).toHaveCount(0)
      await page.evaluate(() => window.qa.updateOptions({ input: { maxLength: 3 } }))
      await open()
      await expect(tooltip).toHaveCount(1)
      await expect(tooltip).toBeHidden()
      await page.evaluate(() => window.qa.updateOptions({ input: { maxLength: null } }))
      await open()
      await expect(tooltip).toHaveCount(0)
      await page.evaluate(() => window.qa.destroy())
      await expect(tooltip).toHaveCount(0)
    })

    for (const width of [1280, 240]) {
      test(`limit tooltip remains fully painted for pointer and keyboard at width ${width}`, async ({ page }, info) => {
        await page.setViewportSize({ width, height: 300 })
        await page.evaluate(() => {
          window.qa.updateOptions({
            input: { maxLength: 3, autoFill: false, maxLengthExceededMessage: '超过三个字符，请缩短内容后再发送' },
          })
          window.qa.activate({
            source: 'editor',
            text: '单行超限提示',
            getRect: () => new DOMRect(innerWidth - 15, innerHeight - 20, 1, 18),
            open: 'popover',
          })
        })
        const input = page.locator('.tr-quick-assist__input')
        const wrapper = page.locator('.tr-quick-assist__submit-wrapper')
        const tooltip = page.locator('.tr-quick-assist__limit-tooltip')
        await input.fill('iiii')
        await expect(page.locator('.tr-quick-assist__composer')).toHaveCSS('height', '40px')
        for (const action of ['pointer', 'keyboard']) {
          if (action === 'pointer') await wrapper.hover()
          else {
            await page.mouse.move(1, 1)
            await wrapper.focus()
          }
          await expect(tooltip).toBeVisible()
          await expect
            .poll(() =>
              tooltip.evaluate((element) => {
                const rect = element.getBoundingClientRect()
                const range = document.createRange()
                range.selectNodeContents(element)
                const textRects = [...range.getClientRects()]
                return (
                  rect.left >= 7 &&
                  rect.right <= innerWidth - 7 &&
                  rect.top >= 7 &&
                  rect.bottom <= innerHeight - 7 &&
                  textRects.every((r) => {
                    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
                    return hit === element || element.contains(hit)
                  })
                )
              }),
            )
            .toBe(true)
          await page.screenshot({ path: info.outputPath(`limit-${action}.png`), animations: 'disabled' })
        }
        await input.fill('iii')
        await expect(tooltip).toBeHidden()
        await input.fill('一\n二\n三\n四')
        await wrapper.hover()
        await expect(tooltip).toBeVisible()
        await input.press('Escape')
        await expect(tooltip).toHaveCount(0)
        await page.evaluate(() => {
          window.qa.activate({ text: '新会话', anchor: document.querySelector('#term')!, open: 'popover' })
          window.qa.destroy()
        })
        await expect(tooltip).toHaveCount(0)
      })
    }

    test('limit tooltip follows popover scrolling and is hidden while its anchor is clipped', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 220 })
      await page.evaluate(() => {
        window.qa.updateOptions({
          input: { maxLength: 3, autoFill: false },
          maxSuggestions: 20,
          suggestions: Array.from({ length: 20 }, (_, i) => ({
            id: String(i),
            label: `推荐问题 ${i}`,
            prompt: String(i),
          })),
        })
        window.qa.activate({
          source: 'editor',
          text: '检查滚动',
          getRect: () => new DOMRect(160, 30, 1, 18),
          open: 'popover',
        })
      })
      const input = page.locator('.tr-quick-assist__input')
      const wrapper = page.locator('.tr-quick-assist__submit-wrapper')
      const tooltip = page.locator('.tr-quick-assist__limit-tooltip')
      const popover = page.locator('.tr-quick-assist__popover')
      await input.fill('四个字符')
      await wrapper.focus()
      await expect(tooltip).toBeVisible()
      await popover.evaluate((el) => {
        el.scrollTop = el.scrollHeight
      })
      await expect(tooltip).toBeHidden()
      await popover.evaluate((el) => {
        el.scrollTop = 0
      })
      await expect(tooltip).toBeVisible()
      await page.evaluate(() => window.qa.close())
      await expect(tooltip).toHaveCount(0)
    })

    for (const multiline of [false, true]) {
      for (const twoRows of [false, true]) {
        test(`design dimensions: multiline=${multiline}, two suggestion rows=${twoRows}`, async ({ page }) => {
          await page.evaluate(
            ({ multiline, twoRows }) => {
              window.qa.activate({
                text: multiline ? '第一行\n第二行' : '查看系统盘使用率',
                anchor: document.querySelector('#term')!,
                open: 'popover',
                suggestions: twoRows
                  ? [
                      { id: 'a', label: '查看系统盘使用率并解释当前磁盘状态', prompt: 'a' },
                      { id: 'b', label: '查看系统盘使用率并提供优化改进建议', prompt: 'b' },
                    ]
                  : [
                      { id: 'a', label: '解释', prompt: 'a' },
                      { id: 'b', label: '适用场景', prompt: 'b' },
                    ],
              })
            },
            { multiline, twoRows },
          )
          const composer = page.locator('.tr-quick-assist__composer')
          await expect(composer).toBeVisible()
          await expect
            .poll(() =>
              composer.evaluate((el) => {
                const popover = el.parentElement!.getBoundingClientRect()
                const input = el.getBoundingClientRect()
                const items = [...el.parentElement!.querySelectorAll('.tr-quick-assist__suggestion')].map((e) =>
                  e.getBoundingClientRect(),
                )
                return {
                  popover: [popover.width, popover.height],
                  composer: [input.width, input.height],
                  inset: [input.left - popover.left, input.top - popover.top],
                  gap: items[0].top - input.bottom,
                  recommendationGap:
                    items[1].top === items[0].top ? items[1].left - items[0].right : items[1].top - items[0].bottom,
                  pillHeights: items.map((item) => item.height),
                }
              }),
            )
            .toEqual({
              popover: [344, (multiline ? 84 : 40) + 32 + 8 + (twoRows ? 64 : 28)],
              composer: [312, multiline ? 84 : 40],
              inset: [16, 16],
              gap: 8,
              recommendationGap: 8,
              pillHeights: [28, 28],
            })
          if (multiline) {
            const area = page.locator('.tr-quick-assist__input')
            await expect(area).toHaveCSS('height', '36px')
            await expect(area).toHaveCSS('width', '296px')
            await expect(area).toHaveCSS('font-size', '12px')
            await expect(area).toHaveCSS('line-height', '18px')
          }
          await page
            .locator('.tr-quick-assist__popover')
            .screenshot({ path: test.info().outputPath('design.png'), animations: 'disabled' })
        })
      }
    }

    test('grows, scrolls, shrinks, and supports configured rows and unlimited input', async ({ page }) => {
      await page.evaluate(() =>
        window.qa.activate({
          text: '选中文本',
          anchor: document.querySelector('#term')!,
          open: 'popover',
          autoFill: false,
        }),
      )
      const input = page.locator('.tr-quick-assist__input')
      await expect(input).toHaveAttribute('placeholder', '告诉 AI 你想做什么')
      await expect(page.locator('.tr-quick-assist__counter')).toBeHidden()
      await expect(page.locator('.tr-quick-assist__submit')).toBeDisabled()
      await page
        .locator('.tr-quick-assist__popover')
        .screenshot({ path: test.info().outputPath('empty.png'), animations: 'disabled' })
      await input.fill('第一行')
      await input.press('Shift+Enter')
      await input.press('End')
      await input.fill('第一行\n第二行')
      await expect(input).toHaveCSS('height', '36px')
      await input.fill('第一行\n第二行\n第三行\n第四行')
      await expect(input).toHaveCSS('height', '36px')
      expect(await input.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true)
      await input.fill('短文本')
      await expect(page.locator('.tr-quick-assist__composer')).toHaveCSS('height', '40px')
      await input.fill('文'.repeat(10001))
      await expect(input).toHaveCSS('height', '36px')
      await expect(page.locator('.tr-quick-assist__submit')).toBeEnabled()
      await page.evaluate(() => {
        window.qa.updateOptions({ input: { maxRows: 3, autoFill: true } })
        window.qa.activate({ text: '一\n二\n三\n四', anchor: document.querySelector('#term')!, open: 'popover' })
      })
      await expect(input).toHaveCSS('height', '54px')
    })

    test('automatic wrapping responds to width and IME completion without submitting', async ({ page }) => {
      await page.evaluate(() =>
        window.qa.activate({
          text: '这是用来验证输入区自动折行及尺寸变化的文本',
          anchor: document.querySelector('#term')!,
          open: 'popover',
        }),
      )
      const input = page.locator('.tr-quick-assist__input')
      const popover = page.locator('.tr-quick-assist__popover')
      await expect(input).toHaveCSS('height', '36px')
      await popover.evaluate((el) => (el as HTMLElement).style.setProperty('--tr-quick-assist-popover-width', '600px'))
      await expect(input).toHaveCSS('height', '18px')
      await popover.evaluate((el) => (el as HTMLElement).style.removeProperty('--tr-quick-assist-popover-width'))
      await expect(input).toHaveCSS('height', '36px')
      await input.dispatchEvent('compositionstart')
      await input.press('Enter')
      expect(await page.evaluate(() => window.qaRequests.length)).toBe(0)
      await input.fill('第一行\n第二行\n第三行')
      await input.dispatchEvent('compositionend')
      await expect(input).toHaveCSS('height', '36px')
      await input.fill('单行')
      await expect(page.locator('.tr-quick-assist__composer')).toHaveCSS('height', '40px')
    })

    test('inherited font changes expand and shrink without another input or width change', async ({ page }) => {
      await page.evaluate(() => {
        document.body.style.fontFamily = 'sans-serif'
        window.qa.activate({ text: '选中文本', anchor: document.querySelector('#term')!, open: 'popover' })
      })
      const input = page.locator('.tr-quick-assist__input')
      await input.fill('i'.repeat(42))
      await expect(input).toHaveCSS('height', '18px')
      await page.evaluate(() => {
        document.body.style.fontFamily = 'monospace'
      })
      await expect(input).toHaveCSS('height', '36px')
      await expect(page.locator('.tr-quick-assist__composer')).toHaveCSS('height', '84px')
      await page.evaluate(() => {
        document.body.style.fontFamily = 'sans-serif'
      })
      await expect(input).toHaveCSS('height', '18px')
      await expect(page.locator('.tr-quick-assist__composer')).toHaveCSS('height', '40px')
    })

    test('loading a font remeasures wrapping even when the CSS family string stays unchanged', async ({ page }) => {
      await page.evaluate(() => {
        document.body.style.fontFamily = 'QuickAssistLateMono, sans-serif'
        window.qa.activate({ text: '选中文本', anchor: document.querySelector('#term')!, open: 'popover' })
      })
      const input = page.locator('.tr-quick-assist__input')
      await input.fill('i'.repeat(42))
      await expect(input).toHaveCSS('height', '18px')
      const family = await input.evaluate((el) => getComputedStyle(el).fontFamily)
      const status = await page.evaluate(async () => {
        const font = new FontFace(
          'QuickAssistLateMono',
          'local("Courier New"), local("Liberation Mono"), local("DejaVu Sans Mono"), local("Courier")',
        )
        document.fonts.add(font)
        await font.load()
        return font.status
      })
      expect(status).toBe('loaded')
      await expect(input).toHaveCSS('font-family', family)
      await expect(input).toHaveCSS('height', '36px')
      await expect(page.locator('.tr-quick-assist__composer')).toHaveCSS('height', '84px')
    })

    test('closing cancels pending font layout work and releases font listeners across sessions', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const fonts = document.fonts
        const add = fonts.addEventListener.bind(fonts)
        const remove = fonts.removeEventListener.bind(fonts)
        const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>()
        fonts.addEventListener = (...args: Parameters<FontFaceSet['addEventListener']>) => {
          const [type, listener] = args
          if (listener && (type === 'loadingdone' || type === 'loadingerror')) {
            if (!listeners.has(type)) listeners.set(type, new Set())
            listeners.get(type)!.add(listener)
          }
          add(...args)
        }
        fonts.removeEventListener = (...args: Parameters<FontFaceSet['removeEventListener']>) => {
          const [type, listener] = args
          if (listener) listeners.get(type)?.delete(listener)
          remove(...args)
        }
        const size = () => [...listeners.values()].reduce((total, set) => total + set.size, 0)
        const open = () =>
          window.qa.activate({
            text: '新会话',
            anchor: document.querySelector('#term')!,
            open: 'popover',
            autoFill: false,
          })
        const records: number[] = []
        try {
          open()
          records.push(size())
          // Schedule a font-driven measure, then close before its animation frame.
          document.body.style.fontFamily = 'monospace'
          fonts.dispatchEvent(new Event('loadingdone'))
          window.qa.close()
          records.push(size())
          open()
          records.push(size())
          await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
          const value = document.querySelector<HTMLTextAreaElement>('.tr-quick-assist__input')!.value
          window.qa.destroy()
          records.push(size())
          fonts.dispatchEvent(new Event('loadingdone'))
          return { records, value, hosts: document.querySelectorAll('.tr-quick-assist').length }
        } finally {
          fonts.addEventListener = add
          fonts.removeEventListener = remove
        }
      })
      expect(result).toEqual({ records: [2, 0, 2, 0], value: '', hosts: 0 })
    })

    test('input copy belongs to input, while the dialog keeps its own accessible name', async ({ page }) => {
      await page.evaluate(() => {
        window.qa.updateOptions({
          trigger: { label: '上下文助手' },
          input: {
            placeholder: '输入自定义问题',
            ariaLabel: '问题内容',
            submitLabel: '提交问题',
            maxLength: 3,
            maxLengthExceededMessage: '最多三个字符',
            autoFill: false,
          },
        })
        window.qa.activate({ text: '选中文本', anchor: document.querySelector('#term')!, open: 'popover' })
      })
      await expect(page.getByRole('dialog', { name: '上下文助手', exact: true })).toBeVisible()
      const input = page.getByRole('textbox', { name: '问题内容', exact: true })
      await expect(input).toHaveAttribute('placeholder', '输入自定义问题')
      const submit = page.getByRole('button', { name: '提交问题', exact: true })
      await expect(submit).toHaveAttribute('title', '提交问题')
      await input.fill('四个字符')
      await page.locator('.tr-quick-assist__submit-wrapper').hover()
      await expect(page.getByRole('tooltip')).toHaveText('最多三个字符')
      await expect(submit).toBeDisabled()
      await input.fill('三个字')
      await expect(submit).toBeEnabled()
    })

    test('messages only customize recommendation loading, empty and failure states', async ({ page }) => {
      await page.evaluate(() => {
        window.qa.updateOptions({
          messages: { loading: '获取建议中', empty: '没有建议', error: '建议不可用' },
          suggestions: [],
          getSuggestions: () =>
            new Promise((resolve) => {
              window.resolveSuggestion = () => resolve([])
            }),
        })
        window.qa.activate({ text: '选中文本', anchor: document.querySelector('#term')!, open: 'popover' })
      })
      await expect(page.locator('.tr-quick-assist__status')).toHaveText('获取建议中')
      await page.evaluate(() => window.resolveSuggestion())
      await expect(page.locator('.tr-quick-assist__status')).toHaveText('没有建议')
      await expect(page.getByRole('textbox', { name: '请输入问题', exact: true })).toHaveAttribute(
        'placeholder',
        '告诉 AI 你想做什么',
      )
      await page.evaluate(() => {
        window.qa.updateOptions({
          getSuggestions: async () => {
            throw new Error('推荐请求失败')
          },
        })
        window.qa.activate({ text: '选中文本', anchor: document.querySelector('#term')!, open: 'popover' })
      })
      await expect(page.locator('.tr-quick-assist__status')).toHaveText('建议不可用')
    })

    test('counts Unicode code points from empty, blocks every manual submission, and recovers', async ({ page }) => {
      await page.evaluate(() => {
        window.qa.updateOptions({ input: { maxLength: 4, autoFill: false } })
        window.qa.activate({ text: '选中文本', anchor: document.querySelector('#term')!, open: 'popover' })
      })
      const input = page.locator('.tr-quick-assist__input')
      const submit = page.locator('.tr-quick-assist__submit')
      const counter = page.locator('.tr-quick-assist__counter')
      await expect(counter).toHaveText('0 / 4')
      await expect(submit).toBeDisabled()
      await input.fill('中😀\na')
      await expect(counter).toHaveText('4 / 4')
      await expect(submit).toBeEnabled()
      await input.fill('中😀\nab')
      await expect(counter).toHaveText('5 / 4')
      await expect(submit).toBeDisabled()
      await expect(input).toHaveAttribute('aria-invalid', 'true')
      await page.locator('.tr-quick-assist__submit-wrapper').hover()
      await expect(page.getByRole('tooltip')).toHaveText('字数超出限制')
      await expect(page.getByRole('tooltip')).toBeVisible()
      await page
        .locator('.tr-quick-assist__popover')
        .screenshot({ path: test.info().outputPath('over-limit.png'), animations: 'disabled' })
      await input.press('Enter')
      await page
        .locator('form')
        .evaluate((form) => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
      expect(await page.evaluate(() => window.qaRequests.length)).toBe(0)
      await input.fill('中😀\na')
      await input.press('Enter')
      await expect.poll(() => page.evaluate(() => window.qaRequests.length)).toBe(1)
    })

    test('design counted states at 9500, 10000 and 10001 Unicode characters', async ({ page }) => {
      await page.evaluate(() => {
        window.qa.updateOptions({ input: { maxLength: 10000, autoFill: false } })
        window.qa.activate({ text: '系统盘', anchor: document.querySelector('#term')!, open: 'popover' })
      })
      const input = page.locator('.tr-quick-assist__input')
      const submit = page.locator('.tr-quick-assist__submit')
      for (const length of [9500, 10000, 10001]) {
        await input.fill('查看系统盘使用率'.repeat(1251).slice(0, length))
        await input.evaluate((el) => {
          el.scrollTop = 0
        })
        await expect(page.locator('.tr-quick-assist__counter')).toHaveText(`${length} / 10000`)
        if (length > 10000) {
          await expect(submit).toBeDisabled()
          await page.locator('.tr-quick-assist__submit-wrapper').hover()
          await expect(page.getByRole('tooltip')).toBeVisible()
        } else await expect(submit).toBeEnabled()
        await page
          .locator('.tr-quick-assist__popover')
          .screenshot({ path: test.info().outputPath(`count-${length}.png`), animations: 'disabled' })
      }
    })

    test('prefill override is session-local for both activation forms and preserves context', async ({ page }) => {
      await page.evaluate(() => {
        window.qa.updateOptions({ input: { autoFill: false } })
        window.qa.activate({
          text: '代码文本',
          source: 'monaco',
          getRect: () => document.querySelector('#term')!.getBoundingClientRect(),
          autoFill: true,
          open: 'popover',
        })
      })
      const input = page.locator('.tr-quick-assist__input')
      await expect(input).toHaveValue('代码文本')
      await page.evaluate(() =>
        window.qa.activate({
          text: '代码文本',
          source: 'monaco',
          getRect: () => document.querySelector('#term')!.getBoundingClientRect(),
          open: 'popover',
        }),
      )
      await expect(input).toHaveValue('')
      await page.evaluate(() => {
        window.qa.updateOptions({ input: { autoFill: true } })
        window.qa.activate({
          text: '保留上下文',
          anchor: document.querySelector('#term')!,
          autoFill: false,
          open: 'popover',
        })
      })
      await expect(input).toHaveValue('')
      await input.fill('解释代码')
      await input.press('Enter')
      await expect.poll(() => page.evaluate(() => window.qaRequests[0]?.context.text)).toBe('保留上下文')
      await page.evaluate(() =>
        window.qa.activate({ text: '默认预填', anchor: document.querySelector('#term')!, open: 'popover' }),
      )
      await expect(input).toHaveValue('默认预填')
    })

    test('defaults to two recommendations, allows explicit override, and keeps resized popover inside viewport', async ({
      page,
    }) => {
      await page.evaluate(() => {
        const anchor = document.querySelector<HTMLElement>('#term')!
        Object.assign(anchor.style, { position: 'fixed', top: '600px', left: '500px' })
        const suggestions = ['a', 'b', 'c'].map((id) => ({ id, label: id, prompt: id }))
        window.qa.activate({ text: '选中文本', anchor, suggestions, open: 'popover' })
      })
      await expect(page.locator('.tr-quick-assist__suggestion')).toHaveCount(2)
      await page.locator('.tr-quick-assist__input').fill('一\n二\n三')
      await expect
        .poll(() =>
          page.locator('.tr-quick-assist__popover').evaluate((el) => {
            const r = el.getBoundingClientRect()
            return r.top >= 8 && r.bottom <= innerHeight - 8
          }),
        )
        .toBe(true)
      await page.evaluate(() => {
        window.qa.updateOptions({ maxSuggestions: 3 })
        window.qa.activate({
          text: '选中文本',
          anchor: document.querySelector('#term')!,
          suggestions: ['a', 'b', 'c'].map((id) => ({ id, label: id, prompt: id })),
          open: 'popover',
        })
      })
      await expect(page.locator('.tr-quick-assist__suggestion')).toHaveCount(3)
    })
  })
}
