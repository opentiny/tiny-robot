import { expect, test } from '@playwright/experimental-ct-vue'
import ElementFloatingState from './ElementFloatingState.fixture.vue'

test.use({ viewport: { width: 1280, height: 800 } })

for (const tag of ['tr-chat', 'tr-chat-ui'] as const) {
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
