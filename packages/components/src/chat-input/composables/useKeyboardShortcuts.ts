/**
 * 键盘快捷键管理
 *
 * 职责：
 * - 检查键盘事件是否匹配提交快捷键
 * - 处理模式切换逻辑
 */

import type { UseKeyboardShortcutsParams, UseKeyboardShortcutsReturn } from '../index.type'

/**
 * 键盘快捷键 Hook
 *
 * 提供统一的键盘快捷键逻辑
 */
export function useKeyboardShortcuts(params: UseKeyboardShortcutsParams): UseKeyboardShortcutsReturn {
  const { submitType, mode, setMode } = params

  /**
   * 检查是否为指定的提交快捷键
   *
   * @param event - 键盘事件
   * @returns 是否触发提交
   *
   * 提交行为说明：
   * - 当 submitType 为 'enter' 时：按 Enter 键提交（不带修饰键）
   * - 当 submitType 为 'ctrlEnter' 时：按 Ctrl+Enter 或 Cmd+Enter 提交，单独按 Enter 换行
   * - 当 submitType 为 'shiftEnter' 时：按 Shift+Enter 提交，单独按 Enter 换行
   */
  const checkSubmitShortcut = (event: KeyboardEvent): boolean => {
    const isEnter = event.key === 'Enter'
    if (!isEnter) return false

    switch (submitType.value) {
      case 'enter':
        // Enter 提交：不能有任何修饰键
        return !event.shiftKey && !event.ctrlKey && !event.metaKey
      case 'ctrlEnter':
        // Ctrl+Enter 或 Cmd+Enter 提交
        return (event.ctrlKey || event.metaKey) && !event.shiftKey
      case 'shiftEnter':
        // Shift+Enter 提交
        return event.shiftKey && !event.ctrlKey && !event.metaKey
      default:
        return false
    }
  }

  /**
   * 处理 Shift+Enter 在单行模式下的行为
   *
   * 单行模式下，按 Shift+Enter 应该切换到多行模式并插入换行符
   * 但有一个例外：如果 submitType 是 'shiftEnter'，则不切换模式，而是提交
   *
   * @param event - 键盘事件
   * @returns 是否已处理（true 表示已处理，阻止默认行为）
   */
  const handleShiftEnterInSingleMode = (event: KeyboardEvent): boolean => {
    // 只处理 Shift+Enter
    if (event.key !== 'Enter' || !event.shiftKey) {
      return false
    }

    // 只在单行模式下处理
    if (mode.value !== 'single') {
      return false
    }

    // 如果 submitType 是 'shiftEnter'，则不处理（让提交逻辑处理）
    if (submitType.value === 'shiftEnter') {
      return false
    }

    // 切换到多行模式
    setMode('multiple')

    // 返回 false，让 Tiptap 自动处理换行
    return false
  }

  return {
    checkSubmitShortcut,
    handleShiftEnterInSingleMode,
  }
}
