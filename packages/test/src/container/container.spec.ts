import { test, expect, type Page } from '@playwright/test'
import { createContainerTestHelper } from './containerTestHelper'

test.describe('Container 组件测试', () => {
  let helper: ReturnType<typeof createContainerTestHelper>

  test.beforeEach(async ({ page }: { page: Page }) => {
    // 导航到测试页面
    await page.goto('/')
    // 点击 Container 组件链接
    await page.click('text=Container 组件')
    // 等待页面加载完成
    await expect(page.locator('h2')).toContainText('Container 组件测试')

    // 创建测试辅助实例
    helper = createContainerTestHelper(page)
  })

  test('应该正确显示初始状态', async () => {
    // 检查初始状态
    await helper.expectContainerStatus(false, false)

    // 检查按钮状态
    await helper.expectButtonStates(true, false)

    // 容器应该不可见
    await helper.expectContainerVisible(false)
  })

  test('应该能够显示和隐藏容器', async () => {
    // 显示容器
    await helper.showContainer()

    // 检查状态更新
    await helper.expectContainerStatus(true, false)

    // 检查按钮状态
    await helper.expectButtonStates(false, true)

    // 检查日志
    await helper.expectLogContains('容器显示')

    // 隐藏容器
    await helper.hideContainer()

    // 检查状态更新
    await helper.expectContainerStatus(false, false)

    // 检查日志
    await helper.expectLogContains('容器隐藏')
  })

  test('应该能够切换全屏模式', async () => {
    // 先显示容器
    await helper.showContainer()
    await helper.expectContainerVisible(true)

    // 切换到全屏模式
    await helper.toggleFullscreen()

    // 检查状态更新
    await helper.expectContainerStatus(true, true)

    // 检查日志
    await helper.expectLogContains('进入全屏模式')
  })

  test('应该正确显示容器内容', async () => {
    // 显示容器
    await helper.showContainer()
    await helper.expectContainerVisible(true)

    // 检查容器内容
    await helper.expectContainerContent()
  })

  test('应该能够处理自定义操作', async () => {
    // 显示容器
    await helper.showContainer()
    await helper.expectContainerVisible(true)

    // 点击自定义操作按钮
    await helper.performCustomOperation()

    // 检查日志
    await helper.expectLogContains('执行了自定义操作')
  })

  test('应该能够处理底部操作', async () => {
    // 显示容器
    await helper.showContainer()
    await helper.expectContainerVisible(true)

    // 点击底部操作按钮
    await helper.performFooterAction()

    // 检查日志
    await helper.expectLogContains('执行了底部操作')
  })

  test('应该能够在容器内进行交互', async () => {
    // 显示容器
    await helper.showContainer()
    await helper.expectContainerVisible(true)

    // 在输入框中输入内容
    const testInput = '测试输入内容'
    await helper.setDemoInput(testInput)

    // 检查输入值显示
    await helper.expectDemoInput(testInput)
  })

  test('应该能够使用容器内置的关闭按钮', async () => {
    // 显示容器
    await helper.showContainer()
    await helper.expectContainerVisible(true)

    // 点击容器内置的关闭按钮（通过 Container 组件提供的关闭图标）
    // 这里需要根据实际的 Container 组件结构来定位关闭按钮
    const closeButton = helper.getContainer().locator('.tr-container__header-operations').locator('button').last()
    await closeButton.click()

    // 检查容器是否隐藏
    await helper.expectContainerVisible(false)
    await helper.expectContainerStatus(false, false)
  })

  test('应该能够使用容器内置的全屏切换按钮', async () => {
    // 显示容器
    await helper.showContainer()
    await helper.expectContainerVisible(true)

    // 点击容器内置的全屏切换按钮
    const fullscreenButton = helper.getContainer().getByRole('button').nth(1)
    await fullscreenButton.click()

    // 检查全屏状态
    await helper.expectContainerStatus(true, true)

    // 再次点击退出全屏
    await fullscreenButton.click()

    // 检查全屏状态
    await helper.expectContainerStatus(true, false)
  })

  test('应该能够清空操作日志', async () => {
    // 显示容器以产生一些日志
    await helper.showContainer()
    await helper.expectContainerVisible(true)

    // 检查日志存在
    await helper.expectLogContains('容器显示')

    // 清空日志
    await helper.clearLogs()

    // 检查日志被清空（应该只剩下"日志已清空"这一条）
    await helper.expectLogContains('日志已清空')
  })

  test('应该能够正确处理拖拽条的显示', async () => {
    // 显示容器
    await helper.showContainer()
    await helper.expectContainerVisible(true)

    // 检查拖拽条是否存在
    const draggingBar = helper.getContainer().locator('.tr-container__dragging-bar')
    await expect(draggingBar).toBeVisible()

    // 检查拖拽条的样式
    await expect(draggingBar).toHaveCSS('cursor', 'grab')
  })

  test('应该在不同屏幕尺寸下正确显示', async ({ page }: { page: Page }) => {
    // 测试移动设备尺寸
    await page.setViewportSize({ width: 375, height: 667 })

    // 显示容器
    await helper.showContainer()
    await helper.expectContainerVisible(true)

    // 检查容器在小屏幕下的显示
    const container = helper.getContainer()
    await expect(container).toBeVisible()

    // 切换到桌面尺寸
    await page.setViewportSize({ width: 1920, height: 1080 })

    // 容器应该仍然可见
    await expect(container).toBeVisible()
  })
})
