import { expect, test } from '@playwright/experimental-ct-vue'
import GeminiSidebarFixture from './GeminiSidebar.fixture.vue'

test('keeps focus on the Gemini sidebar trigger across both viewport transitions', async ({ mount, page }) => {
  await page.setViewportSize({ width: 640, height: 800 })
  const demo = await mount(GeminiSidebarFixture)
  const mobileTrigger = demo.locator('.gemini-header').getByRole('button', { name: '展开边栏' })
  const desktopTrigger = demo.getByRole('complementary', { name: 'Gemini 导航' }).getByRole('button', {
    name: '展开边栏',
  })

  await demo.getByRole('button', { name: '收起边栏' }).focus()
  await page.keyboard.press('Enter')
  await expect(mobileTrigger).toBeFocused()

  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(desktopTrigger).toBeFocused()

  await page.setViewportSize({ width: 640, height: 800 })
  await expect(mobileTrigger).toBeFocused()
})
