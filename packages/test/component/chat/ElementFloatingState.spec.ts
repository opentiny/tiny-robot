import { expect, test } from '@playwright/experimental-ct-vue'
import ElementFloatingState from './ElementFloatingState.fixture.vue'

test.use({ viewport: { width: 1280, height: 800 } })

for (const tag of ['tr-chat', 'tr-chat-ui'] as const) {
  test(`${tag} 切换布局模式保留历史阅读位置`, async ({ mount, page }) => {
    const floatingState = { placement: 'bottom-right', offsetX: 16, offsetY: 84, width: 520, height: 600 } as const
    const component = await mount(ElementFloatingState, {
      props: { tag, mode: 'normal', floatingState, withHistory: true },
    })
    const scrolling = page.locator('.chat-main-scroll-host')
    await expect.poll(() => scrolling.evaluate((element) => element.scrollHeight)).toBeGreaterThan(2000)
    await scrolling.evaluate((element) => {
      element.scrollTop = 300
      element.dispatchEvent(new Event('scroll'))
    })
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await expect(scrolling).toHaveJSProperty('scrollTop', 300)
    await component.update({ props: { tag, mode: 'floating', floatingState, withHistory: true } })
    await expect(page.locator('.tr-layout--floating')).toBeVisible()
    await expect(scrolling).toHaveJSProperty('scrollTop', 300)
  })
  test(`${tag} 普通布局切换浮窗后保留宿主提供的尺寸与位置`, async ({ mount, page }) => {
    const state = { placement: 'bottom-right', offsetX: 16, offsetY: 84, width: 520, height: 600 } as const
    const component = await mount(ElementFloatingState, { props: { tag, mode: 'normal', floatingState: state } })
    await component.update({ props: { tag, mode: 'floating', floatingState: state } })
    const floating = page.locator('.tr-layout--floating')
    await expect(floating).toHaveCSS('width', '520px')
    await expect(floating).toHaveCSS('height', '600px')
    await expect(floating).toHaveCSS('left', '744px')
    await expect(floating).toHaveCSS('top', '116px')
  })
  test(`${tag} 支持宿主控制浮窗初值与运行中更新`, async ({ mount, page }) => {
    const component = await mount(ElementFloatingState, {
      props: {
        tag,
        floatingState: { placement: 'top-left', offsetX: 24, offsetY: 32, width: 640, height: 480 },
      },
    })
    const floating = page.locator('.tr-layout--floating')
    await expect(floating).toHaveCSS('width', '640px')
    await expect(floating).toHaveCSS('height', '480px')
    await expect(floating).toHaveCSS('left', '24px')
    await expect(floating).toHaveCSS('top', '32px')

    await component.update({
      props: {
        tag,
        floatingState: { placement: 'bottom-right', offsetX: 40, offsetY: 48, width: 720, height: 500 },
      },
    })
    await expect(floating).toHaveCSS('width', '720px')
    await expect(floating).toHaveCSS('height', '500px')
    await expect(floating).toHaveCSS('left', '520px')
    await expect(floating).toHaveCSS('top', '252px')
  })
}
