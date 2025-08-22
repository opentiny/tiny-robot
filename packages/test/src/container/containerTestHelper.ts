import { Page, expect } from '@playwright/test'
import { createTestUtils, TestUtilsOptions } from '../../utils/test-utils'
import { CONTAINER_SELECTORS, type ContainerSelectors } from './containerSelectors'

export interface createContainerTestHelperOptions extends TestUtilsOptions {
  containerSelectors?: Partial<ContainerSelectors>
}

/**
 * 创建 Container 组件专用测试辅助工具
 */
export function createContainerTestHelper(page: Page, options: createContainerTestHelperOptions = {}) {
  const { defaultTimeout = 5000, containerSelectors = {} } = options

  // 合并默认选择器和自定义选择器
  const selectors = {
    ...CONTAINER_SELECTORS,
    ...containerSelectors,
  }

  // 创建基础测试工具实例
  const testUtils = createTestUtils(page, { defaultTimeout })

  /** 显示容器 */
  const showContainer = async () => {
    await testUtils.clickWhenVisible(selectors.showBtn)
    await testUtils.waitForElement(selectors.container)
  }

  /** 隐藏容器 */
  const hideContainer = async () => {
    await testUtils.clickWhenVisible(selectors.hideBtn)
    await testUtils.getLocator(selectors.container).waitFor({ state: 'hidden' })
  }

  /** 切换全屏模式 */
  const toggleFullscreen = async () => {
    await testUtils.clickWhenVisible(selectors.toggleFullscreenBtn)
  }

  /** 检查容器状态 */
  const expectContainerStatus = async (visible: boolean, fullscreen: boolean) => {
    await testUtils.waitForText(selectors.containerStatus, visible ? '显示' : '隐藏')
    await testUtils.waitForText(selectors.fullscreenStatus, fullscreen ? '全屏' : '普通')
  }

  /** 检查操作日志 */
  const expectLogContains = async (message: string) => {
    await testUtils.waitForText(selectors.actionLog, message)
  }

  /** 清空操作日志 */
  const clearLogs = async () => {
    await testUtils.clickWhenVisible(selectors.clearLogsBtn)
    await expectLogContains('日志已清空')
  }

  /** 检查容器可见性 */
  const expectContainerVisible = async (visible: boolean) => {
    if (visible) {
      await testUtils.getLocator(selectors.container).waitFor({ state: 'visible' })
    } else {
      await testUtils.getLocator(selectors.container).waitFor({ state: 'hidden' })
    }
  }

  /** 检查按钮状态 */
  const expectButtonStates = async (showEnabled: boolean, hideEnabled: boolean) => {
    const showBtn = testUtils.getLocator(selectors.showBtn)
    const hideBtn = testUtils.getLocator(selectors.hideBtn)

    if (showEnabled) {
      await expect(showBtn).toBeEnabled()
    } else {
      await expect(showBtn).toBeDisabled()
    }

    if (hideEnabled) {
      await expect(hideBtn).toBeEnabled()
    } else {
      await expect(hideBtn).toBeDisabled()
    }
  }

  /** 检查容器内容完整性 */
  const expectContainerContent = async () => {
    await testUtils.waitForElement(selectors.container)
    await testUtils.waitForText(selectors.containerTitle, '测试容器标题')
    await testUtils.waitForText(selectors.containerContent, '容器内容区域')
    await testUtils.waitForText(selectors.containerFooter, '容器底部区域')
  }

  /** 执行自定义操作 */
  const performCustomOperation = async () => {
    await testUtils.clickWhenVisible(selectors.customOperationBtn)
  }

  /** 执行底部操作 */
  const performFooterAction = async () => {
    await testUtils.clickWhenVisible(selectors.footerActionBtn)
  }

  /** 设置输入框值 */
  const setDemoInput = async (input: string) => {
    await testUtils.getLocator(selectors.demoInput).fill(input)
  }

  /** 检查输入值是否符合预期 */
  const expectDemoInput = async (input: string) => {
    await expect(testUtils.getLocator(selectors.demoInput)).toHaveValue(input)
  }

  /** 获取容器定位器 */
  const getContainer = () => {
    return testUtils.getLocator(selectors.container)
  }

  return {
    showContainer,
    hideContainer,
    toggleFullscreen,
    expectContainerStatus,
    expectLogContains,
    clearLogs,
    expectContainerVisible,
    expectButtonStates,
    expectContainerContent,
    performCustomOperation,
    performFooterAction,
    setDemoInput,
    expectDemoInput,
    getContainer,

    // 暴露基础测试工具
    ...testUtils,

    // 暴露选择器配置
    selectors,
  }
}
