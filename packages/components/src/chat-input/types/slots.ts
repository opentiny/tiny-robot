/**
 * ChatInput 插槽作用域类型定义
 *
 * 通过插槽作用域暴露给外部组件的状态和方法
 */

import type { Editor } from '@tiptap/core'

/**
 * ChatInput 插槽作用域
 *
 * 通过插槽作用域暴露给外部组件的状态和方法
 */
export interface ChatInputSlotScope {
  /**
   * 编辑器实例
   */
  editor: Editor | undefined

  /**
   * 聚焦编辑器
   */
  focus: () => void

  /**
   * 失焦编辑器
   */
  blur: () => void

  /**
   * 插入内容到编辑器
   * @param content - 要插入的内容（文本或 HTML）
   */
  insert: (content: string) => void

  /**
   * 追加内容到编辑器末尾
   * @param content - 要追加的内容
   */
  append: (content: string) => void

  /**
   * 替换编辑器全部内容
   * @param content - 新内容
   */
  replace: (content: string) => void

  /**
   * 获取编辑器内容
   */
  getContent: () => string

  /**
   * 清空编辑器
   */
  clear: () => void

  /**
   * 是否禁用
   */
  disabled: boolean

  /**
   * 是否加载中
   */
  loading: boolean

  /**
   * 是否有内容
   */
  hasContent: boolean

  /**
   * 当前字符数
   */
  characterCount: number
}
