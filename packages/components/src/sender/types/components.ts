import type { SenderSuggestionItem } from '../extensions/suggestion/types'

// ============================================
// 组件 Props 类型
// ============================================

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
  suggestions: SenderSuggestionItem[]

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
