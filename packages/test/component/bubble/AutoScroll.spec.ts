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

  test('does not scroll on the initial resize when scrollOnMount is false', async ({ mount }) => {
    const component = await mount(AutoScrollFixture)

    await expect(component.getByTestId('no-mount-scroll')).toHaveJSProperty('scrollTop', 0)
  })
})
