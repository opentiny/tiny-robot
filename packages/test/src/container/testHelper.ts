import { Page, expect } from '@playwright/test'
import { createTestUtils, TestUtilsOptions } from '../test-utils'
import { CONTAINER_SELECTORS, type ContainerSelectors } from './selectors'

export interface createContainerTestHelperOptions extends TestUtilsOptions {
  containerSelectors?: Partial<ContainerSelectors>
}

/**
 * 创建 Container 组件专用测试辅助工具
 */
export function createContainerTestHelper(page: Page, options: createContainerTestHelperOptions = {}) {
  const { defaultTimeout = 2000, containerSelectors = {}, ...restTestUtilsOptions } = options

  // 合并默认选择器和自定义选择器
  const selectors = {
    ...CONTAINER_SELECTORS,
    ...containerSelectors,
  }

  // 创建基础测试工具实例
  const testUtils = createTestUtils(page, { defaultTimeout, ...restTestUtilsOptions })

  /** 显示容器 */
  const showContainer = async () => {
    await testUtils.clickWhenVisible(selectors.toggleShowBtn)
  }

  /** 隐藏容器 */
  const hideContainer = async () => {
    await testUtils.clickWhenVisible(selectors.toggleShowBtn)
  }

  /** 切换全屏模式 */
  const toggleFullscreen = async () => {
    const container = testUtils.getLocator(selectors.container)
    const classAttr = await container.getAttribute('class')
    const wasFullscreen = classAttr?.includes('fullscreen') || false

    await testUtils.clickWhenVisible(selectors.toggleFullscreenBtn)

    // 等待状态变化
    if (wasFullscreen) {
      await expect(container).not.toHaveClass(/fullscreen/)
    } else {
      await expect(container).toHaveClass(/fullscreen/)
    }
  }

  /** 使用容器内置关闭按钮关闭容器 */
  const closeContainerByInternalBtn = async () => {
    await testUtils.clickWhenVisible(selectors.containerCloseBtn)
    await testUtils.getLocator(selectors.container).waitFor({ state: 'hidden' })
  }

  /** 使用容器内置全屏按钮切换全屏 */
  const toggleFullscreenByInternalBtn = async () => {
    await testUtils.clickWhenVisible(selectors.containerFullscreenBtn)
  }

  /** 检查容器可见性 */
  const expectContainerVisible = async (visible: boolean) => {
    await testUtils.getLocator(selectors.container).waitFor({ state: visible ? 'visible' : 'hidden' })
  }

  /** 检查容器是否为全屏状态 */
  const expectContainerFullscreen = async (isFullscreen: boolean) => {
    const container = testUtils.getLocator(selectors.container)
    // 等待状态变化
    await page.waitForTimeout(50)
    if (isFullscreen) {
      await expect(container).toHaveClass(/fullscreen/)
    } else {
      await expect(container).not.toHaveClass(/fullscreen/)
    }
  }

  /** 检查容器标题插槽内容 */
  const expectTitleSlot = async (expectedText: string) => {
    await testUtils.waitForText(selectors.containerTitle, expectedText)
  }

  /** 检查容器默认插槽内容 */
  const expectDefaultSlot = async (expectedText: string) => {
    await testUtils.waitForText(selectors.containerContent, expectedText)
  }

  /** 检查容器底部插槽内容 */
  const expectFooterSlot = async (expectedText: string) => {
    await testUtils.waitForText(selectors.containerFooterContent, expectedText)
  }

  /** 检查操作插槽内容 */
  const expectOperationsSlot = async () => {
    await testUtils.waitForElement(selectors.customOperationBtn)
  }

  /** 点击自定义操作按钮 */
  const clickCustomOperation = async () => {
    await testUtils.clickWhenVisible(selectors.customOperationBtn)
  }

  /** 获取容器定位器 */
  const getContainer = () => {
    return testUtils.getLocator(selectors.container)
  }

  return {
    // 容器显示/隐藏操作
    showContainer,
    hideContainer,
    toggleFullscreen,
    closeContainerByInternalBtn,
    toggleFullscreenByInternalBtn,

    // 容器状态检查
    expectContainerVisible,
    expectContainerFullscreen,

    // 插槽内容检查
    expectTitleSlot,
    expectDefaultSlot,
    expectFooterSlot,
    expectOperationsSlot,

    // 交互操作
    clickCustomOperation,

    // 工具方法
    getContainer,

    // 暴露基础测试工具
    ...testUtils,

    // 暴露选择器配置
    selectors,
  }
}
