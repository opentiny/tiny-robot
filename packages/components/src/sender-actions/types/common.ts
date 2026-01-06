import type { VNode, Component } from 'vue'
import type { TooltipContent } from './tooltip'

// 统一从 common 导入
export type { TooltipContent } from './tooltip'

/**
 * Tooltip 位置
 *
 * 支持 TinyTooltip 的所有位置选项
 */
export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

/**
 * ActionButton Props
 *
 * 基础操作按钮的 Props
 */
export interface ActionButtonProps {
  /**
   * 按钮图标
   */
  icon: VNode | Component

  /**
   * 是否禁用
   */
  disabled?: boolean

  /**
   * 是否激活状态
   */
  active?: boolean

  /**
   * 工具提示
   */
  tooltip?: TooltipContent

  /**
   * Tooltip 位置
   */
  tooltipPlacement?: TooltipPlacement

  /**
   * 按钮大小
   */
  size?: string | number
}
