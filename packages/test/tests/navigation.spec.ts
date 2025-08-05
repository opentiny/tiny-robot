import { test, expect } from '@playwright/test'

test.describe('应用导航测试', () => {
  test('应该正确显示首页', async ({ page }) => {
    await page.goto('/')

    // 检查页面标题
    await expect(page).toHaveTitle('Tiny Robot E2E Test App')

    // 检查主标题
    await expect(page.locator('h1')).toHaveText('Tiny Robot E2E Test App')

    // 检查首页内容
    await expect(page.locator('h2')).toHaveText('欢迎使用 Tiny Robot E2E 测试应用')
  })

  test('应该能够在不同页面间导航', async ({ page }) => {
    await page.goto('/')

    // 检查导航链接存在
    await expect(page.locator('nav a[href="/"]')).toBeVisible()
    await expect(page.locator('nav a[href="/container"]')).toBeVisible()

    // 点击 Container 组件链接
    await page.click('text=Container 组件')

    // 检查页面内容变化
    await expect(page.locator('h2')).toHaveText('Container 组件测试')

    // 返回首页
    await page.click('text=首页')

    // 检查回到首页
    await expect(page.locator('h2')).toHaveText('欢迎使用 Tiny Robot E2E 测试应用')
  })

  test('导航链接应该有正确的样式', async ({ page }) => {
    await page.goto('/')

    const navLinks = page.locator('nav a')

    // 检查链接数量
    await expect(navLinks).toHaveCount(2)

    // 检查链接样式
    for (let i = 0; i < 2; i++) {
      const link = navLinks.nth(i)
      await expect(link).toHaveCSS('text-decoration', 'none')
      await expect(link).toHaveCSS('border', '1px solid rgb(221, 221, 221)')
    }
  })

  test('应用应该具有响应式布局', async ({ page }) => {
    await page.goto('/')

    // 测试桌面尺寸
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('#app')).toBeVisible()

    // 测试平板尺寸
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('#app')).toBeVisible()

    // 测试手机尺寸
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('#app')).toBeVisible()

    // 检查导航在小屏幕下的显示
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })
})
