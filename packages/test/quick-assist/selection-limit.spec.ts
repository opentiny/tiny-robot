import { expect, test, type Page } from '@playwright/test'
import type {} from './main'

const trigger = '.tr-quick-assist__trigger'
const tooltip = '.tr-quick-assist__selection-tooltip'
const popover = '.tr-quick-assist__popover'

async function selectText(page: Page, text: string, dragging = false) {
  await page.locator('#term').evaluate((element, value) => {
    element.textContent = value
    const range = document.createRange()
    range.selectNodeContents(element)
    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)
    document.dispatchEvent(new Event('selectionchange'))
  }, text)
  if (!dragging) await page.evaluate(() => document.dispatchEvent(new PointerEvent('pointerup')))
}

for (const entry of ['index', 'umd']) {
  test.describe(`${entry} selection limit`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/quick-assist/${entry}.html`)
      await page.waitForFunction(() => !!window.qa)
    })

    test('default 8000 boundary and immediate tooltip after pointer release', async ({ page }, testInfo) => {
      // Keep the selection to one visual line even at the default boundary.
      await page.locator('#term').evaluate((el) => {
        el.style.fontSize = '0.05px'
        el.style.marginTop = '100px'
      })
      await selectText(page, '字'.repeat(8000))
      await expect(page.locator(trigger)).toBeEnabled()
      await page.evaluate(() => document.dispatchEvent(new PointerEvent('pointerdown')))
      await selectText(page, '字'.repeat(8001), true)
      await expect(page.locator(trigger)).toHaveCount(0)
      await expect(page.locator(tooltip)).toHaveCount(0)
      await page.evaluate(() => document.dispatchEvent(new PointerEvent('pointerup')))
      await expect(page.locator(trigger)).toBeDisabled()
      await expect(page.locator(tooltip)).toBeVisible()
      await page.locator(trigger).hover()
      await expect(page.locator(tooltip)).toHaveText('划词字数超出限制 8001/8000')
      await expect(page.locator(tooltip)).toBeVisible()
      await expect(page.locator('.tr-quick-assist__selection-count')).toHaveCSS('color', 'rgb(246, 55, 55)')
      await expect(page.locator(trigger)).toHaveCSS('color', 'rgb(196, 196, 196)')
      await expect(page.locator(trigger)).toHaveCSS('border-color', 'rgb(219, 219, 219)')
      const rects = await page.locator(tooltip).evaluate((el) => {
        const tip = el.getBoundingClientRect()
        const button = document.querySelector('.tr-quick-assist__trigger')!.getBoundingClientRect()
        return { gap: button.top - tip.bottom, center: (tip.left + tip.right - button.left - button.right) / 2 }
      })
      expect(rects.gap).toBeCloseTo(2, 0)
      expect(Math.abs(rects.center)).toBeLessThanOrEqual(1)
      await page.screenshot({ path: testInfo.outputPath('selection-limit-design.png') })
      await page.mouse.move(1200, 700)
      await expect(page.locator(tooltip)).toBeVisible()
      await selectText(page, '正常文本')
      await expect(page.locator(trigger)).toBeEnabled()
      await expect(page.locator(tooltip)).toHaveCount(0)
    })

    test('Unicode counts trim outer whitespace and retain internal spaces and newlines', async ({ page }) => {
      await page.evaluate(() => window.qa.updateOptions({ selection: { maxTextLength: 6 } }))
      await selectText(page, ' \n字😀 空\n文\t ')
      await expect(page.locator(trigger)).toBeEnabled()
      await selectText(page, ' \n字😀 空\n文本\t ')
      await page.locator(trigger).focus()
      await expect(page.locator(tooltip)).toHaveText('划词字数超出限制 7/6')
      await expect(page.locator(tooltip)).toBeVisible()
      await page.keyboard.press('Enter')
      await page.keyboard.press('Space')
      await page.locator(trigger).evaluate((el) => (el as HTMLButtonElement).click())
      await expect(page.locator(popover)).toHaveCount(0)
      expect(await page.evaluate(() => window.qaRequests)).toHaveLength(0)
      await page.keyboard.press('Escape')
      await expect(page.locator(tooltip)).toHaveCount(0)
    })

    test('null removes both limits and restores default selection when omitted', async ({ page }) => {
      await page.evaluate(() => {
        window.qa.updateOptions({ selection: { maxTextLength: null }, input: { maxLength: null, autoFill: true } })
        window.qa.updateOptions({ trigger: { label: '无限制入口' } })
        window.qa.activate({ text: '文本'.repeat(5001), anchor: document.querySelector('#term')!, open: 'popover' })
      })
      await expect(page.locator(`${popover} textarea`)).toBeVisible()
      await expect(page.locator('.tr-quick-assist__counter')).toBeHidden()
      await expect(page.locator('.tr-quick-assist__submit')).toBeEnabled()
      await page.evaluate(() => {
        window.qa.updateOptions({ selection: {} })
        window.qa.activate({ text: '文本'.repeat(5001), anchor: document.querySelector('#term')!, open: 'popover' })
      })
      await expect(page.locator(trigger)).toBeDisabled()
      await expect(page.locator(popover)).toHaveCount(0)
      await page.locator(trigger).focus()
      await expect(page.locator(tooltip)).toHaveText('划词字数超出限制 10002/8000')
    })

    test('external direct-open and registered sources cannot bypass the limit or call providers', async ({ page }) => {
      await page.evaluate(() => {
        const unexpected = () => {
          throw new Error('over-limit providers must not run')
        }
        window.qa.updateOptions({
          selection: { maxTextLength: 3, maxTextLengthExceededMessage: '最多三个字' },
          getContext: unexpected,
          getSuggestions: unexpected,
        })
        window.qa.activate({ text: '四个文字', anchor: document.querySelector('#term')!, open: 'popover' })
      })
      await expect(page.locator(trigger)).toBeDisabled()
      await page.locator(trigger).focus()
      await expect(page.locator(tooltip)).toHaveText('最多三个字 4/3')
      await page.evaluate(() => {
        window.qa.registerSource({
          name: 'editor',
          activate(emit) {
            emit({ source: 'editor', text: '编辑器超长', getRect: () => new DOMRect(220, 180, 5, 20), open: 'popover' })
          },
          deactivate() {},
        })
      })
      await expect(page.locator(trigger)).toBeDisabled()
      await page.locator(trigger).focus()
      await expect(page.locator(tooltip)).toHaveText('最多三个字 5/3')
      await expect(page.locator(popover)).toHaveCount(0)
      expect(await page.evaluate(() => window.qaEvents.filter((e) => e.type === 'error'))).toEqual([])
      await page.evaluate(() => window.qa.destroy())
      await expect(page.locator(tooltip)).toHaveCount(0)
    })

    test('over-limit excluded selections and rejected business validation stay hidden', async ({ page }) => {
      await page.evaluate(() => {
        if (document.querySelector('#sensitive-cross')) return
        document
          .querySelector('#scope')!
          .insertAdjacentHTML(
            'beforeend',
            '<p id="sensitive-cross">公共<span data-sensitive>敏感数据</span></p><p id="url">https://example.com</p><p id="digits">12345</p><p id="contenteditable" contenteditable>可编辑文字</p>',
          )
        document.body.insertAdjacentHTML('beforeend', '<p id="outside">范围之外</p>')
      })
      await page.evaluate(() => window.qa.updateOptions({ selection: { maxTextLength: 1 } }))
      for (const selector of ['#sensitive-cross', '#outside', '#url', '#digits', '#contenteditable']) {
        await page.locator(selector).evaluate((el) => {
          const range = document.createRange()
          range.selectNodeContents(el)
          window.getSelection()!.removeAllRanges()
          window.getSelection()!.addRange(range)
          document.dispatchEvent(new Event('selectionchange'))
        })
        await expect(page.locator(trigger)).toHaveCount(0)
      }
      await page.evaluate(() => window.qa.updateOptions({ selection: { maxTextLength: 1, validate: () => false } }))
      await selectText(page, '有效文本')
      await expect(page.locator(trigger)).toHaveCount(0)
    })

    test('tooltip flips and shifts into a narrow viewport', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 300 })
      await page.evaluate(() => {
        window.qa.updateOptions({ selection: { maxTextLength: 3 }, trigger: { placement: 'top' } })
        window.qa.activate({ source: 'editor', text: '长文本测试', getRect: () => new DOMRect(300, 0, 5, 20) })
      })
      await page.locator(trigger).focus()
      await expect(page.locator(tooltip)).toBeVisible()
      await expect(page.locator(tooltip)).toHaveAttribute('data-placement', 'bottom')
      const rect = await page.locator(tooltip).boundingBox()
      expect(rect!.x).toBeGreaterThanOrEqual(7)
      expect(rect!.x + rect!.width).toBeLessThanOrEqual(313)
      expect(rect!.y + rect!.height).toBeLessThanOrEqual(293)
      await page.evaluate(() => window.qa.disable())
      await expect(page.locator(tooltip)).toHaveCount(0)
    })
  })
}
