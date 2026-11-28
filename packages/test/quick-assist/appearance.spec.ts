import { expect, test } from '@playwright/test'
import type {} from './main'

for (const entry of ['index', 'umd']) {
  test.describe(entry, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/quick-assist/${entry}.html`)
      await page.waitForFunction(() => !!window.qa)
    })

    for (const mode of ['light', 'dark']) {
      test(`issue #500 decoration and hover states in ${mode} mode`, async ({ page }, testInfo) => {
        await page.evaluate((mode) => {
          document.documentElement.setAttribute('data-tr-color-mode', mode)
          window.qa.activate({ text: '解释当前内容', anchor: document.querySelector('#term')! })
        }, mode)
        const trigger = page.locator('.tr-quick-assist__trigger')
        const border = mode === 'light' ? 'rgb(219, 219, 219)' : 'rgba(255, 255, 255, 0.2)'
        const background = mode === 'light' ? 'rgb(255, 255, 255)' : 'rgb(38, 38, 38)'
        await expect(trigger).toHaveCSS('width', '88px')
        await expect(trigger).toHaveCSS('height', '28px')
        expect(
          await trigger.evaluate((element) => {
            const rect = element.getBoundingClientRect()
            const icon = element.querySelector('.tr-quick-assist__sparkle')!.getBoundingClientRect()
            const label = element.querySelector('.tr-quick-assist__trigger-label')!.getBoundingClientRect()
            return { left: icon.left - rect.left, right: rect.right - label.right }
          }),
        ).toEqual({ left: 12, right: 12 })
        await expect(trigger).toHaveCSS('font-size', '12px')
        await expect(trigger).toHaveCSS('line-height', '18px')
        await expect(trigger).toHaveCSS('border-color', border)
        await expect(trigger).toHaveCSS('background-color', background)
        await expect(trigger.locator('.tr-quick-assist__sparkle')).toHaveCSS('width', '12px')
        await expect(trigger.locator('.tr-quick-assist__sparkle')).toHaveCSS('height', '12px')
        await expect(trigger.locator(`.tr-quick-assist__icon--${mode}`)).toBeVisible()
        await trigger.hover()
        await expect(trigger).toHaveCSS('border-color', border)
        await expect(trigger).toHaveCSS('background-color', background)
        await expect(trigger).toHaveCSS('background-image', 'none')
        await expect(trigger).toHaveCSS('color', mode === 'light' ? 'rgb(89, 89, 89)' : 'rgb(179, 179, 179)')
        await page.screenshot({ path: testInfo.outputPath(`${mode}-trigger.png`), animations: 'disabled' })

        await trigger.click()
        const popover = page.locator('.tr-quick-assist__popover')
        const composer = page.locator('.tr-quick-assist__composer')
        const input = page.locator('.tr-quick-assist__input')
        const submit = page.locator('.tr-quick-assist__submit')
        const suggestion = page.locator('.tr-quick-assist__suggestion').first()
        const popoverBorder = border
        const suggestionBorder = mode === 'light' ? 'rgb(230, 230, 230)' : 'rgba(255, 255, 255, 0.2)'
        await expect(popover).toHaveCSS('border-color', popoverBorder)
        for (const surface of [popover, composer, submit, suggestion]) {
          await expect(surface).toHaveCSS(
            'background-color',
            mode === 'light' ? 'rgb(255, 255, 255)' : 'rgb(26, 26, 26)',
          )
        }
        await expect(composer).toHaveCSS('border-color', suggestionBorder)
        await expect(suggestion).toHaveCSS('border-color', suggestionBorder)
        await expect(suggestion).toHaveCSS('height', '28px')
        await expect(submit).toHaveCSS('width', '24px')
        await expect(submit).toHaveCSS('height', '24px')
        await expect(composer.locator('.tr-quick-assist__sparkle')).toHaveCSS('width', '16px')
        await expect(composer.locator('.tr-quick-assist__sparkle')).toHaveCSS('height', '16px')
        await popover.hover({ position: { x: 4, y: 4 } })
        await expect(popover).toHaveCSS('border-color', popoverBorder)
        await expect(suggestion).toHaveCSS(
          'background-color',
          mode === 'light' ? 'rgb(255, 255, 255)' : 'rgb(26, 26, 26)',
        )
        const beforeHover = await suggestion.screenshot({
          path: testInfo.outputPath(`${mode}-suggestion-default.png`),
          animations: 'disabled',
        })
        await suggestion.hover()
        await expect(suggestion).toHaveCSS('border-color', suggestionBorder)
        await expect(suggestion).toHaveCSS(
          'background-color',
          mode === 'light' ? 'rgb(245, 245, 245)' : 'rgb(38, 38, 38)',
        )
        const afterHover = await suggestion.screenshot({
          path: testInfo.outputPath(`${mode}-suggestion-hover.png`),
          animations: 'disabled',
        })
        expect(afterHover.equals(beforeHover), 'recommendation hover must visibly change the rendered button').toBe(
          false,
        )
        const glow = await composer.evaluate((element) => {
          const style = getComputedStyle(element, '::before')
          return { height: style.height, filter: style.filter, opacity: style.opacity, gradient: style.backgroundImage }
        })
        expect(glow).toEqual({
          height: '16px',
          filter: 'blur(40px)',
          opacity: mode === 'light' ? '0.16' : '0.3',
          gradient:
            'linear-gradient(90deg, rgb(255, 105, 141) 22.295%, rgb(229, 66, 191) 40.785%, rgb(180, 36, 255) 61.102%, rgb(13, 135, 255) 79.873%)',
        })
        await expect(submit).toBeEnabled()
        await expect(
          submit.locator(mode === 'light' ? '.tr-quick-assist__icon--black' : '.tr-quick-assist__icon--gray'),
        ).toBeVisible()
        await expect(
          submit.locator(mode === 'light' ? '.tr-quick-assist__icon--gray' : '.tr-quick-assist__icon--black'),
        ).toBeHidden()
        await expect(
          submit.locator(mode === 'light' ? '.tr-quick-assist__icon--black' : '.tr-quick-assist__icon--gray'),
        ).toHaveCSS('opacity', '1')
        await input.fill('')
        await expect(submit).toBeDisabled()
        await expect(submit).toHaveCSS('opacity', '1')
        await expect(submit.locator('.tr-quick-assist__icon--gray')).toBeVisible()
        await expect(submit.locator('.tr-quick-assist__icon--gray')).toHaveCSS(
          'opacity',
          mode === 'dark' ? '0.55' : '1',
        )
        await expect(submit.locator('.tr-quick-assist__icon--black')).toBeHidden()
        await popover.screenshot({ path: testInfo.outputPath(`${mode}-disabled.png`), animations: 'disabled' })
        await input.fill('继续提问')
        await expect(
          submit.locator(mode === 'light' ? '.tr-quick-assist__icon--black' : '.tr-quick-assist__icon--gray'),
        ).toBeVisible()
        await expect
          .poll(() =>
            popover
              .locator('svg:visible')
              .evaluateAll((images) =>
                images.every((icon) => (icon.querySelector('path') as SVGGraphicsElement).getBBox().width > 0),
              ),
          )
          .toBe(true)
        await popover.screenshot({ path: testInfo.outputPath(`${mode}-popover.png`), animations: 'disabled' })

        const nextMode = mode === 'light' ? 'dark' : 'light'
        await page.evaluate(
          (nextMode) => document.documentElement.setAttribute('data-tr-color-mode', nextMode),
          nextMode,
        )
        await expect(composer.locator(`.tr-quick-assist__icon--${nextMode}`)).toBeVisible()
        await expect(composer.locator(`.tr-quick-assist__icon--${mode}`)).toBeHidden()
        await expect(input).toHaveValue('继续提问')
        await expect(input).toBeFocused()
        await submit.click()
        await expect.poll(() => page.evaluate(() => window.qaRequests[0]?.query)).toBe('继续提问')
      })
    }

    for (const custom of [false, true]) {
      for (const viewportWidth of [1280, 240]) {
        for (const side of ['left', 'right']) {
          test(`popover width custom=${custom}, viewport=${viewportWidth}, anchor=${side}`, async ({ page }) => {
            await page.setViewportSize({ width: viewportWidth, height: 720 })
            await page.evaluate(
              ({ custom, side }) => {
                const style = document.createElement('style')
                style.textContent = '.business-quick-assist { --tr-quick-assist-popover-width: 400px; }'
                document.head.append(style)
                const anchor = document.querySelector<HTMLElement>('#term')!
                Object.assign(anchor.style, { position: 'fixed', top: '100px', [side]: '8px' })
                window.qa.updateOptions({ attrs: { popover: { class: custom ? 'business-quick-assist' : '' } } })
                window.qa.activate({ text: 'Explain', anchor, open: 'popover' })
              },
              { custom, side },
            )
            const popover = page.locator('.tr-quick-assist__popover')
            await expect(popover).toBeVisible()
            await expect
              .poll(() =>
                popover.evaluate((element) => {
                  const rect = element.getBoundingClientRect()
                  const composer = element.querySelector('.tr-quick-assist__composer')!
                  const glowWidth = parseFloat(getComputedStyle(composer, '::before').width)
                  return { width: rect.width, inside: rect.left >= 0 && rect.right <= innerWidth, glowWidth }
                }),
              )
              .toEqual({
                width: Math.min(custom ? 400 : 344, viewportWidth - 16),
                inside: true,
                glowWidth: Math.min(312, (custom ? 400 : 344) - 32, viewportWidth - 48),
              })
          })
        }
      }
    }

    test('an anchor that restores visibility under a hidden ancestor can activate', async ({ page }) => {
      await page.evaluate(() => {
        const parent = document.createElement('div')
        parent.id = 'hidden-parent'
        parent.style.visibility = 'hidden'
        const anchor = document.createElement('button')
        anchor.id = 'visible-anchor'
        anchor.style.visibility = 'visible'
        anchor.textContent = 'Visible anchor'
        parent.append(anchor)
        document.body.prepend(parent)
        window.qa.activate({ text: 'Explain the visible anchor', anchor })
      })
      const trigger = page.locator('.tr-quick-assist__trigger')
      await expect(trigger).toBeVisible()
      // Trigger an ancestor observation; the visible override must remain valid.
      await page.locator('#hidden-parent').evaluate((parent) => {
        parent.style.color = 'blue'
      })
      await page.evaluate(
        () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
      )
      await expect(trigger).toBeVisible()
      await trigger.click()
      await expect(page.locator('.tr-quick-assist__popover')).toBeVisible()
      await page.locator('#visible-anchor').evaluate((anchor) => {
        anchor.style.visibility = 'inherit'
      })
      await expect(page.locator('.tr-quick-assist__popover')).toHaveCount(0)
      expect(
        await page.evaluate(() =>
          window.qaEvents.some((event) => event.type === 'close' && event.reason === 'anchor-invalid'),
        ),
      ).toBe(true)
    })

    for (const hidden of ['inherited-visibility', 'own-visibility', 'ancestor-display', 'ancestor-hidden']) {
      test(`a hidden anchor is rejected: ${hidden}`, async ({ page }) => {
        await page.evaluate((hidden) => {
          const parent = document.createElement('div')
          const anchor = document.createElement('button')
          anchor.textContent = 'Hidden anchor'
          if (hidden === 'inherited-visibility') parent.style.visibility = 'hidden'
          if (hidden === 'own-visibility') anchor.style.visibility = 'hidden'
          if (hidden === 'ancestor-display') {
            parent.style.display = 'none'
            anchor.style.visibility = 'visible'
          }
          if (hidden === 'ancestor-hidden') {
            parent.hidden = true
            anchor.style.visibility = 'visible'
          }
          parent.append(anchor)
          document.body.prepend(parent)
          window.qa.activate({ text: 'Explain hidden anchor', anchor })
        }, hidden)
        await expect(page.locator('.tr-quick-assist__trigger')).toHaveCount(0)
        expect(await page.evaluate(() => window.qaEvents.length)).toBe(0)
      })
    }

    for (const width of [1280, 240]) {
      test(`a long trigger label stays inside its button at viewport width ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 720 })
        const label = 'Ask the AI assistant about this selection with a very long trigger label'
        await page.evaluate((label) => {
          window.qa.updateOptions({ trigger: { label } })
          window.qa.activate({ text: 'Explain this term', anchor: document.querySelector('#term')! })
        }, label)
        const trigger = page.getByRole('button', { name: label, exact: true })
        await expect(trigger).toBeVisible()
        await expect(trigger).toHaveAttribute('title', label)
        const geometry = await trigger.evaluate((button) => {
          const text = button.querySelector<HTMLElement>('.tr-quick-assist__trigger-label')!
          const icon = button.querySelector('.tr-quick-assist__sparkle')!
          const buttonRect = button.getBoundingClientRect()
          const textRect = text.getBoundingClientRect()
          return {
            buttonWidth: buttonRect.width,
            buttonLeft: buttonRect.left,
            buttonRight: buttonRect.right,
            textRight: textRect.right,
            textClipped: text.scrollWidth > text.clientWidth,
            overflow: getComputedStyle(text).overflow,
            textOverflow: getComputedStyle(text).textOverflow,
            iconWidth: icon.getBoundingClientRect().width,
          }
        })
        expect(geometry.buttonWidth).toBeLessThanOrEqual(Math.min(220, width - 16))
        expect(geometry.buttonLeft).toBeGreaterThanOrEqual(0)
        expect(geometry.buttonRight).toBeLessThanOrEqual(width)
        expect(geometry.textRight).toBeLessThan(geometry.buttonRight)
        expect(geometry.textClipped).toBe(true)
        expect(geometry.overflow).toBe('hidden')
        expect(geometry.textOverflow).toBe('ellipsis')
        expect(geometry.iconWidth).toBe(12)
        await trigger.click()
        await expect(page.locator('.tr-quick-assist__popover')).toBeVisible()
      })
    }
  })
}
