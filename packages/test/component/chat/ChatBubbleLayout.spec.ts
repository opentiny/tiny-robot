import { expect, test } from '@playwright/experimental-ct-vue'
import ChatBubbleLayoutFixture from './ChatBubbleLayout.fixture.vue'

test('spaces built-in and custom renderers within one assistant bubble', async ({ mount }) => {
  const component = await mount(ChatBubbleLayoutFixture)
  const box = component.locator('.tr-bubble__box[data-role="assistant"]')
  await expect(box.locator('[data-type="markdown"]')).toHaveCount(2)
  await expect(box.getByText('Custom weather summary')).toBeVisible()

  const measureGaps = () =>
    box.evaluate((el) => {
      const gap = (before: Element, after: Element) =>
        after.getBoundingClientRect().top - before.getBoundingClientRect().bottom
      const children = Array.from(el.children)
      const cards = Array.from(el.querySelectorAll('[data-type="tool-call"]'))
      return {
        blocks: children.slice(1).map((child, index) => gap(children[index], child)),
        cards: cards.slice(1).map((card, index) => gap(cards[index], card)),
      }
    })

  expect(await measureGaps()).toEqual({ blocks: [8, 8, 8, 8], cards: [8] })

  await component.evaluate((el) => el.style.setProperty('--tr-bubble-box-content-gap', '16px'))
  expect(await measureGaps()).toEqual({ blocks: [16, 16, 16, 16], cards: [8] })
})

test('honors the tool width override within the available bubble width', async ({ mount, page }) => {
  await page.setViewportSize({ width: 800, height: 600 })
  const component = await mount(ChatBubbleLayoutFixture)
  const card = component.locator('[data-type="tool-call"]').first()
  await expect(card).toHaveCSS('width', '280px')

  await component.evaluate((el) => {
    el.style.setProperty('--tr-bubble-tool-call-min-width', '420px')
    el.style.setProperty('--tr-bubble-tool-call-max-width', '1000px')
  })
  await expect(card).toHaveCSS('width', '420px')

  await page.setViewportSize({ width: 320, height: 600 })
  const widths = await card.evaluate((el) => {
    const box = el.closest('.tr-bubble__box')!
    const style = getComputedStyle(box)
    return {
      card: el.getBoundingClientRect().width,
      content: box.getBoundingClientRect().width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
      right: box.getBoundingClientRect().right,
    }
  })

  expect(widths.card).toBeCloseTo(widths.content)
  expect(widths.card).toBeLessThan(280)
  expect(widths.right).toBeLessThanOrEqual(320)
})

test('keeps tool status and the truncated name on one line at 320px', async ({ mount, page }) => {
  await page.setViewportSize({ width: 320, height: 600 })
  const component = await mount(ChatBubbleLayoutFixture)
  const card = component.locator('[data-type="tool-call"]').first()
  const title = card.getByText('get_weather_forecast', { exact: true })
  const status = card.getByText('已调用', { exact: true })

  const [titleBox, statusBox] = await Promise.all([title.boundingBox(), status.boundingBox()])
  expect(titleBox!.y).toBeCloseTo(statusBox!.y)
  await expect(title).toHaveAttribute('title', 'get_weather_forecast')
  await expect(title).toHaveCSS('text-overflow', 'ellipsis')
  expect(await title.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true)
})
