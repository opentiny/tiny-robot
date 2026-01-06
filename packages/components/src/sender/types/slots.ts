/**
 * Sender 插槽作用域类型定义
 *
 * 通过插槽作用域暴露给外部组件的状态和方法
 */

import type { Editor } from '@tiptap/core'

/**
 * Sender 插槽作用域
 *
 * 通过插槽作用域暴露给外部组件的状态和方法
 * 主要为增强按钮（Upload、Voice 等）提供便捷的操作方法
 */
export interface SenderSlotScope {
  // ===== 编辑器实例 =====
  /**
   * Tiptap 编辑器实例
   * 用于高级操作
   */
  editor: Editor | undefined

  // ===== 基础操作 =====
  /**
   * 聚焦编辑器
   */
  focus: () => void

  /**
   * 失焦编辑器
   */
  blur: () => void

  // ===== 内容操作（为增强按钮设计）=====
  /**
   * 插入内容到当前光标位置
   *
   * 适用场景：语音输入、快捷短语插入
   *
   * @param content - 要插入的内容
   * @example
   * ```vue
   * <template #actions-inline="{ insert }">
   *   <VoiceButton @speech-final="insert" />
   * </template>
   * ```
   */
  insert: (content: string) => void

  /**
   * 追加内容到编辑器末尾
   *
   * 适用场景：连续语音输入、批量添加内容
   *
   * @param content - 要追加的内容
   */
  append: (content: string) => void

  /**
   * 替换编辑器全部内容
   *
   * 适用场景：模板填充、内容重置
   *
   * @param content - 新内容
   */
  replace: (content: string) => void

  // ===== 常用状态（便捷访问）=====
  /**
   * 是否禁用
   * 用于控制自定义按钮状态
   */
  disabled: boolean

  /**
   * 是否加载中
   * 用于控制按钮加载状态和禁用
   */
  loading: boolean

  /**
   * 是否有内容
   * 用于控制按钮显示/隐藏
   */
  hasContent: boolean
}
