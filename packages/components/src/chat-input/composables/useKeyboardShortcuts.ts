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
  const { submitType } = params

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
   * 检查是否为换行键（非提交键）
   *
   * @param event - 键盘事件
   * @returns 是否为换行键
   *
   * 换行键说明：
   * - submitType 为 'enter' 时：Shift+Enter 或 Ctrl+Enter
   * - submitType 为 'ctrlEnter' 时：Enter（不带修饰键）
   * - submitType 为 'shiftEnter' 时：Enter（不带修饰键）
   */
  const checkNewlineShortcut = (event: KeyboardEvent): boolean => {
    if (event.key !== 'Enter') return false

    switch (submitType.value) {
      case 'enter':
        return event.shiftKey || event.ctrlKey || event.metaKey
      case 'ctrlEnter':
      case 'shiftEnter':
        return !event.shiftKey && !event.ctrlKey && !event.metaKey
      default:
        return false
    }
  }

  return {
    checkSubmitShortcut,
    checkNewlineShortcut,
  }
}
