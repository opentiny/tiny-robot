import { test, expect, type Page } from '@playwright/test'
import { createContainerTestHelper } from './testHelper'

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

  test('Props: show - 应该正确控制容器显示和隐藏', async () => {
    // 初始状态：容器应该不可见
    await helper.expectContainerVisible(false)

    // 显示容器
    await helper.showContainer()
    await helper.expectContainerVisible(true)

    // 隐藏容器
    await helper.hideContainer()
    await helper.expectContainerVisible(false)
  })

  test('Props: fullscreen - 应该正确控制全屏模式', async () => {
    // 显示容器
    await helper.showContainer()
    await helper.expectContainerVisible(true)

    // 初始状态：非全屏
    await helper.expectContainerFullscreen(false)

    // 切换到全屏模式
    await helper.clickWhenVisible(helper.selectors.toggleFullscreenBtn)
    await helper.expectContainerFullscreen(true)
  })

  test('Props: title - 应该支持 title 属性（当未使用 title 插槽时）', async () => {
    // 注意：当前演示组件使用了 title 插槽，所以 title 属性不会显示
    // 这个测试验证组件结构是否正确
    await helper.showContainer()

    // 验证标题区域存在
    const headerElement = helper.getContainer().locator('.tr-container__header')
    await expect(headerElement).toBeVisible()
  })

  test('Slots: title - 应该正确显示标题插槽内容', async () => {
    await helper.showContainer()

    // 检查标题插槽内容
    await helper.expectTitleSlot('测试容器标题')
  })

  test('Slots: default - 应该正确显示默认插槽内容', async () => {
    await helper.showContainer()

    // 检查默认插槽内容
    await helper.expectDefaultSlot('容器内容区域')
  })

  test('Slots: operations - 应该正确显示操作插槽内容', async () => {
    await helper.showContainer()

    // 检查操作插槽内容
    await helper.expectOperationsSlot()

    // 测试操作插槽中的按钮功能
    await helper.clickCustomOperation()
  })

  test('Slots: footer - 应该正确显示底部插槽内容', async () => {
    await helper.showContainer()

    // 检查底部插槽内容
    await helper.expectFooterSlot('容器底部区域')
  })

  test('Emits: close - 应该正确触发关闭事件', async () => {
    // 显示容器
    await helper.showContainer()
    await helper.expectContainerVisible(true)

    // 使用容器内置关闭按钮关闭容器
    await helper.closeContainerByInternalBtn()

    // 验证容器已关闭
    await helper.expectContainerVisible(false)
  })

  test('内置功能: 全屏切换按钮', async () => {
    await helper.showContainer()
    await helper.expectContainerVisible(true)

    // 初始状态：非全屏
    await helper.expectContainerFullscreen(false)

    // 使用内置全屏按钮切换到全屏
    await helper.toggleFullscreenByInternalBtn()
    await helper.expectContainerFullscreen(true)

    // 使用内置全屏按钮退出全屏
    await helper.toggleFullscreenByInternalBtn()
    await helper.expectContainerFullscreen(false)
  })
})
