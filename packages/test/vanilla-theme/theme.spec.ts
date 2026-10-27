import { expect, test, type Page } from '@playwright/test'

const host = '[data-tr-vanilla]'
const popover = '.tr-quick-assist__popover'
const input = '.tr-quick-assist__input'

async function select(page: Page) {
  await page.locator('#term').evaluate((element) => {
    const range = document.createRange()
    range.selectNodeContents(element)
    window.getSelection()!.removeAllRanges()
    window.getSelection()!.addRange(range)
    document.dispatchEvent(new Event('selectionchange'))
  })
  await expect(page.locator('.tr-quick-assist__trigger').first()).toBeVisible()
}

for (const entry of ['esm', 'umd']) {
  test.describe(entry, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/vanilla-theme/index.html?entry=${entry}`)
      await page.waitForFunction(() => !!window.themeFixture)
    })

    test('standalone defaults, TinyRobot mode and native color scheme', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })
      await select(page)
      await expect(page.locator(host)).toHaveAttribute('data-tr-vanilla-color-mode', 'light')
      await expect(page.locator('.tr-quick-assist__trigger')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
      await page.evaluate(() => document.documentElement.setAttribute('data-tr-color-mode', 'dark'))
      await expect(page.locator(host)).toHaveCSS('color-scheme', 'dark')
      await expect(page.locator('.tr-quick-assist__trigger')).toHaveCSS('background-color', 'rgb(38, 38, 38)')
      await expect(page.locator('.tr-quick-assist__trigger')).toHaveCSS('color', 'rgb(230, 230, 230)')
      await page.evaluate(() => document.documentElement.removeAttribute('data-tr-color-mode'))
      await expect(page.locator(host)).toHaveAttribute('data-tr-vanilla-color-mode', 'light')
    })

    test('attribute shorthand updates an open session without losing input or focus', async ({ page }) => {
      await page.evaluate(() =>
        window.themeFixture.configure({ source: { type: 'attribute', attribute: 'data-cf-theme' } }),
      )
      await select(page)
      await page.locator('.tr-quick-assist__trigger').click()
      await page.locator(input).fill('正在编辑的问题')
      const before = await page.evaluate(() => window.themeFixture.events.slice())
      for (const mode of ['dark', 'light', 'dark']) {
        await page.evaluate((value) => document.documentElement.setAttribute('data-cf-theme', value), mode)
        await expect(page.locator(host)).toHaveAttribute('data-tr-vanilla-color-mode', mode)
        await expect(page.locator(popover)).toHaveCSS(
          'background-color',
          mode === 'dark' ? 'rgb(38, 38, 38)' : 'rgb(255, 255, 255)',
        )
        await expect(page.locator(input)).toHaveValue('正在编辑的问题')
        await expect(page.locator(input)).toBeFocused()
      }
      expect(await page.evaluate(() => window.themeFixture.events)).toEqual(before)
    })

    test('merges built-in defaults, replaces previous settings, and preserves configuration on errors', async ({
      page,
    }) => {
      await select(page)
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-cf-theme', 'night')
        window.themeFixture.configure({
          source: { type: 'attribute', attribute: 'data-cf-theme', values: { dark: 'night' } },
        })
      })
      await expect(page.locator(host)).toHaveAttribute('data-tr-vanilla-color-mode', 'dark')
      await page.evaluate(() =>
        window.themeFixture.configure({ source: { type: 'attribute', attribute: 'data-cf-theme' } }),
      )
      await expect(page.locator(host)).toHaveAttribute('data-tr-vanilla-color-mode', 'light')
      const errors = await page.evaluate(() => {
        const invalid: unknown[] = [
          { source: { type: 'attribute', selector: '[' } },
          { source: { type: 'attribute', selector: '#missing' } },
          { source: { type: 'attribute', values: { dark: 'light' } } },
          { source: { type: 'attribute', attribute: null } },
          { source: { type: 'class', darkClass: 'two classes' } },
          { source: { type: 'class' }, colorMode: 'dark' },
          { colorMode: 'invalid' },
        ]
        return invalid.map((config) => {
          try {
            window.themeFixture.configure(config as Parameters<typeof window.themeFixture.configure>[0])
            return false
          } catch {
            return true
          }
        })
      })
      expect(errors.every(Boolean)).toBe(true)
      await page.evaluate(() => document.documentElement.setAttribute('data-cf-theme', 'dark'))
      await expect(page.locator(host)).toHaveAttribute('data-tr-vanilla-color-mode', 'dark')
      await page.evaluate(() => window.themeFixture.configure({}))
      await expect(page.locator(host)).toHaveAttribute('data-tr-vanilla-color-mode', 'light')
    })

    test('class tokens and explicit modes have predictable fallbacks', async ({ page }) => {
      await page.evaluate(() => window.themeFixture.configure({ source: { type: 'class' } }))
      await select(page)
      await page.evaluate(() => document.documentElement.classList.add('darkish'))
      await expect(page.locator(host)).toHaveAttribute('data-tr-vanilla-color-mode', 'light')
      await page.evaluate(() => document.documentElement.classList.add('dark'))
      await expect(page.locator(host)).toHaveAttribute('data-tr-vanilla-color-mode', 'dark')
      await page.evaluate(() => window.themeFixture.configure({ colorMode: 'light' }))
      await page.emulateMedia({ colorScheme: 'dark' })
      await expect(page.locator(host)).toHaveAttribute('data-tr-vanilla-color-mode', 'light')
      await page.evaluate(() => window.themeFixture.configure({ colorMode: 'auto' }))
      await expect(page.locator(host)).toHaveAttribute('data-tr-vanilla-color-mode', 'dark')
      await page.emulateMedia({ colorScheme: 'light' })
      await expect(page.locator(host)).toHaveAttribute('data-tr-vanilla-color-mode', 'light')
    })

    test('source replacement and shared listener cleanup', async ({ page }) => {
      await page.evaluate(() => {
        const source = document.createElement('div')
        source.id = 'theme-source'
        source.setAttribute('data-mode', 'dark')
        document.body.append(source)
        window.themeFixture.configure({
          source: { type: 'attribute', selector: '#theme-source', attribute: 'data-mode' },
        })
        window.themeFixture.create()
      })
      await select(page)
      await expect(page.locator(host)).toHaveCount(2)
      expect(await page.evaluate(() => window.themeFixture.observers())).toBe(1)
      await page.evaluate(() => document.querySelector('#theme-source')!.remove())
      await expect(page.locator(host).first()).toHaveAttribute('data-tr-vanilla-color-mode', 'light')
      await page.evaluate(() => {
        const replacement = document.createElement('div')
        replacement.id = 'theme-source'
        replacement.setAttribute('data-mode', 'dark')
        document.body.append(replacement)
      })
      await expect(page.locator(host).first()).toHaveAttribute('data-tr-vanilla-color-mode', 'dark')
      await page.evaluate(() => window.themeFixture.instances[0].destroy())
      await expect(page.locator(host)).toHaveCount(1)
      expect(await page.evaluate(() => window.themeFixture.observers())).toBe(1)
      await page.evaluate(() => window.themeFixture.instances[1].destroy())
      expect(await page.evaluate(() => window.themeFixture.observers())).toBe(0)
      if (entry === 'umd') await expect(page.locator('[data-tr-vanilla-style]')).toHaveCount(0)
      await page.evaluate(() => window.themeFixture.create())
      await select(page)
      await expect(page.locator(host)).toHaveAttribute('data-tr-vanilla-color-mode', 'dark')
    })

    for (const sourceType of ['attribute', 'class'] as const) {
      test(`${sourceType} source follows the first match after insertion, reordering and removal`, async ({ page }) => {
        await page.evaluate((type) => {
          const source = document.createElement('div')
          source.id = 'old-source'
          source.className = 'theme-source'
          source.setAttribute('data-theme', 'light')
          document.body.append(source)
          window.themeFixture.configure({
            source: { type, selector: '.theme-source', ...(type === 'attribute' ? { attribute: 'data-theme' } : {}) },
          })
        }, sourceType)
        await select(page)
        await page.locator('.tr-quick-assist__trigger').click()
        await page.locator(input).fill('保留当前输入')
        const events = await page.evaluate(() => window.themeFixture.events.slice())
        const check = async (mode: string, observers = 1) => {
          await expect(page.locator(host)).toHaveAttribute('data-tr-vanilla-color-mode', mode)
          await expect(page.locator(input)).toHaveValue('保留当前输入')
          await expect(page.locator(input)).toBeFocused()
          expect(await page.evaluate(() => window.themeFixture.observers())).toBe(observers)
          expect(await page.evaluate(() => window.themeFixture.events)).toEqual(events)
        }
        const setMode = async (id: string, mode: string) => {
          await page.locator(`#${id}`).evaluate(
            (source, { type, mode }) => {
              if (type === 'attribute') source.setAttribute('data-theme', mode)
              else source.classList.toggle('dark', mode === 'dark')
            },
            { type: sourceType, mode },
          )
        }
        await check('light')
        await page.evaluate((type) => {
          const next = document.createElement('div')
          next.id = 'new-source'
          next.className = 'theme-source'
          if (type === 'attribute') next.setAttribute('data-theme', 'dark')
          else next.classList.add('dark')
          document.querySelector('#old-source')!.before(next)
        }, sourceType)
        await check('dark')
        await setMode('new-source', 'light')
        await check('light')
        await setMode('old-source', 'dark')
        // Give the old source's mutation a chance to deliver before checking.
        await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))
        await check('light')
        await page.evaluate(() => document.querySelector('#new-source')!.before(document.querySelector('#old-source')!))
        await check('dark')
        await setMode('old-source', 'light')
        await check('light')
        await setMode('new-source', 'dark')
        await page.locator('#old-source').evaluate((source) => source.remove())
        await check('dark')
        await setMode('new-source', 'light')
        await check('light')
        await setMode('new-source', 'dark')
        await check('dark')
        await page.locator('#new-source').evaluate((source) => source.remove())
        await check('light', 0)
        await page.evaluate((type) => {
          const source = document.createElement('div')
          source.className = 'theme-source dark'
          source.setAttribute('data-theme', 'dark')
          if (type === 'class') source.removeAttribute('data-theme')
          document.body.append(source)
        }, sourceType)
        await check('dark')
        await page.evaluate(() => window.themeFixture.instances[0].destroy())
        await expect(page.locator(host)).toHaveCount(0)
        expect(await page.evaluate(() => window.themeFixture.observers())).toBe(0)
      })
    }

    test('inherited TinyRobot tokens and component overrides keep precedence', async ({ page }) => {
      await select(page)
      await page.evaluate(() => {
        document.documentElement.style.setProperty('--tr-container-bg-default', 'rgb(11, 22, 33)')
        document.documentElement.setAttribute('data-tr-color-mode', 'dark')
      })
      await expect(page.locator('.tr-quick-assist__trigger')).toHaveCSS('background-color', 'rgb(11, 22, 33)')
      await page.addStyleTag({ content: '.tr-quick-assist { --tr-quick-assist-bg: rgb(44, 55, 66); }' })
      await expect(page.locator('.tr-quick-assist__trigger')).toHaveCSS('background-color', 'rgb(44, 55, 66)')
    })

    test('global theme CSS works in either order and remains aligned with standalone tokens', async ({ page }) => {
      await select(page)
      for (const before of [true, false]) {
        await page.evaluate((prepend) => {
          document.querySelector('#shared-theme')?.remove()
          const style = document.createElement('style')
          style.id = 'shared-theme'
          style.textContent = window.themeFixture.sharedThemeCSS
          if (prepend) document.head.prepend(style)
          else document.head.append(style)
        }, before)
        for (const mode of ['dark', 'light']) {
          await page.evaluate((value) => document.documentElement.setAttribute('data-tr-color-mode', value), mode)
          await expect(page.locator('.tr-quick-assist__trigger')).toHaveCSS(
            'background-color',
            mode === 'dark' ? 'rgb(38, 38, 38)' : 'rgb(255, 255, 255)',
          )
          expect(
            await page.locator(host).evaluate((element) => {
              const style = getComputedStyle(element)
              return (
                style.getPropertyValue('--tr-container-bg-default').trim() ===
                style.getPropertyValue('--tr-vanilla-default-container-bg-default').trim()
              )
            }),
          ).toBe(true)
        }
      }
    })

    test('iframe documents resolve themes independently', async ({ page }) => {
      await page.evaluate(async () => {
        const frame = document.createElement('iframe')
        const loaded = new Promise<void>((resolve) => (frame.onload = () => resolve()))
        frame.srcdoc =
          '<html data-cf-theme="dark"><body><main id="scope"><p id="term">框架内的主题</p></main></body></html>'
        document.body.append(frame)
        await loaded
        const root = frame.contentDocument!
        // ESM needs explicit iframe CSS; UMD also verifies it can install its own document-local CSS.
        const styles = await fetch(`${window.themeFixture.cssURL}?direct`).then((response) => response.text())
        const style = root.createElement('style')
        style.textContent = styles
        root.head.append(style)
        window.themeFixture.configure({ source: { type: 'attribute', attribute: 'data-cf-theme' } }, root)
        window.themeFixture.create(root)
        const range = root.createRange()
        range.selectNodeContents(root.querySelector('#term')!)
        root.getSelection()!.addRange(range)
        root.dispatchEvent(new Event('selectionchange'))
      })
      const frameHost = page.frameLocator('iframe').locator(host)
      await expect(frameHost).toHaveAttribute('data-tr-vanilla-color-mode', 'dark')
      await expect(page.frameLocator('iframe').locator('.tr-quick-assist__trigger')).toHaveCSS(
        'background-color',
        'rgb(38, 38, 38)',
      )
      await select(page)
      await expect(page.locator(host)).toHaveAttribute('data-tr-vanilla-color-mode', 'light')
      await page.evaluate(() => window.themeFixture.configure({ colorMode: 'dark' }))
      await expect(page.locator(host)).toHaveAttribute('data-tr-vanilla-color-mode', 'dark')
      await page.evaluate(() =>
        document.querySelector('iframe')!.contentDocument!.documentElement.setAttribute('data-cf-theme', 'light'),
      )
      // Parent selection can dismiss the iframe trigger; recreate it to read current iframe state.
      await page
        .frameLocator('iframe')
        .locator('#term')
        .evaluate((element) => {
          const root = element.ownerDocument
          root.getSelection()!.removeAllRanges()
          const range = root.createRange()
          range.selectNodeContents(element)
          root.getSelection()!.addRange(range)
          root.dispatchEvent(new Event('selectionchange'))
        })
      await expect(frameHost).toHaveAttribute('data-tr-vanilla-color-mode', 'light')
    })

    test('light and dark popovers remain readable on desktop and mobile', async ({ page }, testInfo) => {
      for (const width of [1280, 375]) {
        await page.evaluate(() => {
          window.themeFixture.instances.at(-1)!.destroy()
          window.getSelection()!.removeAllRanges()
          window.themeFixture.create()
        })
        await page.setViewportSize({ width, height: 800 })
        await select(page)
        await page.locator('.tr-quick-assist__trigger').click()
        for (const mode of ['light', 'dark'] as const) {
          await page.evaluate((colorMode) => window.themeFixture.configure({ colorMode }), mode)
          await expect(page.locator(popover)).toHaveCSS(
            'background-color',
            mode === 'dark' ? 'rgb(38, 38, 38)' : 'rgb(255, 255, 255)',
          )
          const contrast = await page.locator(input).evaluate((element) => {
            const rgb = (value: string) =>
              value
                .match(/[\d.]+/g)!
                .slice(0, 3)
                .map(Number)
            const luminance = (values: number[]) =>
              values
                .map((n) => n / 255)
                .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4))
                .reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0)
            const foreground = luminance(rgb(getComputedStyle(element).color))
            const background = luminance(
              rgb(getComputedStyle(element.closest('.tr-quick-assist__popover')!).backgroundColor),
            )
            return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05)
          })
          expect(contrast).toBeGreaterThanOrEqual(4.5)
          await page.locator('.tr-quick-assist__suggestion').first().hover()
          await expect(page.locator('.tr-quick-assist__suggestion').first()).toHaveCSS(
            'background-color',
            mode === 'dark' ? 'rgb(38, 38, 38)' : 'rgb(255, 255, 255)',
          )
          await page.screenshot({ path: testInfo.outputPath(`${width}-${mode}.png`), animations: 'disabled' })
        }
        await page.evaluate(() => window.themeFixture.instances.at(-1)!.close())
        await page.evaluate(() => window.getSelection()!.removeAllRanges())
      }
    })
  })
}
