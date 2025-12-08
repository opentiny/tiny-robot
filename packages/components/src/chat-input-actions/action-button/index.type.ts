import { Component, VNode } from 'vue'

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

export interface ActionButtonProps {
  icon: VNode | Component
  disabled?: boolean
  active?: boolean
  tooltip?: string
  tooltipPlacement?: TooltipPlacement
  size?: string | number
}
