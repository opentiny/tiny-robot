import { expect, test } from '@playwright/experimental-ct-vue'
import AnchorFixture from './Anchor.fixture.vue'

const buttonSelector = '.tr-anchor__item'

test('animates stable buttons from 16px to 32px without scaling labels or markers', async ({ mount, page }) => {
  const component = await mount(AnchorFixture, { props: { count: 3, height: 400 } })
  const buttons = component.locator(buttonSelector)
  await expect(buttons.first()).toHaveCSS('height', '16px')
  const original = await buttons.nth(1).elementHandle()
  const marker = component.locator('.tr-anchor__marker').nth(1)
  const markerBefore = await marker.boundingBox()
  const rect = (await buttons.nth(1).boundingBox())!
  await page.mouse.move(rect.x + rect.width - 6, rect.y + rect.height / 2)
  await expect(buttons.first()).toHaveCSS('height', '32px')
  expect(await original!.evaluate((el) => el === document.querySelectorAll('.tr-anchor__item')[1])).toBe(true)
  await expect(component.locator('.tr-anchor__item-label').nth(1)).toHaveCSS('opacity', '1')
  await expect(component.locator('.tr-anchor__item-label').nth(1)).toHaveCSS('transform', 'none')
  expect((await marker.boundingBox())!.height).toBe(markerBefore!.height)
  const after = (await buttons.nth(1).boundingBox())!
  expect(Math.abs(after.y + after.height / 2 - (rect.y + rect.height / 2))).toBeLessThan(3)
  await buttons.nth(1).click()
  await expect(component.getByTestId('selected')).toHaveText('item-1')
})

