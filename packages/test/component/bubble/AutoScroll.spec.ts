import { expect, test } from '@playwright/experimental-ct-vue'
import type { Locator } from '@playwright/test'
import AutoScrollFixture from './AutoScroll.fixture.vue'

const distanceToBottom = (scroller: Locator) =>
  scroller.evaluate((element) => element.scrollHeight - element.clientHeight - element.scrollTop)

const expectAtBottom = async (scroller: Locator) => {
  await expect.poll(() => distanceToBottom(scroller)).toBeLessThanOrEqual(1)
}

test.describe('useAutoScroll', () => {
  test('follows repeated large content growth while at the bottom', async ({ mount }) => {
    const component = await mount(AutoScrollFixture)
    const scroller = component.getByTestId('observed-scroll')

    await expectAtBottom(scroller)
    await component.getByRole('button', { name: 'Grow observed content' }).click()
    await expectAtBottom(scroller)
    await component.getByRole('button', { name: 'Grow observed content' }).click()
    await expectAtBottom(scroller)
  })

  test('preserves the reading position after the user scrolls upward', async ({ mount }) => {
    const component = await mount(AutoScrollFixture)
    const scroller = component.getByTestId('observed-scroll')

    await expectAtBottom(scroller)
    await scroller.evaluate((element) => {
      element.scrollTop = element.scrollHeight - element.clientHeight - 100
      element.dispatchEvent(new Event('scroll'))
    })
    await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBe(200)
    const before = await scroller.evaluate((element) => element.scrollTop)

    await component.getByRole('button', { name: 'Grow observed content' }).click()
    await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBe(before)
  })

  test('stays away from the bottom when the user interrupts a smooth scroll', async ({ mount, page }) => {
    const component = await mount(AutoScrollFixture)
    const scroller = component.getByTestId('observed-scroll')

    await expectAtBottom(scroller)
    await component.getByRole('button', { name: 'Grow observed content' }).click()
    await component.getByRole('button', { name: 'Grow observed content' }).click()
    await expectAtBottom(scroller)
    await scroller.evaluate((element) => {
      element.scrollTop = 0
      element.dispatchEvent(new Event('scroll'))
    })
    await component.getByRole('button', { name: 'Smooth scroll to bottom' }).click()
    await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
    await scroller.hover()
    await page.mouse.wheel(0, -1000)
    await scroller.evaluate(() => new Promise((resolve) => setTimeout(resolve, 500)))

    await expect.poll(() => distanceToBottom(scroller)).toBeGreaterThan(20)
  })

  test('resumes preserved following intent when re-enabled', async ({ mount }) => {
    const component = await mount(AutoScrollFixture)
    const scroller = component.getByTestId('observed-scroll')

    await expectAtBottom(scroller)
    await component.getByRole('button', { name: 'Toggle auto scroll' }).click()
    await component.getByRole('button', { name: 'Grow observed content' }).click()
    await expect.poll(() => distanceToBottom(scroller)).toBeGreaterThan(100)
    await component.getByRole('button', { name: 'Toggle auto scroll' }).click()
    await expectAtBottom(scroller)
  })

  test('keeps the deprecated source signature when the target ref also has a scrollRef property', async ({ mount }) => {
    const component = await mount(AutoScrollFixture)
    const scroller = component.getByTestId('legacy-scroll')

    await expectAtBottom(scroller)
    await component.getByRole('button', { name: 'Grow legacy content' }).click()
    await expectAtBottom(scroller)
  })

  test('preserves an initial non-bottom position when scrollOnMount is false', async ({ mount }) => {
    const component = await mount(AutoScrollFixture)
    const scroller = component.getByTestId('no-mount-scroll')
    const observedScroller = component.getByTestId('observed-scroll')

    await expect(scroller).toHaveJSProperty('scrollTop', 0)
    await component.getByRole('button', { name: 'Grow observed content' }).click()
    await expectAtBottom(observedScroller)
    await expect(scroller).toHaveJSProperty('scrollTop', 0)
  })

  test('follows content that mounts after the scroll root', async ({ mount }) => {
    const component = await mount(AutoScrollFixture)
    const scroller = component.getByTestId('delayed-scroll')

    await component.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
    )
    await component.getByRole('button', { name: 'Mount delayed content' }).click()
    await expect(component.getByTestId('delayed-content')).toHaveCSS('height', '520px')
    await expectAtBottom(scroller)
  })
})
