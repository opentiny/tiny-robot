import { expect, test } from '@playwright/test'
import type {} from './main'

for (const entry of ['index', 'umd']) {
  test.describe(`${entry} input`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/quick-assist/${entry}.html`)
      await page.waitForFunction(() => !!window.qa)
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
            await expect(area).toHaveCSS('width', '288px')
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
        window.qa.updateOptions({ input: { maxRows: 3 } })
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