for (const count of [22, 120]) {
  test(`${count} items scroll locally by wheel and keyboard inside a short frame`, async ({ mount, page }) => {
    const component = await mount(AnchorFixture, { props: { count, height: 240 } })
    const panel = component.locator('.tr-anchor__panel')
    const buttons = component.locator(buttonSelector)
    await buttons.first().hover()
    await expect(buttons.first()).toHaveCSS('height', '32px')
    await expect(panel).toHaveCSS('scrollbar-width', 'none')
    const bounds = (await panel.boundingBox())!
    const frame = (await component.getByTestId('frame').boundingBox())!
    expect(bounds.y).toBeGreaterThanOrEqual(frame.y)
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(frame.y + frame.height)
    await page.mouse.wheel(0, 10000)
    await expect.poll(() => panel.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
    // Home/End focus must reveal only within nav, never scroll the hidden frame.
    await buttons.last().focus()
    await page.keyboard.press('Home')
    await expect(buttons.first()).toBeFocused()
    await page.keyboard.press('End')
    await expect(buttons.last()).toBeFocused()
    const last = (await buttons.last().boundingBox())!
    expect(last.y + last.height).toBeLessThanOrEqual(bounds.y + bounds.height + 1)
    await expect.poll(() => component.getByTestId('frame').evaluate((el) => el.scrollTop)).toBe(0)
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Enter')
    await expect(component.getByTestId('selected')).toHaveText(`item-${count - 2}`)
  })
}

test('shows current item on entry and preserves wheel browsing when current item changes', async ({ mount, page }) => {
  const component = await mount(AnchorFixture, { props: { count: 80, manual: true } })
  await component.getByTestId('activate-last').click()
  const panel = component.locator('.tr-anchor__panel')
  await expect.poll(() => panel.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
  await component.getByTestId('toggle').click()
  await expect(component.locator(buttonSelector).last()).toBeInViewport()
  await panel.hover()
  await page.mouse.wheel(0, -10000)
  await expect.poll(() => panel.evaluate((el) => el.scrollTop)).toBe(0)
  await component.update({ props: { count: 80, manual: true, activeIndex: 0 } })
  await component.update({ props: { count: 80, manual: true, activeIndex: 79 } })
  await expect(component.locator('[aria-current="location"]')).toHaveAttribute('data-item-id', 'item-79')
  expect(await panel.evaluate((el) => el.scrollTop)).toBe(0)
})

test('keeps the current row near its latest position when collapsing after wheel browsing', async ({ mount, page }) => {
  const component = await mount(AnchorFixture, { props: { count: 80, height: 240, manual: true, activeIndex: 20 } })
  const toggle = component.getByTestId('toggle')
  const panel = component.locator('.tr-anchor__panel')
  const current = component.locator('[aria-current="location"]')
  const center = async () => {
    const box = (await current.boundingBox())!
    return box.y + box.height / 2
  }
  const scrollTop = () => panel.evaluate((el) => el.scrollTop)

  await toggle.click()
  await expect(current).toHaveCSS('height', '32px')
  // Let the floating position finish settling before creating a new focus pin.
  await page.waitForTimeout(250)
  await current.focus()
  const beforeWheel = await scrollTop()
  await panel.hover()
  await page.mouse.wheel(0, 64)
  await expect.poll(scrollTop).toBeGreaterThanOrEqual(beforeWheel + 64)
  const afterWheel = await center()

  await toggle.click()
  await expect(current).toHaveCSS('height', '16px')
  await expect.poll(async () => Math.abs((await center()) - afterWheel)).toBeLessThan(3)
})

test('manual expansion, search and resize retain a bounded keyboard scrollport', async ({ mount, page }) => {
  const component = await mount(AnchorFixture, { props: { count: 60, manual: true, search: true, placement: 'left' } })
  await component.getByTestId('toggle').click()
  await expect(component.locator(buttonSelector).first()).toHaveCSS('height', '32px')
  await component.update({ props: { count: 60, manual: true, search: true, placement: 'left', height: 160 } })
  await component.locator(buttonSelector).first().focus()
  await page.keyboard.press('End')
  const frame = (await component.getByTestId('frame').boundingBox())!
  await expect
    .poll(async () => {
      const last = (await component.locator(buttonSelector).last().boundingBox())!
      return last.y + last.height
    })
    .toBeLessThanOrEqual(frame.y + frame.height)
  const search = (await component.locator('.tr-anchor__search-cap').boundingBox())!
  expect(search.y).toBeGreaterThanOrEqual(frame.y)
  expect(await component.getByTestId('frame').evaluate((el) => el.scrollTop)).toBe(0)
})

test('keeps a lower hovered row under the pointer and collapses on exit after selection', async ({ mount, page }) => {
  const component = await mount(AnchorFixture, { props: { count: 22, height: 440 } })
  const button = component.locator(buttonSelector).nth(15)
  await expect(button).toHaveCSS('height', '16px')
  const before = (await button.boundingBox())!
  const x = before.x + before.width - 6
  const y = before.y + before.height / 2
  await page.mouse.move(x, y)
  await expect(button).toHaveCSS('height', '32px')
  const after = (await button.boundingBox())!
  expect(Math.abs(after.y + after.height / 2 - y)).toBeLessThan(3)
  await page.mouse.click(x, y)
  await expect(component.getByTestId('selected')).toHaveText('item-15')
  await page.mouse.move(10, 10)
  await expect(button).toHaveCSS('height', '16px')
  await button.hover()
  await page.mouse.move(10, 10)
  await button.hover()
  await expect(button).toHaveCSS('height', '32px')
})

test('keeps truncated-label tooltips outside the directory scrollport', async ({ mount }) => {
  const component = await mount(AnchorFixture, { props: { count: 22, height: 240 } })
  const button = component.locator(buttonSelector).nth(2)
  await button.hover()
  await expect(button).toHaveCSS('height', '32px')
  const tooltip = component.getByRole('tooltip')
  await expect(tooltip).toHaveText('Question 3: 发布检查内容、验证记录与回退方案')
  const panel = (await component.locator('.tr-anchor__panel').boundingBox())!
  const tip = (await tooltip.boundingBox())!
  expect(tip.x + tip.width).toBeLessThan(panel.x)
})

test('limits the directory to the visible viewport when its frame is partly offscreen', async ({ mount, page }) => {
  await page.setViewportSize({ width: 1000, height: 300 })
  const component = await mount(AnchorFixture, { props: { count: 80, height: 500 } })
  const panel = component.locator('.tr-anchor__panel')
  await expect
    .poll(async () => {
      const rect = (await panel.boundingBox())!
      return rect.y >= 0 && rect.y + rect.height <= 300
    })
    .toBe(true)
  await page.evaluate(() => window.scrollTo(0, 200))
  await expect
    .poll(async () => {
      const rect = (await panel.boundingBox())!
      return rect.y >= 0 && rect.y + rect.height <= 300
    })
    .toBe(true)
})

test('keyboard activation follows the focused item while the message current item changes', async ({ mount, page }) => {
  const component = await mount(AnchorFixture, { props: { count: 22 } })
  const buttons = component.locator(buttonSelector)
  await buttons.first().focus()
  await page.keyboard.press('ArrowDown')
  await expect(buttons.nth(1)).toBeFocused()
  await component.update({ props: { count: 22, activeIndex: 15 } })
  await page.keyboard.press('Enter')
  await expect(component.getByTestId('selected')).toHaveText('item-1')
  await page.keyboard.press('ArrowDown')
  await expect(buttons.nth(2)).toBeFocused()
  await component.update({ props: { count: 22, activeIndex: 10 } })
  await page.keyboard.press('Escape')
  await expect(buttons.nth(2)).toBeFocused()
  await expect(buttons.nth(2)).toHaveCSS('height', '16px')
})

test('expands after a 300ms hover and cancels when the pointer leaves early', async ({ mount, page }) => {
  const component = await mount(AnchorFixture, { props: { count: 3 } })
  const anchor = component.locator('.tr-anchor')
  const row = (await component.locator(buttonSelector).first().boundingBox())!
  await page.clock.install()
  await page.clock.pauseAt(new Date(Date.now() + 1000))
  const hover = () => page.mouse.move(row.x + row.width / 2, row.y + row.height / 2)

  await hover()
  await page.clock.runFor(150)
  await expect(anchor).not.toHaveClass(/is-expanded/)
  await page.mouse.move(10, 10)
  await page.clock.runFor(300)
  await expect(anchor).not.toHaveClass(/is-expanded/)

  await hover()
  await page.clock.runFor(299)
  await expect(anchor).not.toHaveClass(/is-expanded/)
  await page.clock.runFor(1)
  await expect(anchor).toHaveClass(/is-expanded/)
})
