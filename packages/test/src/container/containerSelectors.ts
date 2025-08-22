/**
 * Container 组件相关的选择器常量
 */

export const CONTAINER_SELECTORS = {
  // 主要按钮选择器
  showBtn: '[data-testid="show-container-btn"]',
  hideBtn: '[data-testid="hide-container-btn"]',
  toggleFullscreenBtn: '[data-testid="toggle-fullscreen-btn"]',

  // 容器相关选择器
  container: '[data-testid="test-container"]',
  containerStatus: '[data-testid="container-status"]',
  fullscreenStatus: '[data-testid="fullscreen-status"]',

  // 日志相关选择器
  actionLog: '[data-testid="action-log"]',
  clearLogsBtn: '[data-testid="clear-logs-btn"]',

  // 输入相关选择器
  demoInput: '[data-testid="demo-input"]',
  demoInputValue: '[data-testid="demo-input-value"]',

  // 容器内部元素选择器
  containerTitle: '[data-testid="container-title"]',
  containerContent: '[data-testid="container-content"]',
  containerFooter: '[data-testid="container-footer"]',
  containerDraggingBar: '.tr-container__dragging-bar',
  containerHeaderOperations: '.tr-container__header-operations',

  // 自定义操作按钮选择器
  customOperationBtn: '[data-testid="custom-operation-btn"]',
  footerActionBtn: '[data-testid="footer-action-btn"]',
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
