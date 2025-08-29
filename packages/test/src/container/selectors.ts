/**
 * Container 组件相关的选择器常量
 */

export const CONTAINER_SELECTORS = {
  // 主要控制按钮选择器
  toggleShowBtn: '[data-testid="toggle-show-btn"]',
  toggleFullscreenBtn: '[data-testid="toggle-fullscreen-btn"]',

  // 容器相关选择器
  container: '[data-testid="test-container"]',
  containerDraggingBar: '.tr-container__dragging-bar',
  containerHeader: '.tr-container__header',
  containerHeaderOperations: '.tr-container__header-operations',
  containerFooter: '.tr-container__footer',

  // 容器内置按钮选择器
  containerCloseBtn: '.tr-container__header-operations button:last-child',
  containerFullscreenBtn: '.tr-container__header-operations button:nth-last-child(2)',

  // 插槽内容选择器
  containerTitle: '[data-testid="container-title"]',
  containerContent: '[data-testid="container-content"]',
  containerFooterContent: '[data-testid="container-footer"]',
  customOperationBtn: '[data-testid="custom-operation-btn"]',
} as const

/**
 * 容器选择器的类型定义
 */
export type ContainerSelectors = typeof CONTAINER_SELECTORS

/**
 * 获取选择器值的辅助函数
 */
export function getContainerSelector(key: keyof ContainerSelectors): string {
  return CONTAINER_SELECTORS[key]
}

/**
 * 默认的容器选择器配置
 * 用于测试工具的默认值
 */
export const DEFAULT_CONTAINER_SELECTORS = CONTAINER_SELECTORS
