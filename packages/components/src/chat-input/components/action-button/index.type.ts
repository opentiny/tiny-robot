import { Component, VNode } from 'vue'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface ActionButtonProps {
  icon: VNode | Component
  disabled?: boolean
  active?: boolean
  tooltip?: string
  tooltipPlacement?: TooltipPlacement
  size?: string | number
}
