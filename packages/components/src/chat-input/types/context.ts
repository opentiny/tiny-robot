import type { Ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import type { InputMode, DefaultActions, SubmitTrigger } from './base'

/**
 * Chat-Input Context
 *
 * 通过 provide/inject 在组件树中共享的状态和方法
 * 所有子组件都可以通过 inject 获取
 */
export interface ChatInputContext {
  // ===== 编辑器相关 =====

  /**
   * Tiptap 编辑器实例
   * 注意：Tiptap 的 useEditor 返回 ShallowRef<Editor | undefined>
   */
  editor: Ref<Editor | undefined>

  /**
   * 编辑器 DOM 引用
   */
  editorRef: Ref<HTMLElement | null>

  // ===== 状态相关 =====

  /**
   * 当前输入模式
   */
  mode: Ref<InputMode>

  /**
   * 是否正在自动切换模式
   * 用于控制切换时的过渡动画
   */
  isAutoSwitching: Ref<boolean>

  /**
   * 是否加载中
   */
  loading: Ref<boolean>

  /**
   * 是否禁用
   */
  disabled: Ref<boolean>

  /**
   * 是否有内容
   */
  hasContent: Ref<boolean>

  /**
   * 是否可以提交
   *
   * 综合判断：
   * - !disabled
   * - !loading
   * - hasContent
   * - !isOverLimit
   * - !defaultActions.submit?.disabled
   */
  canSubmit: Ref<boolean>

  /**
   * 是否超出字数限制
   */
  isOverLimit: Ref<boolean>

  // ===== 字数统计 =====

  /**
   * 当前字符数
   */
  characterCount: Ref<number>

  /**
   * 最大字符数限制
   */
  maxLength: Ref<number | undefined>

  // ===== 样式相关 =====

  /**
   * 组件的尺寸
   */
  size: Ref<'small' | 'normal'>

  // ===== 配置相关 =====

  /**
   * 是否显示字数限制
   */
  showWordLimit: Ref<boolean>

  /**
   * 是否显示清空按钮
   */
  clearable: Ref<boolean>

  /**
   * 默认操作按钮配置
   */
  defaultActions: Ref<DefaultActions | undefined>

  /**
   * 提交触发方式
   */
  submitType: Ref<SubmitTrigger>

  /**
   * 停止按钮文字
   */
  stopText: Ref<string | undefined>

  // ===== 方法相关 =====

  /**
   * 提交内容
   */
  submit: () => void

  /**
   * 清空内容
   */
  clear: () => void

  /**
   * 取消操作
   *
   * 在 loading 状态下触发，用于取消正在进行的操作
   */
  cancel: () => void

  /**
   * 聚焦编辑器
   */
  focus: () => void

  /**
   * 失焦编辑器
   */
  blur: () => void

  /**
   * 设置编辑器内容
   *
   * @param content - 内容（HTML 或 JSON）
   */
  setContent: (content: string) => void

  /**
   * 获取编辑器内容
   *
   * @returns 内容（HTML）
   */
  getContent: () => string
}

/**
 * Context Key
 *
 * 用于 provide/inject 的 key
 */
export const CHAT_INPUT_CONTEXT_KEY = Symbol('chat-input-context')

/**
 * useChatInputContext 返回类型
 */
export type UseChatInputContextReturn = ChatInputContext
