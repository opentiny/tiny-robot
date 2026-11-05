import { expect, test } from '@playwright/experimental-ct-vue'
import ChatAnchorFixture from './ChatAnchor.fixture.vue'

for (const { width, messageCount = 44 } of [
  { width: 420 },
  { width: 756 },
  { width: 1100 },
  { width: 756, messageCount: 3 },
]) {
  test(`centers the right-hand directory vertically with ${messageCount} messages in a ${width}px Chat container`, async ({
    mount,
    page,
  }) => {
    const component = await mount(ChatAnchorFixture, { props: { width, messageCount } })
    const anchor = component.locator('.tr-anchor')
    const messages = component.locator('.chat-main-scroll-host')
    const directory = component.locator('.tr-anchor__overlay')
    await expect(anchor).toBeVisible()
    await expect(component.locator('.tr-anchor__item[aria-current]')).toHaveCount(1)

    await expect(component.locator('.tr-bubble__avatar')).toHaveCount(messageCount)
    const centerOffset = async () => {
      const overlay = (await directory.boundingBox())!
      const list = (await messages.boundingBox())!
      return Math.abs(overlay.y + overlay.height / 2 - (list.y + list.height / 2))
    }
    const scrollbar = component.locator('.tr-layout-proxy-scrollbar')
    let scrollbarLeft: number | undefined
    if (messageCount > 3) {
      await messages.hover()
      await expect(scrollbar).toHaveClass(/tr-layout-proxy-scrollbar--visible/)
      scrollbarLeft = (await scrollbar.boundingBox())!.x
    }
    const compact = (await directory.boundingBox())!
    if (scrollbarLeft !== undefined) expect(compact.x + compact.width).toBeLessThan(scrollbarLeft)
    expect(compact.x).toBeGreaterThanOrEqual((await messages.boundingBox())!.x + (await messages.boundingBox())!.width)
    await expect.poll(centerOffset).toBeLessThanOrEqual(1)
    const initialWidth = await messages.evaluate((el) => el.clientWidth)
    const initialContentHeight = await messages.evaluate((el) => el.scrollHeight)

    const buttons = component.locator('.tr-anchor__item')
    await buttons.first().hover()
    await expect(buttons.first()).toHaveCSS('height', '32px')
    expect(await messages.evaluate((el) => el.clientWidth)).toBe(initialWidth)
    expect(await messages.evaluate((el) => el.scrollHeight)).toBe(initialContentHeight)
    await expect.poll(centerOffset).toBeLessThanOrEqual(1)
    const expanded = (await directory.boundingBox())!
    if (scrollbarLeft !== undefined) expect(expanded.x + expanded.width).toBeLessThan(scrollbarLeft)
    expect(expanded.width).toBeGreaterThan(compact.width)
    expect(expanded.x + expanded.width).toBeCloseTo(compact.x + compact.width, 0)
    const frame = (await component.locator('.chat-panel').boundingBox())!
    expect(expanded.x).toBeGreaterThanOrEqual(frame.x)
    expect(expanded.width).toBeLessThanOrEqual(Math.min(240, frame.width * 0.4) + 1)

    await buttons.first().focus()
    await page.keyboard.press('End')
    await expect(buttons.last()).toBeFocused()
    await page.keyboard.press('Enter')
    await expect.poll(() => component.locator('.tr-layout__main').evaluate((el) => el.scrollTop)).toBe(0)
    await component.update({ props: { width: 360, height: 300, messageCount } })
    await expect.poll(() => messages.evaluate((el) => el.clientWidth)).toBe(initialWidth + 360 - width)
    await expect.poll(centerOffset).toBeLessThanOrEqual(1)
    await page.setViewportSize({ width: 760, height: 600 })
    await expect(anchor).toHaveCount(0)
    await page.setViewportSize({ width: 1280, height: 720 })
    await expect(component.locator('.tr-anchor')).toBeVisible()
  })
}

test('uses the configured hover delay for the Chat directory', async ({ mount, page }) => {
  const component = await mount(ChatAnchorFixture, { props: { hoverExpandDelay: 600 } })
  const anchor = component.locator('.tr-anchor')
  const current = component.locator('.tr-anchor__item[aria-current]')
  await expect(current).toHaveCount(1)
  const row = (await current.boundingBox())!
  await page.clock.install()
  await page.clock.pauseAt(new Date(Date.now() + 1000))
  await page.mouse.move(row.x + row.width / 2, row.y + row.height / 2)
  await page.clock.runFor(300)
  await expect(anchor).not.toHaveClass(/is-expanded/)
  await page.clock.runFor(300)
  await expect(anchor).toHaveClass(/is-expanded/)
})
