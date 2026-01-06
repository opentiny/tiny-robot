import type { Ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import type { InputMode, SubmitTrigger } from './base'

// ============================================
// Composables 相关类型
// ============================================

/**
 * 键盘处理器接口
 */
export interface KeyboardHandlers {
  checkSubmitShortcut: (event: KeyboardEvent) => boolean
  checkNewlineShortcut: (event: KeyboardEvent) => boolean
  submit: () => void
}

/**
 * useKeyboardShortcuts Hook 参数
 */
export interface UseKeyboardShortcutsParams {
  submitType: Ref<SubmitTrigger>
  canSubmit: Ref<boolean>
  mode: Ref<InputMode>
  submit: () => void
  setMode: (mode: InputMode) => void
}

/**
 * useKeyboardShortcuts Hook 返回值
 */
export interface UseKeyboardShortcutsReturn {
  checkSubmitShortcut: (event: KeyboardEvent) => boolean
  checkNewlineShortcut: (event: KeyboardEvent) => boolean
}

/**
 * useEditor 返回类型
 */
export interface UseEditorReturn {
  /**
   * 编辑器实例
   * 注意:Tiptap 的 useEditor 返回 ShallowRef<Editor | undefined>
   */
  editor: Ref<Editor | undefined>

  /**
   * 编辑器 DOM 引用
   */
  editorRef: Ref<HTMLElement | null>
}

/**
 * useModeSwitch 返回类型
 */
export interface UseModeSwitchReturn {
  /**
   * 当前模式
   */
  currentMode: Ref<InputMode>

  /**
   * 是否正在自动切换
   */
  isAutoSwitching: Ref<boolean>

  /**
   * 设置模式
   *
   * @param mode - 输入模式
   */
  setMode: (mode: InputMode) => void

  /**
   * 检查内容溢出
   *
   * 用于自动切换模式
   */
  checkOverflow: () => void
}

/**
 * useSuggestion 返回类型
 */
export interface UseSuggestionReturn {
  /**
   * 弹窗是否可见
   */
  isPopupVisible: Ref<boolean>

  /**
   * 当前激活的建议
   */
  activeSuggestion: Ref<string>

  /**
   * 键盘导航的激活索引
   */
  activeKeyboardIndex: Ref<number>

  /**
   * 鼠标悬停的激活索引
   */
  activeMouseIndex: Ref<number>

  /**
   * 自动补全文本
   */
  autoCompleteText: Ref<string>

  /**
   * 是否显示 Tab 提示器
   */
  showTabIndicator: Ref<boolean>

  /**
   * 应用建议
   *
   * @param suggestion - 建议内容
   */
  applySuggestion: (suggestion: string) => void

  /**
   * 键盘导航
   *
   * @param direction - 方向（上/下）
   */
  navigateWithKeyboard: (direction: 'up' | 'down') => void

  /**
   * 鼠标进入
   *
   * @param index - 建议项索引
   */
  handleMouseEnter: (index: number) => void

  /**
   * 鼠标离开
   */
  handleMouseLeave: () => void

  /**
   * 关闭弹窗
   */
  closePopup: () => void
}
