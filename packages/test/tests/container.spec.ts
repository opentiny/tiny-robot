import { test, expect } from '@playwright/test'

test.describe('Container 组件测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到测试页面
    await page.goto('/')
    // 点击 Container 组件链接
    await page.click('text=Container 组件')
    // 等待页面加载完成
    await expect(page.locator('h2')).toContainText('Container 组件测试')
  })

  test('应该正确显示初始状态', async ({ page }) => {
    // 检查初始状态
    await expect(page.getByTestId('container-status')).toHaveText('隐藏')
    await expect(page.getByTestId('fullscreen-status')).toHaveText('普通')

    // 检查按钮状态
    await expect(page.getByTestId('show-container-btn')).toBeEnabled()
    await expect(page.getByTestId('hide-container-btn')).toBeDisabled()

    // 容器应该不可见
    await expect(page.getByTestId('test-container')).not.toBeVisible()
  })

  test('应该能够显示和隐藏容器', async ({ page }) => {
    // 显示容器
    await page.click('[data-testid="show-container-btn"]')

    // 检查状态更新
    await expect(page.getByTestId('container-status')).toHaveText('显示')
    await expect(page.getByTestId('test-container')).toBeVisible()

    // 检查按钮状态
    await expect(page.getByTestId('show-container-btn')).toBeDisabled()
    await expect(page.getByTestId('hide-container-btn')).toBeEnabled()

    // 检查日志
    await expect(page.getByTestId('action-log')).toContainText('容器显示')

    // 隐藏容器
    await page.click('[data-testid="hide-container-btn"]')

    // 检查状态更新
    await expect(page.getByTestId('container-status')).toHaveText('隐藏')
    await expect(page.getByTestId('test-container')).not.toBeVisible()

    // 检查日志
    await expect(page.getByTestId('action-log')).toContainText('容器隐藏')
  })

  test('应该能够切换全屏模式', async ({ page }) => {
    // 先显示容器
    await page.click('[data-testid="show-container-btn"]')
    await expect(page.getByTestId('test-container')).toBeVisible()

    // 切换到全屏模式
    await page.click('[data-testid="toggle-fullscreen-btn"]')

    // 检查状态更新
    await expect(page.getByTestId('fullscreen-status')).toHaveText('全屏')
    await expect(page.getByTestId('toggle-fullscreen-btn')).toHaveText('退出全屏')

    // 检查日志
    await expect(page.getByTestId('action-log')).toContainText('进入全屏模式')
  })

  test('应该正确显示容器内容', async ({ page }) => {
    // 显示容器
    await page.click('[data-testid="show-container-btn"]')
    await expect(page.getByTestId('test-container')).toBeVisible()

    // 检查标题
    await expect(page.getByTestId('container-title')).toHaveText('测试容器标题')

    // 检查内容区域
    await expect(page.getByTestId('container-content')).toBeVisible()
    await expect(page.getByTestId('container-content')).toContainText('容器内容区域')

    // 检查底部区域
    await expect(page.getByTestId('container-footer')).toBeVisible()
    await expect(page.getByTestId('container-footer')).toContainText('容器底部区域')
  })

  test('应该能够处理自定义操作', async ({ page }) => {
    // 显示容器
    await page.click('[data-testid="show-container-btn"]')
    await expect(page.getByTestId('test-container')).toBeVisible()

    // 点击自定义操作按钮
    await page.click('[data-testid="custom-operation-btn"]')

    // 检查日志
    await expect(page.getByTestId('action-log')).toContainText('执行了自定义操作')
  })

  test('应该能够处理底部操作', async ({ page }) => {
    // 显示容器
    await page.click('[data-testid="show-container-btn"]')
    await expect(page.getByTestId('test-container')).toBeVisible()

    // 点击底部操作按钮
    await page.click('[data-testid="footer-action-btn"]')

    // 检查日志
    await expect(page.getByTestId('action-log')).toContainText('执行了底部操作')
  })

  test('应该能够在容器内进行交互', async ({ page }) => {
    // 显示容器
    await page.click('[data-testid="show-container-btn"]')
    await expect(page.getByTestId('test-container')).toBeVisible()

    // 在输入框中输入内容
    const testInput = '测试输入内容'
    await page.fill('[data-testid="demo-input"]', testInput)

    // 检查输入值显示
    await expect(page.getByTestId('demo-input-value')).toContainText(`输入值: ${testInput}`)
  })

  test('应该能够使用容器内置的关闭按钮', async ({ page }) => {
    // 显示容器
    await page.click('[data-testid="show-container-btn"]')
    await expect(page.getByTestId('test-container')).toBeVisible()

    // 点击容器内置的关闭按钮（通过 Container 组件提供的关闭图标）
    // 这里需要根据实际的 Container 组件结构来定位关闭按钮
    const closeButton = page.locator('.tr-container__header-operations').locator('button').last()
    await closeButton.click()

    // 检查容器是否隐藏
    await expect(page.getByTestId('test-container')).not.toBeVisible()
    await expect(page.getByTestId('container-status')).toHaveText('隐藏')
  })

  test('应该能够使用容器内置的全屏切换按钮', async ({ page }) => {
    // 显示容器
    await page.click('[data-testid="show-container-btn"]')
    await expect(page.getByTestId('test-container')).toBeVisible()

    // 点击容器内置的全屏切换按钮
    const fullscreenButton = page.getByTestId('test-container').getByRole('button').nth(1)
    await fullscreenButton.click()

    // 检查全屏状态
    await expect(page.getByTestId('fullscreen-status')).toHaveText('全屏')

    // 再次点击退出全屏
    await fullscreenButton.click()
    await expect(page.getByTestId('fullscreen-status')).toHaveText('普通')
  })

  test('应该能够清空操作日志', async ({ page }) => {
    // 显示容器以产生一些日志
    await page.click('[data-testid="show-container-btn"]')

    // 检查日志存在
    await expect(page.getByTestId('action-log')).toContainText('容器显示')

    // 清空日志
    await page.click('[data-testid="clear-logs-btn"]')

    // 检查日志被清空（应该只剩下"日志已清空"这一条）
    const logItems = page.locator('[data-testid^="log-item-"]')
    await expect(logItems).toHaveCount(1)
    await expect(page.getByTestId('log-item-0')).toContainText('日志已清空')
  })

  test('应该能够正确处理拖拽条的显示', async ({ page }) => {
    // 显示容器
    await page.click('[data-testid="show-container-btn"]')
    await expect(page.getByTestId('test-container')).toBeVisible()

    // 检查拖拽条是否存在
    const draggingBar = page.locator('.tr-container__dragging-bar')
    await expect(draggingBar).toBeVisible()

    // 检查拖拽条的样式
    await expect(draggingBar).toHaveCSS('cursor', 'grab')
  })

  test('应该在不同屏幕尺寸下正确显示', async ({ page }) => {
    // 测试移动设备尺寸
    await page.setViewportSize({ width: 375, height: 667 })

    // 显示容器
    await page.click('[data-testid="show-container-btn"]')
    await expect(page.getByTestId('test-container')).toBeVisible()

    // 检查容器在小屏幕下的显示
    const container = page.getByTestId('test-container')
    await expect(container).toBeVisible()

    // 切换到桌面尺寸
    await page.setViewportSize({ width: 1920, height: 1080 })

    // 容器应该仍然可见
    await expect(container).toBeVisible()
  })
})
