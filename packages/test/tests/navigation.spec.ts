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
})
