import type { VNode, Component } from 'vue'
import type { TooltipPlacement } from './base'
import type { SuggestionItem } from '../extensions/suggestion/types'

// ============================================
// 组件 Props 类型
// ============================================

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
  tooltip?: string

  /**
   * Tooltip 位置
   */
  tooltipPlacement?: TooltipPlacement

  /**
   * 按钮大小
   */
  size?: string | number
}

/**
 * WordCounter Props
 */
export interface WordCounterProps {
  /**
   * 当前字符数
   */
  current: number

  /**
   * 最大字符数
   */
  max: number

  /**
   * 是否超出限制
   */
  isOverLimit: boolean
}

/**
 * SuggestionList Props
 */
export interface SuggestionListProps {
  /**
   * 是否显示
   */
  show: boolean

  /**
   * 建议列表
   */
  suggestions: SuggestionItem[]

  /**
   * 键盘激活索引
   */
  activeKeyboardIndex: number

  /**
   * 鼠标激活索引
   */
  activeMouseIndex: number

  /**
   * 输入值
   */
  inputValue: string

  /**
   * 弹窗样式
   */
  popupStyle?: Record<string, string | number>
}

/**
 * SuggestionList Emits
 */
export interface SuggestionListEmits {
  /**
   * 选择建议
   *
   * @param suggestion - 建议内容
   */
  (e: 'select', suggestion: string): void

  /**
   * 鼠标进入
   *
   * @param index - 索引
   */
  (e: 'mouse-enter', index: number): void

  /**
   * 鼠标离开
   */
  (e: 'mouse-leave'): void
}
